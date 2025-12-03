import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Fitness Coach",
    company: "FitLife Studio",
    handle: "@sarahfitness",
    avatar: "SC",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    quote: "LinkPeek helped me recover 47 sessions per day that were getting lost in Instagram's in-app browser. My conversion rate jumped 23%.",
    stats: "+23% conversion rate",
    verified: true
  },
  {
    name: "Marcus Rivera",
    role: "Tech Content Creator",
    company: "TechMarco Media",
    handle: "@techmarco",
    avatar: "MR",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    quote: "Finally, I can see exactly where my TikTok traffic goes. The flow visualization showed me I was losing 40% of clicks - now it's down to 8%.",
    stats: "40% → 8% traffic loss",
    verified: true
  },
  {
    name: "Emma Thompson",
    role: "E-commerce Founder",
    company: "ShopEmma Co.",
    handle: "@shopemma",
    avatar: "ET",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    quote: "The channel benchmarks are gold. I discovered my LinkedIn traffic converts 4x better than Instagram. Completely changed my content strategy.",
    stats: "4x better ROI on LinkedIn",
    verified: true
  }
];

export function Testimonials() {
  return (
    <section className="container mx-auto px-6 py-24 max-w-7xl border-t" aria-labelledby="testimonials-heading">
      <div className="max-w-2xl mb-12 text-center mx-auto">
        <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-heading font-bold mb-3 leading-tight">
          Trusted by creators and teams
        </h2>
        <p className="text-base text-muted-foreground">
          See how LinkPeek helps professionals optimize their social traffic
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border hover:border-primary/30 transition-all duration-300 relative h-full hover:shadow-lg">
              <CardContent className="pt-6 space-y-4">
                <Quote className="h-8 w-8 text-primary/20" />
                
                <p className="text-sm leading-relaxed">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-sm flex items-center gap-1">
                      {testimonial.name}
                      {testimonial.verified && (
                        <BadgeCheck className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    <div className="text-xs text-muted-foreground/70">{testimonial.company}</div>
                  </div>
                </div>

                <div className="text-xs font-medium text-primary bg-primary/5 px-3 py-1.5 rounded-full inline-block">
                  {testimonial.stats}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
