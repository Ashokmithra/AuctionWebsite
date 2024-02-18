import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function OneField({ text, onReceiveData, name }) {
  const [word, setWord] = useState("");
  const sendWord = () => {
    onReceiveData(word);
  };
  return (
    <div className="absolute flex flex-col justify-center top-64 ml-96 pl-24">
      <div className="ml-40">
        <p className="text-gray-600 text-3xl">{text}</p>
        <div>
          <input
            className="w-64 h-10 mt-4  text-2xl focus:outline-none border border-gray-300 rounded-md px-4 py-2 focus:border-blue-500"
            placeholder={text}
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
        </div>
        <button
          className="mt-5  bg-purple-500 text-white px-2 py-2 w-64   font-semibold  rounded-lg hover:bg-purple-950 disabled:bg-purple-950 disabled:cursor-not-allowed"
          type="submit"
          onClick={sendWord}
          disabled={word === ""}
        >
          {name}
        </button>
        <ToastContainer />
      </div>
    </div>
  );
}

export default OneField;
