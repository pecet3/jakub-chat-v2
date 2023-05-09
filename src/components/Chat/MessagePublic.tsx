import React from "react";
import ChatContext, { IChatContext } from "../../context/ChatContext";
import AuthContext, { IAuthContext } from "../../context/AuthContext";
import { DocumentData } from "firebase/firestore";

interface IMessage {
  message: DocumentData;
}
const MessagePublic: React.FC<IMessage> = ({ message }) => {
  const [date, setDate] = React.useState({
    date: "",
    time: "",
  });

  const { state } = React.useContext(ChatContext) as IChatContext;
  const { user } = React.useContext(AuthContext) as IAuthContext;
  const messageRef = React.useRef<HTMLDivElement | null>(null);

  const [currentDate, setCurrentDate] = React.useState<number>(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(parseInt((Date.now() / 1000).toFixed()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });
    const date = new Date(message.date.seconds * 1000);
    setDate({
      date: date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }),
      time: date.toLocaleDateString(undefined, {
        hour: "numeric",
        minute: "numeric",
      }),
    });
  }, [message]);

  return (
    <div
      ref={messageRef}
      className={`flex ${
        user?.uid === message.senderId && "flex-row-reverse"
      } gap-1 text-slate-200`}
    >
      <span>
        <img
          src={
            user?.uid === message.senderId
              ? user?.photoURL?.toString()
              : message.photoURL || ""
          }
          alt="user's image"
          className="m-auto h-8 w-8 rounded-full object-cover"
        />
        <p className="w-[54px] break-words text-xs text-black">
          {message.displayName}
        </p>
      </span>
      <span className="flex flex-col gap-1">
        {message && message.text !== "" && (
          <p
            className={`m-0 flex flex-col justify-end rounded-b-lg ${
              user?.uid === message.senderId
                ? "items-end rounded-l-lg text-right"
                : "items-start rounded-r-lg text-left"
            } bg-zinc-600 p-1 px-2 `}
          >
            {message.text}
          </p>
        )}

        {message.img && (
          <a href={message.img} target="_blank" rel="noopener noreferrer">
            <img
              src={message.img || ""}
              alt="photo which user sent"
              className="max-h-36 self-start rounded-sm"
            />
          </a>
        )}
        <p className="m-0 text-xs">
          {message.date.seconds > currentDate - 0
            ? "Just Now"
            : date.date + date.time.slice(10)}
        </p>
      </span>
    </div>
  );
};

export default MessagePublic;