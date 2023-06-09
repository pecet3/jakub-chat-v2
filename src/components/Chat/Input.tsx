import React from "react";
import { BiImageAdd } from "react-icons/bi";
import {
  updateDoc,
  getDoc,
  setDoc,
  doc,
  arrayUnion,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "../../firebase";
import ChatContext, { IChatContext } from "../../context/ChatContext";
import AuthContext, { IAuthContext } from "../../context/AuthContext";
import { nanoid } from "nanoid";

export type TInput = {
  message: string;
  file: null | File;
};

const Input: React.FC = () => {
  const [input, setInput] = React.useState<TInput>({
    message: "",
    file: null,
  });

  const [coolDown, setCoolDown] = React.useState(false);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCoolDown(false);
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [coolDown]);

  const { state } = React.useContext(ChatContext) as IChatContext;
  const { user } = React.useContext(AuthContext) as IAuthContext;

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputElement = e.target as HTMLInputElement;
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });

    if (inputElement.files === null) return;
    setInput({
      ...input,
      file: inputElement.files[0],
    });
  };

  const handlePublicChat = async () => {
    if (!user) return;
    if (input.message.trim() === "" && input.file == null) return;

    const docRefChats = doc(db, "publicChats", state.room);
    const docSnapChats = await getDoc(docRefChats);

    const docRefUser = doc(db, "users", user.uid);
    const docSnapUser = await getDoc(docRefUser);

    if (input.file && !coolDown) {
      if (!docSnapChats.exists()) {
        await setDoc(doc(db, "publicChats", state.room), {});
      }

      const storageRef = ref(storage, `${state.room}_${user.uid}_${nanoid()}`);

      await uploadBytesResumable(storageRef, input.file);
      setCoolDown(true);
      await getDownloadURL(storageRef).then(async (downloadURL) => {
        await updateDoc(docRefChats, {
          messages: arrayUnion({
            id: nanoid(),
            senderId: user.uid,
            text: input.message,
            displayName: user.displayName,
            photoURL: user?.photoURL,
            date: Timestamp.now(),
            img: downloadURL,
            color: docSnapUser.data()?.color || "black",
          }),
        });
      });
    } else if (!coolDown) {
      if (!docSnapChats.exists()) {
        await setDoc(doc(db, "publicChats", state.room), {});
      }

      await updateDoc(doc(db, "publicChats", state.room), {
        messages: arrayUnion({
          id: nanoid(),
          senderId: user.uid,
          text: input.message,
          displayName: user.displayName,
          photoURL: user.photoURL,
          date: Timestamp.now(),
          color: docSnapUser.data()?.color || "black",
        }),
      });
    }
    setInput({
      message: "",
      file: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) return;
    if (input.message.trim() === "" && input.file == null) return;

    if (state.isPublic) return handlePublicChat();
    try {
      if (input.file && !coolDown) {
        setCoolDown(true);
        const storageRef = ref(storage, `${user.uid}_${nanoid()}`);
        await uploadBytesResumable(storageRef, input.file);
        setInput({
          ...input,
          file: null,
        });
        await getDownloadURL(storageRef).then(async (downloadURL) => {
          await updateDoc(doc(db, "chats", state.chatId), {
            messages: arrayUnion({
              id: nanoid(),
              text: input.message,
              senderId: user?.uid,
              date: Timestamp.now(),
              img: downloadURL,
            }),
          });
        });
      } else if (!coolDown) {
        await updateDoc(doc(db, "chats", state.chatId), {
          messages: arrayUnion({
            id: nanoid(),
            text: input.message,
            senderId: user?.uid,
            date: Timestamp.now(),
          }),
        });
      }
      await updateDoc(doc(db, "userChats", user.uid), {
        [state.chatId + ".lastMessage"]: input.message || "photo",
        [state.chatId + ".date"]: serverTimestamp(),
        [state.chatId + ".userInfo.displayName"]: state.user.displayName,
        [state.chatId + ".userInfo.photoURL"]: state.user.photoURL,
      });

      await updateDoc(doc(db, "userChats", state.user.uid), {
        [state.chatId + ".lastMessage"]: input.message || "photo",
        [state.chatId + ".date"]: serverTimestamp(),
        [state.chatId + ".userInfo.displayName"]: user.displayName,
        [state.chatId + ".userInfo.photoURL"]: user.photoURL,
      });
    } catch (err) {
      alert(err);
    }
    setInput({
      message: "",
      file: null,
    });
  };
  return (
    <>
      <form className=" flex gap-1 bg-gray-300 p-1" onSubmit={handleSubmit}>
        <input
          type="text"
          autoComplete="off"
          name="message"
          placeholder="enter your message"
          className="w-full rounded-md p-1 text-left"
          value={input.message}
          onChange={onInputChange}
          disabled={state.chatId === "null" && !state.isPublic}
        />
        <span className="flex items-center">
          <input
            type="file"
            id="file"
            accept="image/*"
            className="hidden"
            onChange={onInputChange}
            disabled={state.chatId === "null" && !state.isPublic}
          />
          <label htmlFor="file" className="hover:cursor-pointer">
            {!input.file ? (
              <BiImageAdd size="32" />
            ) : (
              <p className="w-20 text-xs ">image has been loaded</p>
            )}
          </label>
        </span>
        <button
          className="submitButton w-20"
          disabled={state.chatId === "null" && !state.isPublic}
        >
          Send
        </button>
      </form>
    </>
  );
};

export default Input;
