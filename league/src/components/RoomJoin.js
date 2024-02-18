import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import io from "socket.io-client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OneField from "./OneField";
import { useSearchParams } from "react-router-dom";
import socket from "./socket";
// const socket = io.connect("http://localhost:3001");

// const RoomIdContext=createContext();

function RoomJoin() {
  const [roomid, setRoomid] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = searchParams.get("user");

  const joinRoom = () => {
    if (roomid !== "") {
      socket.emit("join_room", roomid);
      socket.on("message", (message) => {
        console.log(message);
        if (message === "joined") {
          localStorage.setItem(
            "successMessage",
            "Joined the room successfully"
          );
          navigate(`/createteam?roomId=${roomid}&user=${user}`);
        } else {
          toast.error("Room id does not exist");
        }
      });
    }
  };

  const onassignid = (data) => {
    setRoomid(data);
  };
  useEffect(() => {
    joinRoom();
  }, [roomid]);
  return (
    <OneField text={"ENTER ROOM ID"} onReceiveData={onassignid} name="ENTER" />
  );
}

export default RoomJoin;
