import React from "react";
import { Link } from "react-router-dom";
function Home() {
  return (
    <div className="absolute   top-64 ml-96 pl-14">
      <div className="ml-40">
        <div className="bg-purple-500 text-white px-8 py-3 w-80 font-semibold text-3xl rounded-lg hover:bg-purple-950">
          <Link to="/create_room?user=auctioner" className="ml-12">
            AUCTIONER
          </Link>
        </div>
        <p className="text-2xl text-gray-700 m-2  mx-36"> OR</p>
        <div className="bg-purple-500 text-white px-8 py-3  font-semibold text-3xl rounded-lg hover:bg-purple-950">
          <Link to="/room?user=bidder" className="ml-20">
            BIDDER
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
