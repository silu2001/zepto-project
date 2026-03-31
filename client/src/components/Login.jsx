import React, { useState } from "react";
import axios from "axios";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Login = () => {
  const { setShowUserLogin, setUser, navigate } = useAppContext();

  const [state, setState] = useState("login"); // login | register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      const { data } = await axios.post(
        `/api/user/${state}`,
        { name, email, password },
        { withCredentials: true } // ✅ IMPORTANT
      );

      if (data.success) {
        setUser(data.user);       // context state
        setShowUserLogin(false);  // close modal
        // Reset form fields
        setName("");
        setEmail("");
        setPassword("");
        setState("login");
        navigate("/");            // redirect
        toast.success(data.message || "Login successful");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className="fixed inset-0 z-50 flex items-center bg-black/50"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="m-auto w-80 sm:w-96 bg-white p-8 rounded-lg shadow-xl flex flex-col gap-4"
      >
        <h2 className="text-2xl font-semibold text-center">
          <span className="text-[#4fbf8b]">User</span>{" "}
          {state === "login" ? "Login" : "Sign Up"}
        </h2>

        {state === "register" && (
          <div>
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              required
              className="w-full border p-2 rounded mt-1"
            />
          </div>
        )}

        <div>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        <div>
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#4fbf8b] hover:bg-[#44ae7c] text-white py-2 rounded disabled:opacity-60"
        >
          {loading
            ? "Please wait..."
            : state === "login"
            ? "Login"
            : "Create Account"}
        </button>

        {state === "login" ? (
          <p className="text-center text-sm">
            Create an account?{" "}
            <span
              onClick={() => setState("register")}
              className="text-[#4fbf8b] cursor-pointer"
            >
              Click here
            </span>
          </p>
        ) : (
          <p className="text-center text-sm">
            Already have an account?{" "}
            <span
              onClick={() => setState("login")}
              className="text-indigo-500 cursor-pointer"
            >
              Login
            </span>
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
