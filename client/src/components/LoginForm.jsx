import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/auth/login/", { username, password });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.username);
      // Redirect based on role
      const role = res.data.role.toLowerCase();
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "superadmin") {
        navigate("/admin");
      } else if (role === "user") {
        navigate("/user");
      } else {
        alert("Unknown role. Access denied.");
      }
    } catch (err) {
      alert("Login failed: " + err.response?.data?.error || "Please try again");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 mt-10">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-blue-300">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6 tracking-wide">
          Welcome Back
        </h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition duration-200 shadow-md"
          >
            Login
          </button>
        </form>

        {/* <div className="text-center mt-6 text-sm text-gray-600">
          Don’t have an account?
          <a href="#" className="text-blue-500 hover:underline ml-1">Sign Up</a>
        </div> */}
      </div>
    </div>
  );
}
