import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, KeyRound, CheckCircle2, RotateCw } from "lucide-react";
import AuthInput from "./AuthInput";
import { Button } from "../ui/button";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // OTP code verification simulation
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(59);
  const otpRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (isSubmitted && resendTimer > 0 && !otpSuccess) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSubmitted, resendTimer, otpSuccess]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // keep last char
    setOtp(newOtp);
    if (otpError) setOtpError("");

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace back-focus
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }
    return true;
  };

  const handleSendReset = (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setResendTimer(59);
    }, 1500);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setOtpError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      if (code === "123456" || code.startsWith("9") || code.endsWith("0")) {
        setOtpSuccess(true);
      } else {
        setOtpError("Incorrect security code. Please check your email or resend.");
      }
    }, 1500);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setResendTimer(59);
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      otpRefs.current[0]?.focus();
    }, 1000);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          // STAGE 1: Request Email
          <motion.div
            key="stage-email"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
                Reset Password
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Enter your email address to receive reset instructions.
              </p>
            </div>

            <form onSubmit={handleSendReset} className="mt-8 space-y-5">
              <AuthInput
                id="email"
                type="email"
                label="Email Address"
                placeholder="name@company.com"
                icon={Mail}
                value={email}
                onChange={handleEmailChange}
                error={error}
                disabled={isLoading}
                autoComplete="email"
              />

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
                    Sending Security Code...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5 group-hover:scale-[1.01] transition-transform">
                    Send Security Code
                  </span>
                )}
                
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
              </Button>

              <Link
                to="/login"
                className="w-full h-10 border border-zinc-800 hover:border-zinc-700/80 hover:bg-zinc-950/40 rounded-xl flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-all duration-200 outline-none focus-visible:border-zinc-600"
              >
                <ArrowLeft size={14} />
                Back to Sign In
              </Link>
            </form>
          </motion.div>
        ) : otpSuccess ? (
          // STAGE 3: Password Reset Successful
          <motion.div
            key="stage-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="size-14 rounded-full bg-emerald-500/25 flex items-center justify-center mx-auto text-emerald-400 mb-4 animate-bounce">
              <CheckCircle2 size={28} />
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
              Identity Verified
            </h2>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              We've successfully verified your security credentials. A temporary secure password reset link has been emailed to you.
            </p>
            
            <div className="mt-8 space-y-4">
              <Link
                to="/login"
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white flex items-center justify-center font-semibold rounded-xl text-sm transition-all duration-300 shadow-lg shadow-purple-500/10"
              >
                Return to Login
              </Link>
            </div>
          </motion.div>
        ) : (
          // STAGE 2: Verification Code (OTP) Sent
          <motion.div
            key="stage-otp"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center justify-center sm:justify-start gap-2.5">
                <KeyRound className="size-6 text-purple-400" />
                Security Verification
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                We sent a 6-digit code to <span className="text-zinc-200 font-semibold">{email}</span>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
              {/* 6 Digit Inputs */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 select-none block mb-3 text-center sm:text-left">
                  Enter verification code
                </label>
                
                <div className="flex justify-between gap-2 max-w-sm mx-auto sm:mx-0">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      disabled={isLoading}
                      className={`size-11 sm:size-12 text-center text-lg font-bold bg-zinc-950/50 border rounded-xl text-zinc-100 transition-all duration-200 outline-none ${
                        otpError
                          ? "border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                          : "border-zinc-800 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
                      }`}
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {otpError && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400 font-medium text-center sm:text-left mt-3"
                    >
                      {otpError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Code */}
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
                    Verifying Code...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5 group-hover:scale-[1.01] transition-transform">
                    Verify & Continue
                  </span>
                )}
              </Button>

              {/* Resend Actions */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-3 pt-2 text-xs">
                <span className="text-zinc-500">
                  Didn't receive the email?
                </span>
                
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || isLoading}
                  className={`flex items-center gap-1.5 font-semibold transition-colors outline-none cursor-pointer ${
                    resendTimer > 0
                      ? "text-zinc-600 cursor-not-allowed"
                      : "text-cyan-400 hover:text-cyan-300"
                  }`}
                >
                  <RotateCw size={13} className={isLoading ? "animate-spin" : ""} />
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
                </button>
              </div>

              {/* Navigation Back */}
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="w-full h-10 border border-zinc-800 hover:border-zinc-700/80 hover:bg-zinc-950/40 rounded-xl flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-all duration-200 outline-none cursor-pointer"
              >
                <ArrowLeft size={14} />
                Use a different email
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ForgotPasswordForm;
