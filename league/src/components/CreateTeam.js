import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import OneField from "./OneField";
import socket from "./socket";
import { useNavigate } from "react-router-dom";

function CreateTeam() {
  const [searchParams] = useSearchParams();
  const user = searchParams.get("user");
  const roomid = searchParams.get("roomId");

  const [team, setTeam] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const successMessage = localStorage.getItem("successMessage");
    console.log(successMessage);
    if (successMessage) {
      toast.success(successMessage);
      setTimeout(() => {
        localStorage.removeItem("successMessage");
      }, 3000);
    }
  }, []);

  const createTeam = () => {
    if (team !== "") {
      console.log(roomid);
      socket.emit("team_send", {
        teamName: team,
        id: roomid,
        socketId: socket.id,
      });
      socket.on("team_creation", (message) => {
        console.log(message);
        if (message === "created") {
          localStorage.setItem("successMessage", "Team created successfully");
          navigate(`/auction?user=${user}&roomId=${roomid}&team=${team}`);
        } else {
          toast.error("Team Name Already Existed");
        }
      });
    }
  };

  const assignTeam = (data) => {
    setTeam(data);
  };

  useEffect(() => {
    createTeam();
  }, [team]);

  return (
    <OneField text="ENTER CREW NAME " onReceiveData={assignTeam} name="ENTER" />
  );
}

export default CreateTeam;
