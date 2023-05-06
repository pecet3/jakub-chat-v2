import React from "react";
import { doc, onSnapshot, DocumentData } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AuthContext, { IAuthContext } from "../context/AuthContext";
import ChatContext, { IChatContext } from "../context/ChatContext";
const UserChats: React.FC = () => {
  const [chats, setChats] = React.useState<DocumentData | undefined>(undefined);

  const { user } = React.useContext(AuthContext) as IAuthContext;
  const { dispatch } = React.useContext(ChatContext) as IChatContext;
  React.useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "userChats", user.uid), (doc) => {
      setChats(doc.data());
    });
    return () => unsub();
  }, [user?.uid]);

  const handleSelect = (user: DocumentData) => {
    if (!chats) return;
    dispatch({ type: "CHANGE_USER", payload: user });
  };
  return (
    <>
      {chats &&
        Object.entries(chats).map((chat) => (
          <div
            key={chat[0]}
            className="flex items-center gap-1 py-1 text-left duration-200 hover:bg-slate-600"
            onClick={() => handleSelect(chat[1].userInfo)}
          >
            <img
              src={chat[1].userInfo.photoURL}
              className="ml-1 h-10 w-10 rounded-full object-cover"
            />
            <span>
              <p className="font-bold text-white ">
                {chat[1].userInfo.displayName}
              </p>
              {chat[1].lastMessage ? (
                <p className="text-sm text-slate-200">{chat[1].lastMessage}</p>
              ) : (
                <p className="text-sm italic text-slate-400">no messages</p>
              )}
            </span>
          </div>
        ))}
    </>
  );
};

export default UserChats;
