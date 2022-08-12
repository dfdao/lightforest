import React, { useState } from "react";
import { LoadedRound } from "../../../_types/global/GlobalTypes";
import "../../Styles/lightforest.scss";
import { useConfigFromHash } from "../../Utils/AppHooks";
import { Account } from "./Account";
import { ConfigDetails } from "./ConfigDetails";
import { MapDetails2 } from "./MapDetails2";
import { PortalMap } from "./PortalMap";

declare const LIGHTFOREST_CONFIG: LoadedRound;

export const PortalHome = ({}) => {
  const configHash = LIGHTFOREST_CONFIG.round.CONFIG_HASH;
  const { config, lobbyAddress, error } = useConfigFromHash(configHash);

  const [toTruncate, setToTruncate] = useState<number | undefined>(3);

  if (error || !config) return <div>Couldn't load map.</div>;

  return (
    <div lf-root="">
      <div lf-top-bar="">
        <span>277Dao</span>
        <Account />
      </div>
      <div lf-map-content="">
        <PortalMap
          configHash={configHash}
          lobbyAddress={lobbyAddress}
          config={config}
        />
        <div lf-map-details="">
          <MapDetails2 configHash={configHash} config={config} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "auto",
            }}
          >
            <div lf-map-config-details-header="">
              <span lf-subtitle="">Config Details</span>
              <span
                lf-config-expand=""
                onClick={() => {
                  if (toTruncate) {
                    setToTruncate(undefined);
                  } else {
                    setToTruncate(3);
                  }
                }}
              >
                {`${toTruncate ? "View" : "Hide"} more config details ${`->`}`}
              </span>
            </div>
            <ConfigDetails config={config} truncateFirst={toTruncate} />
          </div>
        </div>
      </div>
    </div>
  );
};
