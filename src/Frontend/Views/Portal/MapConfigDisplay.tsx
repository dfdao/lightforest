import React from "react";
import { LoadingSpinner } from "../../Components/LoadingSpinner";
import { LobbyInitializers } from "../../Panes/Lobby/Reducer";
import { ConfigDetails } from "./ConfigDetails";

interface MapConfigDisplayProps {
  config: LobbyInitializers | undefined;
}

export const MapConfigDisplay: React.FC<MapConfigDisplayProps> = ({
  config,
}) => {
  if (!config) {
    return (
      <div lf-map-config-container="">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <div lf-map-config-container="">
      <div lf-map-config-header="" className="lf-row">
        <span className="lf-subtitle">Config Details</span>
        <span lf-config-scroll-text="">Scroll for more {`↓`}</span>
      </div>
      <ConfigDetails config={config} />
    </div>
  );
};
