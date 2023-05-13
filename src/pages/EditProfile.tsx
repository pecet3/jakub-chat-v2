import React from "react";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";
import { BiImageAdd } from "react-icons/bi";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { auth, storage, db } from "../firebaseConfig";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export interface IRegisterData {
  email: string;
  password: string;
  name: string;
  file: File | null;
}

const EditProfile: React.FC = () => {
  const colors = [
    { name: "red", value: "bg-red-500" },
    { name: "blue", value: "bg-blue-500" },
    { name: "yellow", value: "bg-yellow-500" },
    { name: "pink", value: "bg-pink-500" },
    { name: "purple", value: "bg-purple-500" },
    { name: "orange", value: "bg-orange-500" },
    { name: "gray", value: "bg-gray-500" },
    { name: "black", value: "bg-black" },
  ];

  const [userColor, setUserColor] = React.useState(
    colors[colors.length - 1].value
  );
  const [input, setInput] = React.useState<IRegisterData>({
    email: "",
    password: "",
    name: "",
    file: null,
  });
  const [errorMessage, setErrorMessage] = React.useState("");
  const navigate = useNavigate();

  const registerOnChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<IRegisterData | void> => {
    e.preventDefault();

    if (input.file === null || undefined)
      return setErrorMessage("Avatar is required");

    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        input.email,
        input.password
      );

      const storageRef = ref(storage, `${input.name}_${nanoid()}`);
      await uploadBytesResumable(storageRef, input.file);

      await getDownloadURL(storageRef).then(async (downloadURL) => {
        await updateProfile(response.user, {
          displayName: input.name,
          photoURL: downloadURL,
        });
        await setDoc(doc(db, "users", response.user.uid), {
          uid: response.user.uid,
          displayName: response.user.displayName,
          email: response.user.email,
          photoURL: downloadURL,
        });

        await setDoc(doc(db, "userChats", response.user.uid), {});
      });
      navigate("/");
    } catch (err: any) {
      setErrorMessage(err.code);
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserColor(e.currentTarget.value);
  };
  return (
    <>
      <Header />
      <form className="form" onSubmit={handleSubmit}>
        <legend className="legend">Edite your profile</legend>
        <input
          type="text"
          className="inputElement"
          name="name"
          minLength={3}
          maxLength={16}
          value={input.name}
          placeholder="Name"
          onChange={registerOnChange}
        />
        <input
          type="file"
          name="file"
          id="filee"
          className="hidden"
          onChange={registerOnChange}
        />
        <label
          htmlFor="filee"
          className="flex items-center hover:cursor-pointer"
        >
          <BiImageAdd size="32" />
          <p>Change an Avatar</p>
        </label>
        <select
          className={`w-20 ${userColor}`}
          value={userColor}
          onChange={handleOnChange}
        >
          {colors.map((color) => (
            <option
              key={color.name}
              value={color.value}
              className={`${color.value} w-20 ${
                color.name === "black" ? "text-white" : "text-black"
              }`}
            >
              {color.name}
            </option>
          ))}
        </select>
        <button className="submitButton  px-6">Update</button>
        <span>
          <p className="text-red-700 underline">
            <Link to="/">Cancel</Link>
          </p>
        </span>
      </form>
      <p>{errorMessage !== "" && errorMessage}</p>
    </>
  );
};

export default EditProfile;
