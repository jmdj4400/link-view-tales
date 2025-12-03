import { motion } from "framer-motion";

const publications = [
  { name: "TechCrunch", logo: "TC" },
  { name: "Product Hunt", logo: "PH" },
  { name: "Indie Hackers", logo: "IH" },
  { name: "Hacker News", logo: "YC" },
];

export function FeaturedIn() {
  return (
    <section className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="text-center mb-8">
        <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
          Coming Soon To
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
        {publications.map((pub, index) => (
          <motion.div
            key={pub.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex items-center gap-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center font-bold text-sm">
              {pub.logo}
            </div>
            <span className="text-sm font-medium">{pub.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
