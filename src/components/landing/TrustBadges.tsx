import { Shield, Lock, Zap, Globe } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  { icon: Shield, label: "GDPR Compliant", description: "Privacy-first analytics" },
  { icon: Lock, label: "SSL Secured", description: "256-bit encryption" },
  { icon: Zap, label: "99.9% Uptime", description: "Enterprise reliability" },
  { icon: Globe, label: "Global CDN", description: "Fast worldwide" },
];

export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
      {badges.map((badge, index) => (
        <motion.div
          key={badge.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <badge.icon className="h-4 w-4 text-primary/70" />
          <span className="text-xs font-medium">{badge.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
