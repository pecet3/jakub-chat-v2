import React from "react";
import ChatContext, { IChatContext } from "../../context/ChatContext";

const PublicRooms: React.FC = () => {
  const [room, setRoom] = React.useState("room1");
  const { dispatch } = React.useContext(ChatContext) as IChatContext;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoom(e.currentTarget.value);
  };

  const handleClick = () => {
    dispatch({ type: "CHANGE_ROOM", payload: { room } });
  };

  return (
    <>
      <div className="flex items-center justify-start gap-2 bg-slate-300 p-1 ">
        <legend className="mx-1">Public room:</legend>
        <select
          value={room}
          onChange={handleChange}
          className="rounded-md px-1"
        >
          <option value="room1">#room1</option>
        </select>
        <button className="submitButton p-0 px-1" onClick={handleClick}>
          Enter
        </button>
      </div>
    </>
  );
};

export default PublicRooms;
