import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function AuthInput({
  label,
  error,
  icon: Icon,
  type = "text",
  className,
  id,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-wider text-zinc-400 select-none"
        >
          {label}
        </label>
      )}
      
      <div className="relative flex items-center group">
        {Icon && (
          <div className="absolute left-3.5 text-zinc-400 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        
        <input
          id={id}
          type={inputType}
          className={cn(
            "w-full h-11 bg-zinc-950/50 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-xl px-3.5 text-sm transition-all outline-none",
            "hover:border-zinc-700/80 focus:border-purple-500/80 focus:ring-4 focus:ring-purple-500/10 focus:bg-zinc-950/70",
            Icon && "pl-11",
            isPassword && "pr-11",
            error && "border-red-500/50 hover:border-red-500/70 focus:border-red-500 focus:ring-red-500/10"
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-zinc-400 hover:text-zinc-200 focus:text-zinc-200 transition-colors outline-none cursor-pointer"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={showPassword ? "hide" : "show"}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </motion.div>
            </AnimatePresence>
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-xs text-red-400 font-medium flex items-center gap-1 mt-0.5"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AuthInput;
