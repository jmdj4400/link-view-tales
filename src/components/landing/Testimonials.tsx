import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Fitness Coach",
    handle: "@sarahfitness",
    avatar: "SC",
    quote: "LinkPeek helped me recover 47 sessions per day that were getting lost in Instagram's in-app browser. My conversion rate jumped 23%.",
    stats: "+23% conversion rate"
  },
  {
    name: "Marcus Rivera",
    role: "Tech Content Creator",
    handle: "@techmarco",
    avatar: "MR",
    quote: "Finally, I can see exactly where my TikTok traffic goes. The flow visualization showed me I was losing 40% of clicks - now it's down to 8%.",
    stats: "40% → 8% traffic loss"
  },
  {
    name: "Emma Thompson",
    role: "E-commerce Founder",
    handle: "@shopemma",
    avatar: "ET",
    quote: "The channel benchmarks are gold. I discovered my LinkedIn traffic converts 4x better than Instagram. Completely changed my content strategy.",
    stats: "4x better ROI on LinkedIn"
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
          <Card key={index} className="border hover:border-primary/30 transition-colors relative">
            <CardContent className="pt-6 space-y-4">
              <Quote className="h-8 w-8 text-primary/20" />
              
              <p className="text-sm leading-relaxed">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {testimonial.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role} • {testimonial.handle}</div>
                </div>
              </div>

              <div className="text-xs font-medium text-primary bg-primary/5 px-3 py-1.5 rounded-full inline-block">
                {testimonial.stats}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
