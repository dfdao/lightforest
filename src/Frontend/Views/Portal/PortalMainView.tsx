import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import { Account } from "./Account";

import { MapInfoView } from "./MapInfoView";

export function PortalMainView() {
  const roundConfig =
    "0x568297442f966cc66f2be7ced683e35ea2ca1e68b4f26dd5424158244da40bcc";

  return (
    <MainContainer>
      <TopBar>
        <Account />
      </TopBar>
      <Switch>
        <Redirect
          path="/portal/home"
          to={`/portal/map/${roundConfig}`}
          exact={true}
        />
        <Route path={"/portal/map/:configHash"} component={MapInfoView} />
      </Switch>
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
