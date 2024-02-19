import React from "react";
import { useSearchParams } from "react-router-dom";
function EndAuction() {
  const [searchParams] = useSearchParams();
  const roomid = searchParams.get("roomId");

  return <div>End Auction</div>;
}
export default EndAuction;
