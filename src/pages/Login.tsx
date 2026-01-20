import { useState } from "react";
import type { FC } from "react";
import { useLoginMutation } from "@/features/authApi";
import { useNavigate, Link, useLocation } from "react-router-dom";

const Login: FC = () => {
  const [login] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("kminchelle@gmail.com");
  const [password, setPassword] = useState("0lelplR");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get success message from signup redirect
  const message = (location.state as { message?: string } | null)?.message || "";

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await login({ username: email, password }).unwrap();
      localStorage.setItem("token", res.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Login</h2>

        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email / Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email or username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />
          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-green-600 hover:text-green-700 font-semibold">
            Sign up here
          </Link>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Demo credentials: kminchelle@gmail.com / 0lelplR
        </p>
      </div>
    </div>
  );
};

export default Login;
