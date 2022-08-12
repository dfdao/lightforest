import React from "react";
import { LoadedRound } from "../../../_types/global/GlobalTypes";
import { LoadingSpinner } from "../../Components/LoadingSpinner";
import "../../Styles/lightforest.scss";
import { useConfigFromHash } from "../../Utils/AppHooks";
import { Account } from "./Account";
import { MapConfigDisplay } from "./MapConfigDisplay";
import { MapDetails } from "./MapDetails";
import { MapOverview } from "./MapOverview";

declare const LIGHTFOREST_CONFIG: LoadedRound;

export const PortalHome = ({}) => {
  const configHash = LIGHTFOREST_CONFIG.round.CONFIG_HASH;
  const { config, lobbyAddress, error } = useConfigFromHash(configHash);

  if (error) return <div>Couldn't load map.</div>;

  if (!config) {
    return (
      <div lf-root="">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div lf-root="">
      <div lf-top-bar="">
        <span className="lf-subtitle">
          {LIGHTFOREST_CONFIG.round.ORG_NAME ?? "Light Forest"}
        </span>
        <Account />
      </div>
      <div lf-content="">
        <MapOverview
          configHash={configHash}
          lobbyAddress={lobbyAddress}
          config={config}
        />
        <div lf-map-details="">
          <MapDetails configHash={configHash} config={config} />
          <MapConfigDisplay config={config} />
        </div>
      </div>
    </div>
  );
};
