import React from "react";
import { DocumentData } from "firebase/firestore";
import AuthContext, { IAuthContext } from "./AuthContext";

interface IProvider {
  children: React.ReactNode;
}

interface IChatState {
  chatId: string;
  user: DocumentData;
  isPublic: boolean;
  room: string;
  goDown: boolean;
}

type TChatAction = {
  type: "CHANGE_USER" | "CHANGE_ROOM" | "ACTIVATE_GO_DOWN";
  payload: DocumentData;
};

export interface IChatContext {
  state: IChatState;
  dispatch: React.Dispatch<TChatAction>;
}
export const ChatContextProvider: React.FC<IProvider> = ({ children }) => {
  const { user } = React.useContext(AuthContext) as IAuthContext;
  const INITIAL_STATE: IChatState = {
    chatId: "null",
    user: {},
    isPublic: true,
    room: "room1",
    goDown: false,
  };
  const chatReducer = (state: IChatState, action: TChatAction) => {
    if (!user || !action.payload) return state;
    switch (action.type) {
      case "CHANGE_USER":
        return {
          chatId:
            user.uid > action.payload.uid
              ? user.uid + action.payload.uid
              : action.payload.uid + user.uid,
          user: action.payload,
          goDown: state.goDown,
          isPublic: false,
          room: "room1",
        };
      case "CHANGE_ROOM":
        return {
          ...state,
          isPublic: true,
          room: action.payload.room as string,
        };
      case "ACTIVATE_GO_DOWN":
        return {
          ...state,
          goDown: !state.goDown,
        };
      default:
        return state;
    }
  };
  const [state, dispatch] = React.useReducer<
    React.Reducer<IChatState, TChatAction>
  >(chatReducer, INITIAL_STATE);

  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
};

const Context = React.createContext<IChatContext | null>(null);

export default Context;
