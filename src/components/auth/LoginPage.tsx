import React, { useState } from "react";
import { LogIn, Mail, Lock } from "lucide-react";
import { authAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

interface LoginPageProps {
  onSwitchToSignUp: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignUp }) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.signIn(credentials);

      if (response.status === "success" && response.data) {
        login(
          {
            id: 0, // Will be updated from backend
            email: credentials.email,
            name: "", // Will be updated from backend
            role: response.data.role,
          },
          response.data.token
        );
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 dark:bg-blue-900/30 w-40 h-20 rounded-lg overflow-hidden mx-auto mb-4">
            <img
              src="https://rainbowpages.lk/uploads/listings/logo/m/metro37.jpg"
              alt="Metropolitan Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome Back
          </h1>
        
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignUp}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
