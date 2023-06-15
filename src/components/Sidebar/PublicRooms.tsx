import React from "react";
import ChatContext, { IChatContext } from "../../context/ChatContext";
import { useSize } from "../../helpers/useSize";

const PublicRooms: React.FC = () => {
  const [room, setRoom] = React.useState("room1");
  const { dispatch } = React.useContext(ChatContext) as IChatContext;
  const { innerWidth } = useSize();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoom(e.currentTarget.value);
  };

  const handleClick = async () => {
    dispatch({ type: "CHANGE_ROOM", payload: { room } });
    if (innerWidth > 768) return;
    await dispatch({ type: "TOGGLE_SIDEBAR", payload: {} });
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2 bg-slate-300 p-1 ">
        <legend className="mx-1">Public room:</legend>
        <select
          value={room}
          onChange={handleChange}
          className="rounded-md px-1"
        >
          <option value="room1">#room1</option>
        </select>
        <button
          className="submitButton p-0 px-2 shadow-md ring-2 ring-indigo-700 "
          onClick={handleClick}
        >
          Enter
        </button>
      </div>
    </>
  );
};

export default PublicRooms;
