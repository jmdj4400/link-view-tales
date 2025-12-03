import { motion } from "framer-motion";
import { Play, MousePointerClick, BarChart3, Shield } from "lucide-react";

export function DemoVideo() {
  return (
    <section className="container mx-auto px-6 py-24 max-w-6xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          See LinkPeek in Action
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Watch how we track real delivered visits and recover lost clicks
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mx-auto max-w-4xl"
      >
        {/* Demo Placeholder - Replace with actual video/GIF when available */}
        <div className="relative aspect-video bg-gradient-to-br from-card to-muted rounded-2xl border border-border overflow-hidden shadow-2xl">
          {/* Animated Dashboard Preview */}
          <div className="absolute inset-0 p-6 md:p-8">
            {/* Top Bar */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-destructive/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <div className="flex-1 mx-4 h-6 bg-muted rounded-lg" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: MousePointerClick, label: "Link Clicks", value: "2,847" },
                { icon: BarChart3, label: "Integrity Score", value: "94.2%" },
                { icon: Shield, label: "Recovered", value: "127" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/50"
                >
                  <stat.icon className="h-5 w-5 text-primary mb-2" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Chart Area */}
            <div className="bg-background/30 rounded-xl p-4 border border-border/30 h-32 flex items-end justify-around">
              {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="w-8 bg-gradient-to-t from-primary to-primary/50 rounded-t-md"
                />
              ))}
            </div>
          </div>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer group">
            <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="h-8 w-8 text-primary-foreground ml-1" />
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
          className="absolute -left-4 top-1/4 bg-card border border-border rounded-lg p-3 shadow-lg hidden md:block"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium">Live tracking</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          viewport={{ once: true }}
          className="absolute -right-4 bottom-1/4 bg-card border border-border rounded-lg p-3 shadow-lg hidden md:block"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">127 clicks recovered</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
