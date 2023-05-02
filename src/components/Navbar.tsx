import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import Context, { IContext } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const { user } = React.useContext(Context) as IContext;
  return (
    <>
      <nav className="flex flex-col bg-slate-700 p-2 text-gray-200">
        <h1 className="font-bold ">JakubChat</h1>
        <span className="flex justify-between">
          {user && (
            <span className="flex gap-1">
              <img
                src={user.photoURL ? user.photoURL : ""}
                className="h-6 w-6 rounded-full"
              />
              <p>{user.displayName}</p>
            </span>
          )}

          <button
            className="rounded-md bg-slate-300 px-1 text-xs text-slate-900 transition-all duration-200 hover:rounded-lg"
            onClick={() => signOut(auth)}
          >
            Log Out
          </button>
        </span>
      </nav>
    </>
  );
};

export default Navbar;
