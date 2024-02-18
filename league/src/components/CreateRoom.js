import React, { useState, useEffect } from "react";
import OneField from "./OneField";
import socket from "./socket";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
function CreateRoom() {
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const user = searchParams.get("user");

  const genId = (data) => {
    setRoom(data);
    console.log(data);
  };

  useEffect(() => {
    createRoom();
  }, [room]);

  function createRoom() {
    if (room !== "") {
      socket.emit("create_room", { r: room, socketId: socket.id });
      socket.on("create_message", (message) => {
        if (message === "created") {
          localStorage.setItem("successMessage", "Team created successfully");
          navigate(`/auction?user=${user}&roomId=${room}`);
        } else {
          toast.error("Room id already exist");
        }
      });
    }
  }

  return (
    <OneField text="CREATE THE ROOM" onReceiveData={genId} name="CREATE" />
  );
}

export default CreateRoom;
