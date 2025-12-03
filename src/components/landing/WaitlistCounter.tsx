import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function WaitlistCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { count: waitlistCount } = await supabase
        .from("beta_whitelist")
        .select("*", { count: "exact", head: true });
      
      if (waitlistCount !== null) {
        setCount(waitlistCount);
      }
    };

    fetchCount();
  }, []);

  // Animate counter
  useEffect(() => {
    if (count === null) return;
    
    const duration = 1500;
    const steps = 30;
    const increment = count / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= count) {
        setDisplayCount(count);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [count]);

  // Loading skeleton
  if (count === null) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full animate-pulse">
        <div className="flex -space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-muted border-2 border-background"
              style={{ zIndex: 3 - i }}
            />
          ))}
        </div>
        <div className="h-4 w-32 bg-muted rounded" />
      </div>
    );
  }

  if (count < 10) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full"
    >
      <div className="flex -space-x-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background"
            style={{ zIndex: 3 - i }}
          />
        ))}
      </div>
      <span className="text-sm font-medium">
        <AnimatePresence mode="wait">
          <motion.span
            key={displayCount}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-accent font-bold"
          >
            {displayCount.toLocaleString()}+
          </motion.span>
        </AnimatePresence>
        {" "}creators on the waitlist
      </span>
    </motion.div>
  );
}
