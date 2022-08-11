import React from "react";
import { LoadedRound } from "../../../_types/global/GlobalTypes";
import "../../Styles/lightforest.scss";
import { useConfigFromHash } from "../../Utils/AppHooks";
import { Account } from "./Account";
import { ConfigDetails } from "./ConfigDetails";
import { MapDetails2 } from "./MapDetails2";
import { PortalMap } from "./PortalMap";

declare const LIGHTFOREST_CONFIG: LoadedRound;

export const PortalHome: React.FC<{}> = ({}) => {
  const configHash = LIGHTFOREST_CONFIG.round.CONFIG_HASH;
  const { config, lobbyAddress, error } = useConfigFromHash(configHash);

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
          <span lf-subtitle="">Config Details</span>
          <ConfigDetails config={config} truncateFirst={3} />
        </div>
      </div>
    </div>
  );
};
