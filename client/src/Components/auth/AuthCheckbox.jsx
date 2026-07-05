import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function AuthCheckbox({
  id,
  checked,
  onChange,
  label,
  error,
  className,
  ...props
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="flex items-start gap-2.5 text-sm text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer select-none"
      >
        <div className="relative mt-0.5">
          {/* Hidden input for accessibility/standard forms */}
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only"
            {...props}
          />
          
          {/* Custom visible checkbox */}
          <div
            className={cn(
              "size-5 rounded-md border border-zinc-800 bg-zinc-950/50 flex items-center justify-center transition-all duration-200",
              "group-hover:border-zinc-700",
              checked && "border-purple-500/80 bg-gradient-to-r from-purple-500/20 to-cyan-500/20",
              error && "border-red-500/50"
            )}
          >
            <AnimatePresence initial={false}>
              {checked && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="text-cyan-400"
                >
                  <Check size={14} strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <span className="flex-1 text-sm leading-tight select-none">
          {label}
        </span>
      </label>
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="text-xs text-red-400 font-medium ml-7 mt-0.5"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AuthCheckbox;
