import React from "react";
import Home from "./components/Home";
import RoomJoin from "./components/RoomJoin";
import { Routes, Route } from "react-router-dom";
import CreateTeam from "./components/CreateTeam";
import Auction from "./components/Auction";
import CreateRoom from "./components/CreateRoom";
// import Bidder from "./components/Bidder";

function App() {
  return (
    <div className="App ">
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/room" element={<RoomJoin />} />
        <Route path="/createteam" element={<CreateTeam />} />
        <Route path="/auction" element={<Auction />} />
        <Route path="/create_room" element={<CreateRoom />} />
        {/* <Route path="/bidder_auction" element={<Bidder />} /> */}
      </Routes>
    </div>
  );
}

export default App;
