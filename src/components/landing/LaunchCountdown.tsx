import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

export function LaunchCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // December 10, 2025, 00:00 Danish time (CET = UTC+1)
    // Which is December 9, 2025, 23:00 UTC
    const launchDate = new Date("2025-12-09T23:00:00Z");

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = launchDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeUnits = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <section className="container mx-auto px-6 py-24 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Glowing background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-3xl blur-3xl" />
        
        <div className="relative bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-12 text-center space-y-8">
          {/* Icon */}
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25"
          >
            <Rocket className="h-8 w-8 text-primary-foreground" />
          </motion.div>

          {/* Heading */}
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Launching in
              </span>
            </h2>
          </div>

          {/* Countdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto">
            {timeUnits.map((unit, index) => (
              <motion.div
                key={unit.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="relative group"
              >
                {/* Glowing effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative bg-background/80 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-2 group-hover:border-primary/50 transition-all duration-300">
                  <motion.div
                    key={unit.value}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent"
                  >
                    {String(unit.value).padStart(2, "0")}
                  </motion.div>
                  <div className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wider">
                    {unit.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Launch date */}
          <p className="text-sm text-muted-foreground">
            December 10, 2025 • 00:00 CET
          </p>
        </div>
      </motion.div>
    </section>
  );
}
