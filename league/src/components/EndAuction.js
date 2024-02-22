import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import socket from "./socket";
import flightImage from "../images/flight.png";
function EndAuction() {
  const [searchParams] = useSearchParams();
  const [teams, setTeams] = useState("");
  const [currentTeam, setCurrentTeam] = useState("");
  const [players, setPlayers] = useState("");
  const roomid = searchParams.get("roomId");
  const team_u = searchParams.get("team");
  useEffect(() => {
    if (teams === "") {
      socket.emit("all_team_list", roomid);
      console.log("Roomid->" + roomid);
    }
  }, []);

  useEffect(() => {
    socket.on("all_team_list_ack", (room) => {
      console.log("Room->" + room.teams[0].avaliable_amount);
      if (team_u === "auctioner") {
        setTeams(room.teams);
        setPlayers(room.teams[0].players);
        console.log(room.teams[0].players);
        setCurrentTeam(room.teams[0]);
      } else {
        let ro = room.teams.find((t) => t.teamName === team_u);
        setTeams(ro);
        setPlayers(ro.players);
        setCurrentTeam(ro);
      }
      // console.log(room.teams[0].teamName);
    });
    // socket.off("all_team_list_ack");
  }, [socket]);

  const handleTeam = (team) => {
    setCurrentTeam(team);
    setPlayers(team.players);
  };

  return (
    <div>
      <div className="title font-semibold ml-100 text-3xl mt-10">
        AUCTION ENDED
      </div>
      <div className="h-100 w-130 ml-96 mr-96 bg-gray-100 drop-shadow-lg rounded-lg mt-10 flex">
        <div className="list_teams w-2/5 rounded-lg bg-purple-500 text-white">
          <div className="List_team_name  text-2xl font-medium mt-5 ml-16 pl-2">
            LIST OF TEAMS
          </div>
          <div className="teams mt-2 ml-2  p-2 rounded-lg  overflow-y-auto max-h-98 ">
            {teams &&
              team_u === "auctioner" &&
              teams.map((team) => {
                return (
                  <div
                    onClick={() => handleTeam(team)}
                    className={
                      team["teamName"] === currentTeam["teamName"]
                        ? "shadow-md flex rounded-lg h-12 mt-4 w-72 py-3 px-14 bg-white text-black"
                        : "bg-purple-800  shadow-md flex rounded-lg h-12 mt-4 w-72 py-3 px-14 hover:bg-purple-900"
                    }
                  >
                    {team["teamName"]}
                  </div>
                );
              })}
            {teams && team_u !== "auctioner" && (
              <div
                onClick={() => handleTeam(currentTeam)}
                className={
                  "shadow-md flex rounded-lg h-12 mt-4 w-72 py-3 px-14 bg-white text-black"
                }
              >
                {currentTeam["teamName"]}
              </div>
            )}
          </div>
        </div>
        <div className="team_player_details ">
          <div className="team details pl-8 pt-8 w-100 bg-slate-50  h-40 rounded-lg">
            <div className="text-2xl font-normal">TEAM DETAILS</div>
            <div className=" flex mt-2 ">
              <div className="flex flex-col">
                <div>
                  Spent Amount:
                  {currentTeam &&
                    parseFloat(
                      (9000 - currentTeam["avaliable_amount"]) / 100
                    ).toFixed(2)}
                  Cr
                </div>
                <div>
                  Remaining Amount:
                  {currentTeam &&
                    parseFloat(currentTeam["avaliable_amount"] / 100).toFixed(
                      2
                    )}
                  Cr
                </div>
              </div>
              <div className="flex flex-col ml-10">
                <div>
                  Remaining Slots:
                  {currentTeam && currentTeam["total_slot"]}
                </div>
                <div>
                  Remaining Overases Slot:
                  {currentTeam && currentTeam["avaliable_foreign_player"]}
                </div>
              </div>
            </div>
          </div>
          <div className="player_details w-full ">
            <div className="text-2xl font-normal pl-8 pt-8">PLAYERS LIST</div>
            <div className="overflow-y-auto ml-8 max-h-80 ">
              {players &&
                players !== "" &&
                players.map((p) => {
                  return (
                    <div className="bg-gray-50  shadow-md flex rounded-lg h-12 mt-4 w-90">
                      <div
                        className={
                          p["country"] !== "India"
                            ? "w-1 bg-red-500 h-full rounded-lg"
                            : "w-1 bg-blue-500 h-full rounded-lg"
                        }
                      ></div>
                      <div className="w-36 mt-3 ml-1">{p["name"]}</div>
                      <div className="w-14 mt-3">
                        {parseFloat(p["price"] / 100).toFixed(2)}Cr
                      </div>
                      <div className="w-28 mt-3">{p["specialism"]}</div>
                      <div className="w-6 mt-4">
                        {p["country"] !== "India" ? (
                          <img
                            className="h-5 w-5"
                            src={flightImage}
                            alt="foreign player"
                          />
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default EndAuction;
