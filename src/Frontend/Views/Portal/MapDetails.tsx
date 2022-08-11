import { Leaderboard, LiveMatch } from "@dfdao/types";
import React, { useEffect, useState } from "react";
import { loadArenaLeaderboard } from "../../../Backend/Network/GraphApi/ArenaLeaderboardApi";
import {
  GraphConfigPlayer,
  loadEloLeaderboard,
} from "../../../Backend/Network/GraphApi/EloLeaderboardApi";
import { loadLiveMatches } from "../../../Backend/Network/GraphApi/SpyApi";
import { LoadedRound } from "../../../_types/global/GlobalTypes";
import { Subber } from "../../Components/Text";
import { LobbyInitializers } from "../../Panes/Lobby/Reducer";
import {
  ArenaLeaderboardDisplay,
  EloLeaderboardDisplay,
} from "../Leaderboards/ArenaLeaderboard";
import { LiveMatches } from "../Leaderboards/LiveMatches";
import { TabbedView } from "../TabbedView";
import { FindMatch } from "./FindMatch";

declare const LIGHTFOREST_CONFIG: LoadedRound;

export function MapDetails({
  configHash,
  config,
}: {
  configHash: string | undefined;
  config: LobbyInitializers | undefined;
}) {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | undefined>();
  const [eloLeaderboard, setEloLeaderboard] = useState<
    GraphConfigPlayer[] | undefined
  >();
  const [leaderboardError, setLeaderboardError] = useState<Error | undefined>();
  const [liveMatches, setLiveMatches] = useState<LiveMatch | undefined>();
  const [liveMatchError, setLiveMatchError] = useState<Error | undefined>();

  const numSpawnPlanets =
    config?.ADMIN_PLANETS.filter((p) => p.isSpawnPlanet).length ?? 0;
  const hasWhitelist = config?.WHITELIST_ENABLED ?? true;

  const startTime = new Date(LIGHTFOREST_CONFIG.round.START_TIME).getTime();
  const endTime = new Date(LIGHTFOREST_CONFIG.round.END_TIME).getTime();
  useEffect(() => {
    setLeaderboard(undefined);
    setLiveMatches(undefined);
    if (configHash) {
      if (numSpawnPlanets > 1) {
        loadEloLeaderboard(configHash, numSpawnPlanets > 1)
          .then((board) => {
            setLeaderboardError(undefined);
            setEloLeaderboard(board);
          })
          .catch((e) => setLeaderboardError(e));
      } else {
        loadArenaLeaderboard(configHash, numSpawnPlanets > 1 ? true : false)
          .then((board: Leaderboard) => {
            setLeaderboardError(undefined);
            setLeaderboard(board);
          })
          .catch((e) => setLeaderboardError(e));
      }
      loadLiveMatches(configHash)
        .then((matches) => {
          setLiveMatchError(undefined);
          setLiveMatches(matches);
        })
        .catch((e) => {
          console.log(e);
          setLiveMatchError(e);
        });
    }
  }, [configHash, numSpawnPlanets]);

  return (
    <div
      style={{
        display: "flex",
        flexShrink: 1,
        flexDirection: "column",
        height: "100%",
        flex: "1 1 50%",
        width: "50%",
        maxWidth: "50%",
        maxHeight: "100vh",
        overflowY: "auto",
      }}
    >
      <TabbedView
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          // flex: '1 1 50%',
          width: "100%",
          maxHeight: "100vh",
          overflowY: "auto",
        }}
        startSelected={numSpawnPlanets >= 2 ? 1 : 0}
        tabTitles={[
          "Leaderboard",
          numSpawnPlanets > 1 ? "Join a Match" : "Live Games",
        ]}
        tabContents={(i) => {
          if (i === 0) {
            return numSpawnPlanets > 1 ? (
              <EloLeaderboardDisplay
                leaderboard={eloLeaderboard}
                error={leaderboardError}
              />
            ) : (
              <ArenaLeaderboardDisplay
                leaderboard={leaderboard}
                error={leaderboardError}
                startTime={startTime / 1000}
                endTime={endTime / 1000}
                goldScore={LIGHTFOREST_CONFIG.round.GOLD_RANK}
                silverScore={LIGHTFOREST_CONFIG.round.GOLD_RANK}
                bronzeScore={LIGHTFOREST_CONFIG.round.BRONZE_RANK}
              />
            );
          }
          if (i === 1) {
            if (numSpawnPlanets > 1 && !hasWhitelist) {
              return <FindMatch game={liveMatches} />;
            } else {
              return (
                <>
                  <LiveMatches game={liveMatches} error={liveMatchError} />{" "}
                  <Subber style={{ textAlign: "end" }}>
                    by{" "}
                    <a href={"https://twitter.com/bulmenisaurus"}>
                      Bulmenisaurus
                    </a>
                  </Subber>
                </>
              );
            }
          }
        }}
      />
    </div>
  );
}
