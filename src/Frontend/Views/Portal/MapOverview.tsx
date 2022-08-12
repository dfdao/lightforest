import React, { useEffect, useMemo, useState } from "react";

import { formatDuration } from "../../Utils/TimeUtils";
import { LoadingSpinner } from "../../Components/LoadingSpinner";
import { Minimap } from "../../Components/Minimap";
import {
  generateMinimapConfig,
  MinimapConfig,
} from "../../Panes/Lobby/MinimapUtils";
import { Link } from "react-router-dom";
import { getConfigName } from "@dfdao/procedural";
import { debounce } from "lodash";
import { LoadedRound } from "../../../_types/global/GlobalTypes";
import { LobbyInitializers } from "../../Panes/Lobby/Reducer";
import { EthAddress } from "@dfdao/types";

type RoundStatus = "not started" | "started" | "ended";
declare const LIGHTFOREST_CONFIG: LoadedRound;

export const MapOverview: React.FC<{
  configHash: string;
  config: LobbyInitializers;
  lobbyAddress?: EthAddress;
}> = ({ configHash, lobbyAddress, config }) => {
  const endTime = new Date(LIGHTFOREST_CONFIG.round.END_TIME).getTime();
  const startTime = new Date(LIGHTFOREST_CONFIG.round.START_TIME).getTime();
  const description = LIGHTFOREST_CONFIG.round.DESCRIPTION;

  const [status, setStatus] = useState<RoundStatus>("not started");
  const [countdown, setCountdown] = useState<number>();
  const [minimapConfig, setMinimapConfig] = useState<
    MinimapConfig | undefined
  >();
  const [mapName, setMapName] = useState<string>(
    configHash ? getConfigName(configHash) : "No map found"
  );

  const onMapChange = useMemo(() => {
    return debounce(
      (config: MinimapConfig) => configHash && setMinimapConfig(config),
      500
    );
  }, [setMinimapConfig, configHash]);

  useEffect(() => {
    if (config) {
      const name = configHash ? getConfigName(configHash) : "No map found";
      setMapName(name);
      onMapChange(generateMinimapConfig(config, 4));
    } else {
      setMinimapConfig(undefined);
      setMapName("No map found");
    }
  }, [config, onMapChange, setMapName, configHash]);

  useEffect(() => {
    const update = () => {
      const now = Date.now();

      if (now > endTime) {
        setStatus("ended");
        setCountdown(1);
        return;
      }
      if (now < startTime) {
        setStatus("not started");
        const msWait = startTime - now;
        setCountdown(msWait);
        return;
      }

      const msWait = endTime - now;

      setStatus("started");
      setCountdown(msWait);
    };

    const interval = setInterval(() => {
      update();
    }, 1000);

    return () => clearInterval(interval);
  }, [status, countdown, endTime, startTime]);

  const { innerHeight } = window;
  let mapSize = "300px";
  if (innerHeight < 700) {
    mapSize = "300px";
  }

  return (
    <div lf-map-overview="">
      <div lf-map-content="" className="lf-row">
        <div lf-map-text-content="" className="lf-stack">
          <span lf-map-round-name="">{mapName ?? "Map name"}</span>
          <span className="lf-title">{LIGHTFOREST_CONFIG.round.TITLE}</span>
          <span style={{ width: "66%" }}>{description}</span>
          <div lf-map-actions="">
            <Link target="blank" to={`/play/${lobbyAddress}?create=true`}>
              <button lf-play-button="" disabled={status !== "started"}>
                Play Round
              </button>
            </Link>
            {countdown && (
              <span lf-round-countdown="">
                {status == "ended"
                  ? "Round over!"
                  : status == "not started"
                  ? `Round starts in ${formatDuration(countdown)} `
                  : `Round ends in ${formatDuration(countdown)} `}
              </span>
            )}
          </div>
        </div>

        {!minimapConfig ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "300px",
              height: "300px",
            }}
          >
            <LoadingSpinner initialText="Loading..." />
          </div>
        ) : (
          <div lf-map-overview-minimap-container="" className="lf-center">
            <Minimap
              style={{ width: mapSize, height: mapSize }}
              minimapConfig={minimapConfig}
              setRefreshing={() => {
                // do nothing
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
