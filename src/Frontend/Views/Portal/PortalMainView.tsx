import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import styled from "styled-components";

import { MapInfoView } from "./MapInfoView";

export function PortalMainView() {
  const roundConfig =
    "0x568297442f966cc66f2be7ced683e35ea2ca1e68b4f26dd5424158244da40bcc";

  return (
    <Switch>
      <Redirect
        path="/portal/home"
        to={`/portal/map/${roundConfig}`}
        exact={true}
      />
      <Route path={"/portal/map/:configHash"} component={MapInfoView} />
    </Switch>
  );
}

export const MinimalButton = styled.button`
  border-radius: 3px;
  padding: 8px;
  background: #252525;
  color: #fff;
  text-transform: uppercase;
`;
