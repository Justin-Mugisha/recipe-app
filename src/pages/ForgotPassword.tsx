import { useState } from "react";
import type { FC } from "react";
import { useForgotPasswordMutation } from "@/features/authApi";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword: FC = () => {
  const [forgotPassword] = useForgotPasswordMutation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await forgotPassword({ email }).unwrap();
      setSuccess(true);
      setEmail("");
      console.log(result);
    } catch (err) {
      setError("Failed to send reset email. Please check your email and try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="mb-4 text-6xl text-green-500">✓</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to your email. Please check your inbox and follow the instructions.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-900">Forgot Password?</h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Login here
          </Link>
        </div>

        <div className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-green-600 hover:text-green-700 font-semibold">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
