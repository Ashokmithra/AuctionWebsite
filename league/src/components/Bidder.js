// import React, { useState, useEffect } from "react";
// import { useSearchParams } from "react-router-dom";
// import socket from "./socket";

// function Bidder() {
//   const [searchParams] = useSearchParams();
//   const roomid = searchParams.get("roomId");
//   const user = searchParams.get("user");
//   const team = searchParams.get("team");
//   const [prize, setPrize] = useState(0);

//   useEffect(() => {
//     socket.on("p_update", (p) => {
//       setPrize(p);
//     });
//   }, []);

//   return (
//     <div>
//       <div>{prize}</div>
//       <button onClick={makeBid}>Bid</button>
//     </div>
//   );
// }

// export default Bidder;
