import { Leaderboard } from "@dfdao/types";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { GraphConfigPlayer } from "../../../Backend/Network/GraphApi/EloLeaderboardApi";
import { calculateScore, getRank, Rank } from "../../../Backend/Utils/Rank";
import { Gnosis, Star, Twitter } from "../../Components/Icons";
import { Red, Subber } from "../../Components/Text";
import { TextPreview } from "../../Components/TextPreview";
import dfstyles from "../../Styles/dfstyles";
import {
  useArenaLeaderboard,
  useEloLeaderboard,
  useTwitters,
} from "../../Utils/AppHooks";
import { roundEndTimestamp, roundStartTimestamp } from "../../Utils/constants";
import { formatDuration } from "../../Utils/TimeUtils";
import { GenericErrorBoundary } from "../GenericErrorBoundary";
import { SortableTable } from "../SortableTable";
import { Table } from "../Table";

const errorMessage = "Error Loading Leaderboard";

export function ArenaLeaderboardWithData({ config }: { config: string }) {
  const { arenaLeaderboard, arenaError } = useArenaLeaderboard(false, config);
  return (
    <ArenaLeaderboardDisplay
      leaderboard={arenaLeaderboard}
      error={arenaError}
    />
  );
}

export function ArenaLeaderboardDisplay({
  leaderboard,
  error,
  startTime,
  endTime,
  goldScore,
  silverScore,
  bronzeScore,
}: {
  leaderboard: Leaderboard | undefined;
  error: Error | undefined;
  startTime?: number;
  endTime?: number;
  goldScore?: number | undefined;
  silverScore?: number | undefined;
  bronzeScore?: number | undefined;
}) {
  return (
    <GenericErrorBoundary errorMessage={errorMessage}>
      <LeaderboardContainer>
        <StatsTableContainer>
          <StatsTable>
            {/* <CountDown /> */}
            <ArenasCreated leaderboard={leaderboard} error={error} />
          </StatsTable>
        </StatsTableContainer>
        {/* <Spacer height={8} /> */}
        <ArenaLeaderboardBody
          leaderboard={leaderboard}
          error={error}
          startTime={startTime}
          endTime={endTime}
          goldScore={goldScore}
          silverScore={silverScore}
          bronzeScore={bronzeScore}
        />
      </LeaderboardContainer>
    </GenericErrorBoundary>
  );
}

export function EloLeaderboardWithData({ config }: { config: string }) {
  const { eloLeaderboard, eloError } = useEloLeaderboard(false, config);
  return (
    <EloLeaderboardDisplay leaderboard={eloLeaderboard} error={eloError} />
  );
}

export function EloLeaderboardDisplay({
  leaderboard,
  error,
  totalPlayers = true,
}: {
  leaderboard: GraphConfigPlayer[] | undefined;
  error: Error | undefined;
  totalPlayers?: boolean;
}) {
  console.log(leaderboard);
  return (
    <GenericErrorBoundary errorMessage={errorMessage}>
      <LeaderboardContainer>
        <StatsTableContainer>
          <StatsTable>
            {/* <CountDown /> */}
            {totalPlayers && (
              <TotalPlayers leaderboard={leaderboard} error={error} />
            )}
          </StatsTable>
        </StatsTableContainer>
        {/* <Spacer height={8} /> */}
        <EloLeaderboardBody leaderboard={leaderboard} error={error} />
      </LeaderboardContainer>
    </GenericErrorBoundary>
  );
}

function scoreToTime(score?: number | null) {
  if (score === null || score === undefined) {
    return "n/a";
  }
  score = Math.floor(score);

  const seconds = String(score % 60).padStart(2, "0");
  const minutes = String(Math.floor(score / 60) % 60).padStart(2, "0");
  const hours = String(Math.min(99, Math.floor(score / 3600))).padStart(2, "0");

  return hours + ":" + minutes + ":" + seconds;
}

// pass in either an address, or a twitter handle. this function will render the appropriate
// component
export function compPlayerToEntry(
  playerAddress: string,
  playerTwitter: string | undefined,
  color: string | undefined = `${dfstyles.colors.text}`
) {
  return (
    <Link
      to={`/portal/account/${playerAddress}`}
      style={{
        textDecoration: "underline",
        fontWeight: "bolder",
      }}
      target="_blank"
    >
      {playerTwitter ? (
        `@${playerTwitter}`
      ) : (
        <TextPreview
          style={{ textDecoration: "underline" }}
          disabled
          text={playerAddress}
          focusedWidth={"130px"}
          unFocusedWidth={"130px"}
        />
      )}
    </Link>
  );
}

function getRankStar(rank: number) {
  const gold =
    "invert(73%) sepia(29%) saturate(957%) hue-rotate(354deg) brightness(100%) contrast(95%)";
  const purple =
    "invert(39%) sepia(54%) saturate(6205%) hue-rotate(264deg) brightness(100%) contrast(103%)";
  if (rank < 6) {
    return (
      <Star
        width={"20px"}
        height={"20px"}
        color={rank == 0 ? gold : purple}
      ></Star>
    );
  }
  return <></>;
}

interface Row {
  address: string;
  twitter: string | undefined;
  time: number | undefined;
  moves: number | undefined;
  score: number;
}

interface EloRow {
  address: string;
  twitter: string | undefined;
  score: number | undefined;
  wins: number;
  losses: number;
}

function ArenasCreated({
  leaderboard,
  error,
}: {
  leaderboard: Leaderboard | undefined;
  error: Error | undefined;
}) {
  if (error) {
    return (
      <LeaderboardContainer>
        <Red>{errorMessage}</Red>
      </LeaderboardContainer>
    );
  }
  if (leaderboard) {
    return (
      <tbody style={{ fontSize: "1.25em" }}>
        <tr>
          <td>Total Players</td>
          <td>{leaderboard.length}</td>
        </tr>
      </tbody>
    );
  } else {
    return <></>;
  }
}

function TotalPlayers({
  leaderboard,
  error,
}: {
  leaderboard: GraphConfigPlayer[] | undefined;
  error: Error | undefined;
}) {
  if (error) {
    return (
      <LeaderboardContainer>
        <Red>{errorMessage}</Red>
      </LeaderboardContainer>
    );
  }
  if (leaderboard) {
    return (
      <tbody style={{ fontSize: "1.25em" }}>
        <tr>
          <td>Total matches</td>
          <td>{leaderboard.length}</td>
        </tr>
      </tbody>
    );
  } else {
    return <></>;
  }
}

function ArenaLeaderboardTable({
  rows,
  ranks,
}: {
  rows: Row[];
  ranks: {
    goldScore: number | undefined;
    silverScore: number | undefined;
    bronzeScore: number | undefined;
  };
}) {
  if (rows.length == 0) return <Subber>No players finished</Subber>;
  function getRankColor([rank, score]: [number, number | undefined]) {
    if (score === undefined || score === null) {
      return dfstyles.colors.subtext;
    }

    const playerRank = getRank(score, ranks);
    if (playerRank == Rank.GOLD) {
      return dfstyles.colors.dfgold;
    }
    if (playerRank == Rank.SILVER) return dfstyles.colors.dfsilver;

    if (playerRank == Rank.BRONZE) return dfstyles.colors.dfbronze;

    return dfstyles.colors.subtext;
  }
  const sortFunctions = [
    (_a: Row, _b: Row): number => 0,
    (_a: Row, _b: Row): number => 0,
    (_a: Row, _b: Row): number => 0,
    (_a: Row, _b: Row): number => 0,
    (a: Row, b: Row): number => {
      if (a.time && b.time) {
        return a.time - b.time;
      }
      return 0;
    },
    (a: Row, b: Row): number => {
      if (a.moves && b.moves) {
        return a.moves - b.moves;
      }
      return 0;
    },
  ];
  return (
    <TableContainer>
      <SortableTable
        sortFunctions={sortFunctions}
        alignments={["r", "l", "c", "c", "r", "r", "r"]}
        headers={[
          // <Cell key='star'></Cell>,
          <Cell key="rank"></Cell>,
          <Cell key="name"></Cell>,
          <Cell key="twitter"></Cell>,
          <Cell key="gnosis"></Cell>,
          <Cell key="time">Time</Cell>,
          <Cell key="moves">Moves</Cell>,
          <Cell key="score">Score</Cell>,
        ]}
        rows={rows}
        columns={[
          (
            row: Row,
            i //rank
          ) => (
            <Cell>
              {row.time === undefined ||
              row.moves === undefined ||
              row.time === null ||
              row.moves === null
                ? "unranked"
                : i + 1 + "."}
            </Cell>
          ),
          (row: Row, i) => {
            // name
            const color = getRankColor([i, row.score]);
            return (
              <Cell style={{ color: color }}>
                {compPlayerToEntry(row.address, row.twitter)}
              </Cell>
            );
          },
          (row: Row, i) => {
            // twitter
            const color = getRankColor([i, row.score]);
            return (
              <Cell style={{ color: color }}>
                {row.twitter && (
                  <a
                    style={{ display: "flex", alignItems: "center" }}
                    target="_blank"
                    href={`https://twitter.com/${row.twitter}`}
                  >
                    <Twitter width="24px" height="24px" />
                  </a>
                )}
              </Cell>
            );
          },
          (row: Row, i) => {
            // gnosis
            const color = getRankColor([i, row.score]);
            return (
              <Cell style={{ color: color }}>
                {" "}
                <a
                  style={{ display: "flex", alignItems: "center" }}
                  target="_blank"
                  href={`https://blockscout.com/xdai/optimism/address/${row.address}`}
                >
                  <GnoButton>
                    <Gnosis width="24px" height="24px" />
                  </GnoButton>
                </a>
              </Cell>
            );
          },
          (row: Row, i) => {
            const color = getRankColor([i, row.score]);
            // score
            return (
              <Cell style={{ color: color }}>{scoreToTime(row.score)}</Cell>
            );
          },
          (row: Row, i) => {
            const color = getRankColor([i, row.score]);
            return <Cell style={{ color: color }}>{row.moves}</Cell>;
          },
          (row: Row, i) => {
            const color = getRankColor([i, row.score]);
            return <Cell style={{ color: color }}>{row.score}</Cell>;
          },
        ]}
      />
    </TableContainer>
  );
}

function ArenaLeaderboardBody({
  leaderboard,
  error,
  startTime,
  endTime,
  goldScore,
  silverScore,
  bronzeScore,
}: {
  leaderboard: Leaderboard | undefined;
  error: Error | undefined;
  startTime: number | undefined;
  endTime: number | undefined;
  goldScore: number | undefined;
  silverScore: number | undefined;
  bronzeScore: number | undefined;
}) {
  if (error) {
    return (
      <LeaderboardContainer>
        <Red>{errorMessage}</Red>
      </LeaderboardContainer>
    );
  }

  if (leaderboard == undefined) {
    return <Subber>Leaderboard loading...</Subber>;
  }

  leaderboard.entries.sort((a, b) => {
    if (typeof a.score !== "number" && typeof b.score !== "number") {
      return 0;
    } else if (typeof a.score !== "number") {
      return 1;
    } else if (typeof b.score !== "number") {
      return -1;
    }

    return a.score - b.score;
  });

  const arenaRows: Row[] = leaderboard.entries.reduce((total, curr) => {
    if (startTime && startTime > curr.startTime) return total;
    if (endTime && endTime < curr.startTime) return total;
    return [
      ...total,
      {
        address: curr.ethAddress,
        twitter: curr.twitter,
        time: curr.time,
        moves: curr.moves,
        score: calculateScore({ time: curr.time, moves: curr.moves }),
      },
    ];
  }, []);

  return (
    <ArenaLeaderboardTable
      rows={arenaRows}
      ranks={{
        goldScore: goldScore,
        silverScore: silverScore,
        bronzeScore: bronzeScore,
      }}
    />
  );
}

function EloLeaderboardTable({ rows }: { rows: EloRow[] }) {
  if (rows.length == 0) return <Subber>No players finished</Subber>;
  return (
    <TableContainer>
      <Table
        alignments={["r", "l", "c", "c", "r", "r"]}
        headers={[
          // <Cell key='star'></Cell>,
          <Cell key="rank"></Cell>,
          <Cell key="name"></Cell>,
          <Cell key="twitter"></Cell>,
          <Cell key="gnosis"></Cell>,
          <Cell key="score">Elo</Cell>,
          <Cell key="W/L">W/L</Cell>,
        ]}
        rows={rows}
        columns={[
          // (row: Row, i) => getRankStar(i), //star
          (row: EloRow, i) => (
            <Cell>
              {row.score === undefined || row.score === null
                ? "unranked"
                : i + 1 + "."}
            </Cell>
          ),
          (row: EloRow, i) => {
            // name
            return <Cell>{compPlayerToEntry(row.address, row.twitter)}</Cell>;
          },
          (row: EloRow, i) => {
            // twitter
            return (
              <Cell>
                {row.twitter && (
                  <a
                    style={{ display: "flex", alignItems: "center" }}
                    target="_blank"
                    href={`https://twitter.com/${row.twitter}`}
                  >
                    <Twitter width="24px" height="24px" />
                  </a>
                )}
              </Cell>
            );
          },
          (row: EloRow, i) => {
            // gnosis
            return (
              <Cell>
                {" "}
                <a
                  style={{ display: "flex", alignItems: "center" }}
                  target="_blank"
                  href={`https://blockscout.com/xdai/optimism/address/${row.address}`}
                >
                  <GnoButton>
                    <Gnosis width="24px" height="24px" />
                  </GnoButton>
                </a>
              </Cell>
            );
          },
          (row: EloRow, i) => {
            // score
            return <Cell>{row.score}</Cell>;
          },
          (row: EloRow, i) => {
            // win/loss
            return (
              <Cell>
                {row.wins}/{row.losses}
              </Cell>
            );
          },
        ]}
      />
    </TableContainer>
  );
}

function EloLeaderboardBody({
  leaderboard,
  error,
}: {
  leaderboard: GraphConfigPlayer[] | undefined;
  error: Error | undefined;
}) {
  const twitters = useTwitters();
  if (error) {
    return (
      <LeaderboardContainer>
        <Red>{errorMessage}</Red>
      </LeaderboardContainer>
    );
  }

  if (leaderboard == undefined) {
    return <Subber>Leaderboard loading...</Subber>;
  }

  if (leaderboard.length !== 0) {
    leaderboard.sort((a, b) => {
      if (typeof a.elo !== "number" && typeof b.elo !== "number") {
        return 0;
      } else if (typeof a.elo !== "number") {
        return -1;
      } else if (typeof b.elo !== "number") {
        return 1;
      }

      return b.elo - a.elo;
    });
  }

  const eloRows: EloRow[] = leaderboard.map((entry) => {
    return {
      address: entry.address,
      twitter: twitters[entry.address],
      score: entry.elo,
      wins: entry.wins,
      losses: entry.losses,
    };
  });

  return <EloLeaderboardTable rows={eloRows} />;
}

const Cell = styled.div`
  padding: 4px 8px;
  color: ${dfstyles.colors.text};
  background: transparent;
  // font-size: 1.25em;
`;

const TableContainer = styled.div`
  display: inline-block;
  border-radius: 2px 2px 0 0px;
  border-bottom: none;
  padding: 4px;
  overflow: scroll;
  width: 100%;
`;

const LeaderboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  // justify-content: space-between;
  align-items: center;
  overflow: hidden;
  height: 100%;
`;

const StatsTableContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${dfstyles.colors.text};
  width: 100%;
`;

const StatsTable = styled.table`
  td {
    padding: 4px 8px;

    &:first-child {
      text-align: right;
      color: ${dfstyles.colors.subtext};
    }

    &:last-child {
      text-align: left;
    }
  }
`;

const GnoButton = styled.button`
  // background-color: ${dfstyles.colors.text};
  border-radius: 30%;
  border-color: ${dfstyles.colors.border};
`;
