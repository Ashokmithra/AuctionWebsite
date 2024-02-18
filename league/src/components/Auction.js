import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import socket from "./socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import userimage from "../images/user.jpg";
import flightImage from "../images/flight.png";

function Auction() {
  const [searchParams] = useSearchParams();
  const roomid = searchParams.get("roomId");
  const user = searchParams.get("user");
  // const [currentTeam, setCurrentTeam] = useState("");
  const [timer, setTimer] = useState(5);
  const [timerRunning, setTimerRunning] = useState(false);
  const [currentTeam, setCurrentTeam] = useState("");
  const [sold_unsold_indicator, setSold_unsold_indicator] = useState(false);
  const [stat, setStatus] = useState("");
  const [teamdetails, setTeamdetails] = useState("");
  const [listPlayers, setListplayers] = useState("");
  const [allteam, setAllteam] = useState("");

  let team = "auctioner";
  let load = false;
  let socketId = socket.id;
  if (user === "bidder") {
    team = searchParams.get("team");
  }
  const [player, setPlayer] = useState("");
  const [prize, setPrize] = useState(0);

  const handleStart = () => {
    setSold_unsold_indicator(false);
    socket.emit("req_player", { id: roomid });
    // console.log(teamdetails);
    // console.log(user);
    setTimer(5);
    setTimerRunning(true);
    socket.emit("timer_started", { id: roomid });
    document.getElementById("next-btn").innerHTML = "Next";

    let temp_team = "auctioner";
    if (user === "bidder") {
      temp_team = team;
    }
    // console.log(temp_team);
    socket.on("requested_player", (data) => {
      // console.log("Request_player_ack=>" + data["First_Name"]);
      // console.log(
      // "First prize update->" + data["First_Name"] + " Prize->" + prize
      // );
      if (prize === 0) {
        socket.emit("prize_update", {
          updated_prize: data["Base_Price_Lakhs"],
          id: roomid,
          t: temp_team,
          j: "start",
          id: roomid,
        });

        socket.emit("player_update", {
          update_player: data,
          id: roomid,
        });
      }
    });
  };

  useEffect(() => {
    let interval;
    let check_sold = false;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer > 0) {
            return prevTimer - 1;
          } else {
            clearInterval(interval);
            setTimerRunning(false);
            if (!check_sold && user !== "bidder") {
              check_sold = true;
              // console.log("Team-->" + currentTeam);
              if (currentTeam === "auctioner") {
                unsold();
                setStatus("unsold");
              } else {
                sold();
                setStatus("sold");
              }
            }
            // sold();
            return 0;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timer]);

  let isSocketListenerAdded = false;

  useEffect(() => {
    if (!isSocketListenerAdded) {
      socket.on("send_notification", (data) => {
        if (user === "bidder") {
          // console.log("notification checking-->" + data);
          toast.info(data);
        }
      });

      isSocketListenerAdded = true;
    }
  }, [stat]);

  useEffect(() => {
    // Add event listener when the component mounts
    if (user !== "auctioner") {
      socket.emit("team_details", { id: roomid, t: team });
      const handleTeamDetailsAck = (data) => {
        setTeamdetails(data);
        // console.log("Inside socket team details =>", data);
      };

      socket.on("team_details_ack", handleTeamDetailsAck);

      // Cleanup function to remove the event listener when the component unmounts
      return () => {
        socket.off("team_details_ack", handleTeamDetailsAck);
      };
    } else {
      socket.emit("list_players", { id: roomid, socketId: socket.id });
      const handleListPlayers = (data) => {
        setListplayers(data);
        // console.log("list of players" + data);
        console.log(
          data.map((element) => {
            return element["First_Name"];
          })
        );
      };
      socket.on("list_players_ack", handleListPlayers);

      return () => {
        socket.off("list_players_ack", handleListPlayers);
      };
    }
  }, []);

  useEffect(() => {
    socket.emit("list_team_details", { id: roomid, socketId: socket.id });
    const handleListTeam = (data) => {
      setAllteam(data);
      // console.log("List of all team=>" + data);
    };
    socket.on("list_team_details_ack", handleListTeam);
    return () => {
      socket.off("list_team_details_ack", handleListTeam);
    };
  }, []);

  useEffect(() => {
    const handleTeamDetailsAck = (data) => {
      setTeamdetails(data);
      // console.log("Inside socket team details =>", data);
    };

    socket.on("team_details_ack", handleTeamDetailsAck);
    return () => {
      socket.off("team_details_ack", handleTeamDetailsAck);
    };
  }, [teamdetails]);

  useEffect(() => {
    const handleTeamDetailsAck = (data) => {
      setAllteam(data);
      // console.log("List of all team=>", data);
    };

    socket.on("list_team_details_ack", handleTeamDetailsAck);
    return () => {
      socket.off("list_team_details_ack", handleTeamDetailsAck);
    };
  }, [allteam]);

  useEffect(() => {
    socket.on("p_update", (p, t) => {
      // console.log(p + " " + t);
      setPrize(p);
      setCurrentTeam(t);
      if (t != "auctioner") {
        team = t;
      }
      // setCurrentTeam(t);
    });
  }, [prize]);

  useEffect(() => {
    socket.on("p_details", (p) => {
      // console.log("CHECKING->" + p["First_Name"]);
      // console.log("Inside checking:" + player);

      setPlayer(p);
    });
  }, [player]);

  useEffect(() => {
    socket.on("timer_update", () => {
      setTimer(5);
      setTimerRunning(true);
       setSold_unsold_indicator(false);
    });
    socket.on("stop", () => {
      setTimerRunning(false);
      setSold_unsold_indicator(true);
    });
  }, [timerRunning]);

  const makeBid = () => {
    // console.log("MAKE BID->" + team);
    // console.log("Old prize=>" + prize + " type of" + typeof prize);

    let old_prize = parseInt(prize) + 20;
    // console.log("prize +20==>", old_prize);
    // console.log("new_prize " + old_prize);

    setPrize(old_prize);
    setCurrentTeam(team);
    // console.log("Player=>" + player, prize);
    socket.emit("prize_update", {
      updated_prize: old_prize,
      id: roomid,
      t: team,
      j: "bid",
    });
    socket.emit("timer_started", { id: roomid });
    setTimer(5);
    setTimerRunning(true);
  };

  // useEffect(() => {
  //   toast.info("Player is sold");
  // }, [sold_unsold_indicator]);
  const sold = () => {
    if (user === "auctioner") {
      socket.emit("status_player", {
        message: `Player gets sold to ${currentTeam}`,
        id: roomid,
      });
    }

    setSold_unsold_indicator(true);
    setTimerRunning(false);
    toast.info(`Player gets sold to ${currentTeam}`);
    socket.emit("timer_stop", { id: roomid });
    // console.log("complelte_player->" + player);
    // console.log("Current TEam--->" + currentTeam);
    const handleSoldPlayer = () => {
      socket.emit("sold_player", {
        status: "sold",
        player_prize: prize,
        player_team: currentTeam,
        player_details: player,
        id: roomid,
      });
    };
    handleSoldPlayer();
    socket.emit("team_details", { id: roomid, t: currentTeam });
    socket.emit("list_team_details", { id: roomid, socketId: socket.id });
  };

  const unsold = () => {
    // const somefunction = () => {
    socket.emit("status_player", {
      message: "Player gets unsold",
      id: roomid,
    });
    // };
    // socket.on("send_notifications", (data) => {
    toast.info("player gets unsold");
    // });
    // somefunction();
    setSold_unsold_indicator(true);
    setTimerRunning(false);
    // toast.info("Player is unsold");
    socket.emit("timer_stop", { id: roomid });
    // console.log("complelte_player->" + player["First_Name"]);
    const handleUnsoldPlayer = () => {
      socket.emit("unsold_player", {
        status: "unsold",
        player_details: player,
        id: roomid,
      });
    };
    handleUnsoldPlayer();
  };

  return (
    <div>
      <div className="flex w-full">
        <div className="list_players w-96 mt-10 ">
          <div className="ml-20 font-semibold text-gray-800 text-2xl ">
            {user === "auctioner" && <span>LIST OF PLAYERS</span>}
            {user === "bidder" && <span>BOUGHT PLAYERS</span>}
          </div>

          <div className="mt-5 ml-4 bg-gray-100 p-2 rounded-lg  overflow-y-auto max-h-100 ">
            <table>
              <tr>
                <td>
                  <div className=" text-gray-800 font-medium"> NAME</div>
                </td>
                <td>
                  <div className=" text-gray-800 font-medium"> PRICE</div>
                </td>
                <td>
                  <div className=" text-gray-800 font-medium ml-4">COUNTRY</div>
                </td>
              </tr>
              {user === "auctioner" &&
                listPlayers &&
                listPlayers.map((t) => {
                  return (
                    // <div className="mt-1 ml-7 ">
                    <tr>
                      <td>{t["First_Name"] + " " + t["Surname"]}</td>
                      <td>{t["Base_Price_Lakhs"]}</td>
                      <div className="ml-4">
                        <td>{t["Country"]}</td>
                      </div>
                    </tr>
                    // </div>
                  );
                })}
              {user === "bidder" &&
                teamdetails &&
                teamdetails.players.map((p) => {
                  return (
                    <tr>
                      <td>{p["name"]}</td>
                      <td>{p["price"]}</td>
                      <div className="ml-4">
                        <td>{p["specialism"]}</td>
                      </div>
                      <td>
                        <div className="ml-4">
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
                      </td>
                    </tr>
                  );
                })}
            </table>
          </div>
        </div>

        <div className="middle_part w-7/12 mt-10">
          <div>
            <div className=" font-semibold text-gray-800 text-2xl ml-80">
              CURRENT PLAYER
            </div>
            <div className="timer flex bg-purple-600 text-white rounded-lg text-2xl font-lightweight w-28 p-3 ml-6 mt-5">
              <div>TIMER:</div>
              <div>{timer}</div>
            </div>
            <div className="main content flex flex-col mt-5">
              <div className="ml-60">
                <div className="ml-14">
                  <img className="h-60" src={userimage} alt="user Image" />
                </div>
              </div>
              <div className="ml-80">
                <div className="playername mt-5">
                  <div className="text-gray-800 font-semibold mt-3 inline">
                    Player Name:
                  </div>
                  <div className="text-gray-800  mt-3 inline">
                    {player
                      ? player["First_Name"] + " " + player["Surname"]
                      : "-"}
                  </div>
                </div>
                <div className="Prize mt-3  flex">
                  <div>
                    <div className="text-gray-800 font-semibold mt-3 inline">
                      Base Price:
                    </div>
                    <div className="text-gray-800  mt-3 inline">
                      {player ? player["Base_Price_Lakhs"] : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-800 font-semibold mt-3 inline ml-16">
                      Current Bid:
                    </div>
                    <div className="text-gray-800  mt-3 inline">{prize}</div>
                  </div>
                </div>
                <div className="currentteam mt-3">
                  <div className="text-gray-800 font-semibold mt-3 inline">
                    Current team:
                  </div>
                  <div className="text-gray-800  mt-3 inline">
                    {currentTeam === "auctioner" ? "-" : currentTeam}
                  </div>
                </div>
              </div>
            </div>
            {/* <div>Timer: {timer} seconds</div> */}
            {/* <div>Team details {teamdetails["avaliable_amount"]}</div> */}
          </div>
          {user === "bidder" && (
            <div className=" ml-80">
              <button
                className="mt-5  bg-purple-500 text-white px-2 py-2 w-24 mx-8  font-semibold  rounded-lg hover:bg-purple-950 disabled:bg-purple-950 disabled:cursor-not-allowed"
                onClick={makeBid}
                disabled={
                  currentTeam === team ||
                  player === "" ||
                  timer === 0 ||
                  sold_unsold_indicator
                }
              >
                Bid
              </button>
            </div>
          )}
          {user === "auctioner" && (
            <div className="flex w-full mt-10">
              <button
                className="mt-5  bg-red-500 text-white px-2 py-2 w-3/4 mx-8  font-semibold  rounded-lg hover:bg-red-950 disabled:bg-red-950 disabled:cursor-not-allowed"
                onClick={unsold}
                disabled={
                  currentTeam !== "auctioner" ||
                  player === "" ||
                  sold_unsold_indicator
                }
              >
                Unsold
              </button>
              <button
                className="mt-5  bg-green-500 text-white px-2 py-2 w-3/4 mx-8  font-semibold  rounded-lg hover:bg-green-950 disabled:bg-green-950 disabled:cursor-not-allowed"
                onClick={sold}
                disabled={
                  currentTeam === "auctioner" ||
                  player === "" ||
                  sold_unsold_indicator
                }
              >
                Sold
              </button>
              <button
                className="mt-5  bg-purple-600 text-white px-2 py-2 w-3/4 mx-8  font-semibold  rounded-lg hover:bg-purple-950 disabled:bg-purple-950 disabled:cursor-not-allowed"
                id="next-btn"
                onClick={handleStart}
                disabled={
                  timer !== 0 && !sold_unsold_indicator && player !== ""
                }
              >
                Start
              </button>
            </div>
          )}
        </div>
        <div className="right-content w-96 mr-4">
          <div>
            <div className="ml-20 font-semibold text-gray-800 text-2xl mt-10">
              {user === "auctioner" && <span>PLAYER DETAILS</span>}
              {user === "bidder" && <span>{team} DETAILS</span>}
            </div>
            <div className="player_details bg-gray-100 p-2 rounded-lg mt-5">
              <table>
                {user === "auctioner" && (
                  <React.Fragment>
                    <tr>
                      <td>
                        <div className=" text-gray-800 font-medium ml-8">
                          Name:
                        </div>
                      </td>
                      <td>
                        {player
                          ? player["First_Name"] + " " + player["Surname"]
                          : "-"}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className=" text-gray-800 font-medium ml-8">
                          Age:
                        </div>
                      </td>
                      <td>{player ? player["Age"] : "-"}</td>
                    </tr>
                    <tr>
                      <td>
                        <div className=" text-gray-800 font-medium ml-8">
                          Specialism:
                        </div>
                      </td>
                      <td>{player ? player["Specialism"] : "-"}</td>
                    </tr>
                    <tr>
                      <td>
                        <div className=" text-gray-800 font-medium ml-8">
                          Batting:
                        </div>
                      </td>
                      <td>{player ? player["Batting"] : "-"}</td>
                    </tr>
                    <tr>
                      <td>
                        <div className=" text-gray-800 font-medium ml-8">
                          Bowling:
                        </div>
                      </td>
                      <td>{player ? player["Bowling"] : "-"}</td>
                    </tr>
                  </React.Fragment>
                )}
                {user === "bidder" && (
                  <React.Fragment>
                    <tr>
                      <td>
                        <div className=" text-gray-800 font-medium ml-8">
                          Remaining Amount:
                        </div>
                      </td>
                      <td>
                        {teamdetails ? teamdetails["avaliable_amount"] : "-"}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className=" text-gray-800 font-medium ml-8">
                          Slot Left:
                        </div>
                      </td>
                      <td>{teamdetails ? teamdetails["total_slot"] : "-"}</td>
                    </tr>
                    <tr>
                      <td>
                        <div className=" text-gray-800 font-medium ml-8">
                          Overseas Slot Left:
                        </div>
                      </td>
                      <td>
                        {teamdetails
                          ? teamdetails["avaliable_foreign_player"]
                          : "-"}
                      </td>
                    </tr>
                  </React.Fragment>
                )}
              </table>
            </div>
            {user === "auctioner" && (
              <div className="all_team ">
                <div className="ml-20 font-semibold text-gray-800 text-2xl mt-10">
                  LIST OF TEAMS
                </div>
                <div className="list_team bg-gray-100 p-2 rounded-lg mt-5 overflow-y-auto max-h-96 ">
                  <table>
                    <tr>
                      <td>
                        <div className=" text-gray-800 font-medium ml-8">
                          TEAM
                        </div>
                      </td>
                      <td>
                        <div className=" text-gray-800 font-medium ml-8">
                          REMAINING AMOUNT
                        </div>
                      </td>
                    </tr>
                    {allteam &&
                      allteam.map((t) => {
                        return (
                          <tr>
                            <td>
                              <div className="  ml-8 mt-1">{t["teamName"]}</div>
                            </td>
                            <td>
                              <div className="  ml-8 mt-1">
                                {t["avaliable_amount"]}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Auction;