import React from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";

interface IProvider {
  children: React.ReactNode;
}

export interface IContext {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}
export const ChatContextProvider: React.FC<IProvider> = ({ children }) => {
  const [user, setUser] = React.useState<IContext["user"]>(null);

  React.useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unSubscribe();
  }, []);

  return (
    <Context.Provider value={{ user, setUser }}>{children}</Context.Provider>
  );
};

const Context = React.createContext<IContext | null>(null);

export default Context;
