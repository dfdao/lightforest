import React, { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { Account } from "./Account";
import { getConfigName } from "@dfdao/procedural";
import { EthAddress } from "@dfdao/types";
import _ from "lodash";
import { Link } from "react-router-dom";
import { MythicLabelText } from "../../Components/Labels/MythicLabel";
import { LoadingSpinner } from "../../Components/LoadingSpinner";
import { LobbyButton } from "../../Components/LobbyButton";
import { Minimap } from "../../Components/Minimap";
import {
  generateMinimapConfig,
  MinimapConfig,
} from "../../Panes/Lobby/MinimapUtils";
import { LobbyInitializers } from "../../Panes/Lobby/Reducer";
import { useConfigFromHash } from "../../Utils/AppHooks";

import { MapDetails } from "./MapDetails";
import { formatDuration } from "../../Utils/TimeUtils";
import { LoadedRound } from "../../../_types/global/GlobalTypes";

declare const LIGHTFOREST_CONFIG: LoadedRound;

const NONE = "no map found";

type RoundStatus = "not started" | "started" | "ended";
function MapOverview({
  configHash,
  config,
  lobbyAddress,
}: {
  configHash: string | undefined;
  config: LobbyInitializers | undefined;
  lobbyAddress: EthAddress | undefined;
}) {
  const endTime = new Date(LIGHTFOREST_CONFIG.round.END_TIME).getTime();
  const startTime = new Date(LIGHTFOREST_CONFIG.round.START_TIME).getTime();

  const [status, setStatus] = useState<RoundStatus>("not started");
  const [countdown, setCountdown] = useState<number>();
  const [minimapConfig, setMinimapConfig] = useState<
    MinimapConfig | undefined
  >();
  const [mapName, setMapName] = useState<string>(
    configHash ? getConfigName(configHash) : NONE
  );

  const onMapChange = useMemo(() => {
    return _.debounce(
      (config: MinimapConfig) => configHash && setMinimapConfig(config),
      500
    );
  }, [setMinimapConfig, configHash]);

  useEffect(() => {
    if (config) {
      const name = configHash ? getConfigName(configHash) : NONE;
      setMapName(name);
      onMapChange(generateMinimapConfig(config, 4));
    } else {
      setMinimapConfig(undefined);
      setMapName(NONE);
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
  }, [status, countdown]);
  const { innerHeight } = window;
  let mapSize = "500px";
  if (innerHeight < 700) {
    mapSize = "300px";
  }

  return (
    <OverviewContainer>
      <div style={{ textAlign: "center" }}>
        <MythicLabelText text={LIGHTFOREST_CONFIG.round.TITLE} />
        <MapTitle>{mapName}</MapTitle>
        {countdown && (
          <div>
            {status == "ended"
              ? "Round over!"
              : status == "not started"
              ? `Round starts in ${formatDuration(countdown)} `
              : `Round ends in ${formatDuration(countdown)} `}
          </div>
        )}
      </div>

      {!minimapConfig ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "500px",
            height: "500px",
          }}
        >
          <LoadingSpinner initialText="Loading..." />
        </div>
      ) : (
        <Minimap
          style={{ width: mapSize, height: mapSize }}
          minimapConfig={minimapConfig}
          setRefreshing={() => {
            // do nothing
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Link
          style={{ minWidth: "250px" }}
          target="blank"
          to={`/play/${lobbyAddress}?create=true`}
        >
          <LobbyButton disabled={status !== "started"} primary>
            Play Round
          </LobbyButton>
        </Link>
      </div>
    </OverviewContainer>
  );
}

function MapInfoView({}) {
  const configHash = LIGHTFOREST_CONFIG.round.CONFIG_HASH;
  const { config, lobbyAddress, error } = useConfigFromHash(configHash);

  return (
    <MapInfoContainer>
      {error ? (
        <div>Map Not Found</div>
      ) : (
        config && (
          <>
            <MapOverview
              configHash={configHash}
              config={config}
              lobbyAddress={lobbyAddress}
            />
            <MapDetails configHash={configHash} config={config} />
          </>
        )
      )}
    </MapInfoContainer>
  );
}

export function PortalMainView() {
  return (
    <MainContainer>
      <TopBar>
        <Account />
      </TopBar>
      <MapInfoView />
    </MainContainer>
  );
}

const MainContainer = styled.div`
  display: flex;
  flex: 1 1;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
`;

const TopBar = styled.div`
  height: 56px;
  max-height: 56px;
  display: grid;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  padding: 16px;
`;

const MapInfoContainer = styled.div`
  display: flex;
  flex: 1 1;
  flex-direction: row;
  height: 100%;
  width: 100%;
  justify-content: space-evenly;
  padding: 10px;
  overflow: hidden;
`;

const OverviewContainer = styled.div`
  flex: 1 1 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const Title = styled.div`
  display: flex;
  text-align: center;
  font-size: 3em;
  white-space: nowrap;
  justify-content: center;
`;

const MapTitle = styled(Title)`
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;
