import { Star, Quote } from 'lucide-react';
import { motion } from 'motion/react';

const REVIEWS = [
  {
    id: 1,
    name: "Alex Thompson",
    role: "Tech Enthusiast",
    content: "The DIBAI Minimalist Backpack is a game changer. The build quality is unmatched, and it actually lives up to the waterproof hype. Best purchase this year!",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=alex"
  },
  {
    id: 2,
    name: "Elena Rodriguez",
    role: "Graphic Designer",
    content: "I've been using the Jeep Spirit Jacket for my daily commute. It's stylish, durable, and handles the rain perfectly. Highly recommended for professionals.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=elena"
  },
  {
    id: 3,
    name: "David Chen",
    role: "Fitness Coach",
    content: "The 720° Metal Stand is exactly what I needed for my desk. Sturdy build and the rotation is smooth. Great value for the price.",
    rating: 4,
    avatar: "https://i.pravatar.cc/150?u=david"
  }
];

export default function ReviewSection() {
  return (
    <section className="py-32 bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-20">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black/40 dark:text-white/40 mb-4">Testimonials</h2>
          <div className="h-px w-12 bg-black/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {REVIEWS.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover grayscale"
                  referrerPolicy="no-referrer"
                />
                <div className="flex items-center space-x-1 text-black dark:text-white">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-black/10 dark:text-white/10"} />
                  ))}
                </div>
              </div>

              <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed font-light italic">
                "{review.content}"
              </p>

              <div className="pt-6 border-t border-black/5 dark:border-white/5">
                <h4 className="text-[11px] font-medium uppercase tracking-widest text-black dark:text-white">{review.name}</h4>
                <p className="text-[10px] text-black/30 dark:text-white/30 uppercase tracking-widest mt-1">{review.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
