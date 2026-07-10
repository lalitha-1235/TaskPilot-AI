import { loginUser } from "@/services/authService";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, ShieldAlert } from "lucide-react";
import AuthInput from "./AuthInput";
import AuthCheckbox from "./AuthCheckbox";
import { Button } from "../ui/button";

function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear errors on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      tempErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      tempErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      tempErrors.password = "Password must be at least 8 characters";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validate()) return;
  
    try {
      setIsLoading(true);
  
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });
  
      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );
  
      setLoginSuccess(true);
  
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
  
    } catch (error) {
      setErrors({
        password:
          error.response?.data?.message ||
          "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
          Welcome back
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Access your workspaces and AI assistants.
        </p>
      </div>

      {loginSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center"
        >
          <div className="size-12 rounded-full bg-emerald-500/25 flex items-center justify-center mx-auto text-emerald-400 mb-3.5">
            <LogIn size={22} className="ml-0.5 animate-pulse" />
          </div>
          <h3 className="text-md font-bold text-emerald-400">Authentication successful</h3>
          <p className="text-xs text-zinc-400 mt-1 leading-normal">
            Redirecting to TaskPilot dashboard...
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Email field */}
          <AuthInput
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="name@company.com"
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isLoading}
            autoComplete="email"
          />

          {/* Password field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-400 select-none"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition-colors outline-none focus-visible:underline"
              >
                Forgot password?
              </Link>
            </div>
            
            <AuthInput
              id="password"
              name="password"
              type="password"
              placeholder="••••••••••••"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {/* Remember me checkbox */}
          <AuthCheckbox
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            label="Keep me signed in on this device"
            disabled={isLoading}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white border-0 font-semibold rounded-xl text-sm transition-all duration-300 relative overflow-hidden group shadow-lg shadow-purple-500/10"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying Credentials...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5 group-hover:scale-[1.01] transition-transform">
                Sign In
                <LogIn size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            )}
            
            {/* Glossy gradient effect on hover */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
          </Button>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800/80"></div>
            </div>
            <span className="relative px-3 bg-[#09090B] text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
              Or continue with
            </span>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Google */}
            <button
              type="button"
              className="h-10 border border-zinc-800 hover:border-zinc-700/80 hover:bg-zinc-950/40 rounded-xl flex items-center justify-center gap-2 text-zinc-300 text-xs font-semibold transition-all duration-200 cursor-pointer"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google
            </button>

            {/* GitHub */}
            <button
              type="button"
              className="h-10 border border-zinc-800 hover:border-zinc-700/80 hover:bg-zinc-950/40 rounded-xl flex items-center justify-center gap-2 text-zinc-300 text-xs font-semibold transition-all duration-200 cursor-pointer"
            >
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                />
              </svg>
              GitHub
            </button>
          </div>

          <div className="w-full text-center mt-6">
            <button
              type="button"
              className="w-full h-10 border border-zinc-800 hover:border-zinc-700/80 hover:bg-zinc-950/40 rounded-xl flex items-center justify-center gap-2 text-zinc-300 text-xs font-semibold transition-all duration-200 cursor-pointer"
            >
              <ShieldAlert size={14} className="text-purple-400" />
              Sign in with Enterprise SAML
            </button>
          </div>

          {/* Registration Navigation */}
          <p className="text-center text-xs text-zinc-500 mt-6 select-none">
            New to TaskPilot AI?{" "}
            <Link
              to="/register"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors outline-none focus-visible:underline"
            >
              Create enterprise account
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}

export default LoginForm;
