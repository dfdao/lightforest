import React from "react";
import { LobbyInitializers } from "../../Panes/Lobby/Reducer";
import { ConfigDetails } from "./ConfigDetails";

interface MapConfigDisplayProps {
  config: LobbyInitializers;
}

export const MapConfigDisplay: React.FC<MapConfigDisplayProps> = ({
  config,
}) => {
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
