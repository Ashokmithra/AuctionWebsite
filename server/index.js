const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");

app.use(cors());

const server = http.createServer(app);
const rooms = [];
const player_each_index = [];
var aucList = {};
let team = "auctioner";
let unsold = [];
// let team_socket = [];
let auctioner_socket = [];

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

fs.readFile("auctionList.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading JSON file:", err);
    return;
  }
  try {
    aucList = JSON.parse(data);
    console.log("Auction List->" + aucList);
  } catch (error) {
    console.error("Error parsing JSON data:", error);
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected:${socket.id}`);

  socket.on("create_room", (data) => {
    let room = data.r;
    let socketid = data.socketId;
    auctioner_socket.push({ id: room, socketId: socketid });
    let check = rooms.some((r) => r.roomId === room);
    console.log("Checking_room->" + check);
    if (!check) {
      rooms.push({ roomId: room, teams: [] });
      player_each_index.push({ id: room, position: 0 });
      socket.join(room);
      io.to(room).emit("create_message", "created");
      console.log(rooms);
      // team_socket.push({id:room, teamName:"auctioner", socketId: socketId });
    } else {
      socket.emit("create_message", "error");
    }
  });
  // socket.emit("p_update", prize);
  socket.on("timer_stop", (data) => {
    io.to(data.id).emit("stop");
  });
  // socket.on("check123", (data) => {
  //   let team = data.team;
  //   socket.emit("check321", team);
  // });

  socket.on("list_team_details", (data) => {
    let id = data.id;
    let socket = auctioner_socket.find((auctioner) => auctioner.id === id);
    if (socket) {
      let socketId = socket["socketId"];

      let room = rooms.find((room) => room.roomId === id);
      io.to(socketId).emit("list_team_details_ack", room.teams);
    }
  });

  socket.on("list_players", (data) => {
    let socketId = data.socketId;
    io.to(socketId).emit("list_players_ack", aucList);
  });

  socket.on("prize_update", (data) => {
    console.log(
      "Prize update=>" +
        data.updated_prize +
        " Team->" +
        data.t +
        " from->" +
        data.j
    );
    let prizes = data.updated_prize;
    let teams = data.t;
    team = teams;
    // console.log(teams);
    // prize = prizes;
    let id = data.id;
    io.to(data.id).emit("p_update", prizes, teams);
  });

  socket.on("player_update", (data) => {
    let p = data.update_player;
    io.to(data.id).emit("p_details", p);
  });

  // socket.on("current_team", (data) => {
  //   console.log("current_team " + team);
  //   io.to(data.id).emit("current_team_ack", team);
  // });

  socket.on("join_room", (data) => {
    let message = "invalid";
    socket.join(data);
    if (rooms.some((room) => room.roomId === data)) {
      message = "joined";
    }

    socket.emit("message", message);
    // console.log(data + " " + message + " " + roomId);
  });

  socket.on("timer_started", (data) => {
    io.to(data.id).emit("timer_update");
  });
  socket.on("req_player", (data) => {
    // console.log(aucList[index]);
    let id = data.id;
    console.log(id);
    let r_index = player_each_index.find((room) => room.id === id);
    let index = r_index.position;

    console.log("check_index" + index);
    io.to(data.id).emit("requested_player", aucList[index]);
    console.log("Request player", aucList[index]);
    let temp = aucList[index];
    prize = temp["Base_Price_Lakhs"];
    let room = player_each_index.find((room) => room.id === id);
    room.position = room.position + 1;
  });

  socket.on("sold_player", (data) => {
    console.log(data.player_details["First_Name"] + " " + data.status);
    let prize = data.player_prize;

    let t = data.player_team;
    let id = data.id;
    let p = data.player_details;
    let player_country = p["Country"];
    let specialism = p["Specialism"];
    console.log(data.player_details);
    console.log("Rooms->" + rooms);
    let room = rooms.find((room) => room.roomId === id);
    console.log("Room->" + room);
    let team = room.teams.find((team) => team.teamName === t);
    console.log("Team->" + team);
    // console.log("Players->" + team.players.name);
    let player_name = p["First_Name"] + " " + p["Surname"];

    let slot = parseInt(team.total_slot) - 1;
    console.log("Slot->" + slot);
    let country = p["Country"];
    let g_overseas = team.avaliable_foreign_player;
    if (country != "India") {
      g_overseas = parseInt(g_overseas) - 1;
      console.log("Overseas:" + g_overseas);
    }
    team.avaliable_amount = parseInt(team.avaliable_amount) - parseInt(prize);
    team.total_slot = slot;
    team.avaliable_foreign_player = g_overseas;
    team.players.push({
      name: player_name,
      price: prize,
      country: player_country,
      specialism: specialism,
      details: p,
    });

    console.log("Team_after->" + team.avaliable_amount);
  });

  socket.on("unsold_player", (data) => {
    console.log(data.player_details["First_Name"] + " " + data.status);
    unsold.push(data.player_details);
  });

  socket.on("status_player", (message) => {
    let msg = message.message;
    let id = message.id;
    io.to(id).emit("send_notification", msg);
    console.log(msg);
  });

  socket.on("team_details", (data) => {
    console.log("team details");
    let t = data.t;
    let id = data.id;
    // console.log("id of the team->" + id);
    // console.log("display team-->" + t);
    let room = rooms.find((r) => r.roomId === id);
    // console.log("Room of the team-->" + room);
    if (room) {
      let teams = room.teams.find((team) => team.teamName === t);
      // let socket = team_socket.find((team) => team.teamName === t);
      let socketId = teams["id"];
      console.log(
        "Current Team=>" + t + "socket->" + socket + "socketid->" + socketId
      );
      // console.log("Display team:" + teams["teamName"]);
      console.log("Data-->" + teams);
      io.to(socketId).emit("team_details_ack", teams);
    }
  });

  socket.on("team_send", (data) => {
    let team = data.teamName;
    let socketId = data.socketId;
    // store the team name with id in the database
    let id = data.id;
    let room = rooms.find((room) => room.roomId === id);
    let message = "existed";
    console.log(id + " " + team);
    console.log(room);
    if (
      room.teams &&
      room.teams.length !== 0 &&
      room.teams.some((t) => t.teamName !== team)
    ) {
      room.teams.push({
        id: socketId,
        teamName: team,
        avaliable_amount: 9000,
        avaliable_foreign_player: 8,
        players: [],
        total_slot: 25,
      });
      // team_socket.push({ teamName: team, socketId: socketId });

      message = "created";
    } else if (room.teams.length === 0) {
      room.teams.push({
        id: socketId,
        teamName: team,
        avaliable_amount: 9000,
        avaliable_foreign_player: 8,
        players: [],
        total_slot: 25,
      });
      // team_socket.push({ teamName: team, socketId: socketId });
      console.log("Room_team->" + room);
      message = "created";
    }

    // console.log(rooms);
    io.to(id).emit("team_creation", message);
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
