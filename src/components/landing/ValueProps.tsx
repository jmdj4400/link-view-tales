import { motion } from "framer-motion";
import { TrendingUp, Eye, Shield, Smartphone, BarChart3, Zap } from "lucide-react";

const props = [
  {
    icon: Eye,
    title: "See Real Visits",
    description: "Track actual delivered clicks, not platform-reported taps",
    highlight: "Not vanity metrics",
  },
  {
    icon: Smartphone,
    title: "Fix In-App Browsers",
    description: "Recover clicks lost to Instagram, TikTok, and social webviews",
    highlight: "Up to 40% recovery",
  },
  {
    icon: TrendingUp,
    title: "Boost Conversions",
    description: "Optimize your funnel with real engagement data",
    highlight: "Average +23% lift",
  },
  {
    icon: Shield,
    title: "Privacy-First",
    description: "GDPR compliant analytics without invasive tracking",
    highlight: "No cookies needed",
  },
  {
    icon: BarChart3,
    title: "Channel Intelligence",
    description: "Compare performance across Instagram, TikTok, Twitter, and more",
    highlight: "Cross-platform insights",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Sub-50ms redirects with global edge delivery",
    highlight: "Zero delay",
  },
];

export function ValueProps() {
  return (
    <section className="container mx-auto px-6 py-24 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Why creators switch to{" "}
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            LinkPeek
          </span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Stop losing traffic to broken in-app browsers. See where your audience actually lands.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {props.map((prop, index) => (
          <motion.div
            key={prop.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                  <prop.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{prop.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {prop.description}
                  </p>
                  <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {prop.highlight}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
