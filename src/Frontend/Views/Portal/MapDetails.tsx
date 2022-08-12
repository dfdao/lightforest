import { getConfigName } from "@dfdao/procedural";
import { EthAddress, ExtendedMatchEntry } from "@dfdao/types";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LoadedRound } from "../../../_types/global/GlobalTypes";
import { LobbyInitializers } from "../../Panes/Lobby/Reducer";
import "../../Styles/lightforest.scss";
import {
  useArenaLeaderboard,
  useEloLeaderboard,
  useEthConnection,
  useLiveMatches,
} from "../../Utils/AppHooks";
import { formatStartTime } from "../../Utils/TimeUtils";
import {
  ArenaLeaderboardDisplay,
  EloLeaderboardDisplay,
} from "../Leaderboards/ArenaLeaderboard";
import { truncateAddress } from "./PortalUtils";

export interface MapDetailsProps {
  configHash: string;
  config: LobbyInitializers;
}

declare const LIGHTFOREST_CONFIG: LoadedRound;

export const MapDetails: React.FC<MapDetailsProps> = ({
  configHash,
  config,
}) => {
  const numSpawnPlanets =
    config?.ADMIN_PLANETS.filter((p) => p.isSpawnPlanet).length ?? 0;

  const hasWhitelist = config?.WHITELIST_ENABLED;
  const startTime = new Date(LIGHTFOREST_CONFIG.round.START_TIME).getTime();
  const endTime = new Date(LIGHTFOREST_CONFIG.round.END_TIME).getTime();

  const [currentTab, setCurrentTab] = useState(0);

  const { liveMatches } = useLiveMatches(configHash);
  const { eloLeaderboard, eloError } = useEloLeaderboard(false, configHash);
  const { arenaLeaderboard, arenaError } = useArenaLeaderboard(
    false,
    configHash
  );
  const conn = useEthConnection();
  const address = conn.getAddress();

  return (
    <div lf-map-details-container="">
      <div lf-map-details-header="">
        <div
          lf-map-details-tab=""
          onClick={() => setCurrentTab(0)}
          lf-tab-active={currentTab === 0 ? "" : null}
        >
          <MatchIcon />
          <span>{`${liveMatches?.entries.length} Games`}</span>
        </div>
        <div
          lf-map-details-tab=""
          onClick={() => setCurrentTab(1)}
          lf-tab-active={currentTab === 1 ? "" : null}
        >
          <PersonIcon />
          <span>Leaderboard</span>
        </div>
      </div>
      <div lf-map-details-tab-view="" className="lf-stack">
        {currentTab === 0 && (
          <>
            {liveMatches && liveMatches.entries.length > 0 ? (
              <div>
                {liveMatches.entries.map(
                  (entry: ExtendedMatchEntry, i: number) => (
                    <MatchDetail
                      key={i}
                      configHash={entry.configHash}
                      creator={entry.creator}
                      players={
                        entry.players
                          ? entry.players.map((val) => val.address)
                          : []
                      }
                      numSpots={numSpawnPlanets}
                      startTime={entry.startTime}
                      id={entry.id}
                      hasWhitelist={hasWhitelist}
                      playerAddress={address as string}
                    />
                  )
                )}
              </div>
            ) : (
              <span>No live games</span>
            )}
          </>
        )}
        {currentTab === 1 && (
          <>
            {numSpawnPlanets > 1 ? (
              <EloLeaderboardDisplay
                leaderboard={eloLeaderboard}
                error={eloError}
              />
            ) : (
              <ArenaLeaderboardDisplay
                leaderboard={arenaLeaderboard}
                error={arenaError}
                startTime={startTime / 1000}
                endTime={endTime / 1000}
                goldScore={LIGHTFOREST_CONFIG.round.GOLD_RANK}
                silverScore={LIGHTFOREST_CONFIG.round.GOLD_RANK}
                bronzeScore={LIGHTFOREST_CONFIG.round.BRONZE_RANK}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export interface MatchDetailProps {
  configHash: string;
  creator: EthAddress;
  players: string[];
  numSpots: number;
  startTime: number;
  id: string;
  hasWhitelist: boolean;
  playerAddress: string;
}

export const MatchDetail: React.FC<MatchDetailProps> = ({
  configHash,
  creator,
  players,
  numSpots,
  startTime,
  id,
  hasWhitelist,
  playerAddress,
}) => {
  console.log(players);
  console.log(playerAddress);
  return (
    <div lf-match-detail-container="">
      <div lf-match-detail-header="">
        <div lf-match-detail-icon="">{`${numSpots}p`}</div>
        <div className="lf-stack">
          <span lf-match-detail-title="">{getConfigName(configHash)}</span>
          <span lf-match-detail-description="">{`${
            numSpots - players.length
          } of ${numSpots} spots available`}</span>
        </div>
      </div>
      <div className="lf-stack">
        <div lf-match-detail-info="">
          <ClockIcon />
          <span>{formatStartTime(startTime)}</span>
        </div>
        <div lf-match-detail-info="">
          <PersonIcon />
          <span>{truncateAddress(creator)}</span>
        </div>
      </div>
      <Link to={`/play/${id}`} target="_blank">
        <button lf-match-detail-button="">
          {players.includes(playerAddress)
            ? "Resume"
            : players.length < numSpots && !hasWhitelist
            ? "Join"
            : "View"}
        </button>
      </Link>
    </div>
  );
};

const PersonIcon = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.075 12.975 13.8623 12.975 13.6C12.975 11.72 12.4778 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      ></path>
    </svg>
  );
};

const MatchIcon = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.69667 0.0403541C8.90859 0.131038 9.03106 0.354857 8.99316 0.582235L8.0902 6.00001H12.5C12.6893 6.00001 12.8625 6.10701 12.9472 6.27641C13.0319 6.4458 13.0136 6.6485 12.8999 6.80001L6.89997 14.8C6.76167 14.9844 6.51521 15.0503 6.30328 14.9597C6.09135 14.869 5.96888 14.6452 6.00678 14.4178L6.90974 9H2.49999C2.31061 9 2.13748 8.893 2.05278 8.72361C1.96809 8.55422 1.98636 8.35151 2.09999 8.2L8.09997 0.200038C8.23828 0.0156255 8.48474 -0.0503301 8.69667 0.0403541ZM3.49999 8.00001H7.49997C7.64695 8.00001 7.78648 8.06467 7.88148 8.17682C7.97648 8.28896 8.01733 8.43723 7.99317 8.5822L7.33027 12.5596L11.5 7.00001H7.49997C7.353 7.00001 7.21347 6.93534 7.11846 6.8232C7.02346 6.71105 6.98261 6.56279 7.00678 6.41781L7.66968 2.44042L3.49999 8.00001Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      ></path>
    </svg>
  );
};

const ClockIcon = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.50009 0.877014C3.84241 0.877014 0.877258 3.84216 0.877258 7.49984C0.877258 11.1575 3.8424 14.1227 7.50009 14.1227C11.1578 14.1227 14.1229 11.1575 14.1229 7.49984C14.1229 3.84216 11.1577 0.877014 7.50009 0.877014ZM1.82726 7.49984C1.82726 4.36683 4.36708 1.82701 7.50009 1.82701C10.6331 1.82701 13.1729 4.36683 13.1729 7.49984C13.1729 10.6328 10.6331 13.1727 7.50009 13.1727C4.36708 13.1727 1.82726 10.6328 1.82726 7.49984ZM8 4.50001C8 4.22387 7.77614 4.00001 7.5 4.00001C7.22386 4.00001 7 4.22387 7 4.50001V7.50001C7 7.63262 7.05268 7.7598 7.14645 7.85357L9.14645 9.85357C9.34171 10.0488 9.65829 10.0488 9.85355 9.85357C10.0488 9.65831 10.0488 9.34172 9.85355 9.14646L8 7.29291V4.50001Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      ></path>
    </svg>
  );
};
