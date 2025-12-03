import { motion } from "framer-motion";
import { Link2, BarChart3, RefreshCw, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Link2,
    title: "Create Your Link Page",
    description: "Set up your personalized link in bio page in seconds. Add all your important links in one place.",
  },
  {
    icon: BarChart3,
    title: "Share & Track",
    description: "Add your LinkPeek URL to Instagram, TikTok, or any social platform. We track every visitor.",
  },
  {
    icon: RefreshCw,
    title: "We Recover Lost Clicks",
    description: "Our tech detects in-app browser failures and recovers clicks that would otherwise be lost.",
  },
  {
    icon: TrendingUp,
    title: "See Real Results",
    description: "Get accurate analytics showing real delivered visits—not inflated platform metrics.",
  },
];

export function HowItWorks() {
  return (
    <section className="container mx-auto px-6 py-24 max-w-6xl">
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold"
          >
            How{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              LinkPeek
            </span>{" "}
            Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Get accurate traffic data in 4 simple steps
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Step number */}
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-lg" />
                  <div className="relative w-16 h-16 rounded-2xl bg-card border border-border/50 flex items-center justify-center">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
