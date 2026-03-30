import { Star, Quote } from 'lucide-react';
import { motion } from 'motion/react';

const REVIEWS = [
  {
    id: 1,
    name: "Leo D Caprio",
    role: "Hollywood",
    content: "Zantro থেকে কেনা এই ফ্যানহুয়াবুয়ু অরেঞ্জ ব্যাকপ্যাকটি একদম স্টাইলিশ ও আকর্ষণীয়। Zantro-এর সার্ভিস নিয়ে আমি খুবই সন্তুষ্ট। তারা সত্যিই হাই-কোয়ালিটি প্রোডাক্ট সংগ্রহ করে এবং ক্রেতাদের জন্য সুন্দর স্টাইলিশ ডিজাইনের ব্যাগ নিয়ে আসে। প্যাকেজিং থেকে শুরু করে ডেলিভারি পর্যন্ত তাদের সার্ভিস ছিল দ্রুত ও নির্ভরযোগ্য। যারা স্টাইলিশ এবং প্র্যাকটিক্যাল ব্যাকপ্যাক খুঁজছেন, তাদের জন্য Zantro অবশ্যই একটা ভালো চয়েস।",
    rating: 5,
    avatar: "https://imgur.com/a/0MV4JFR"
  },
  {
    id: 2,
    name: "Deepika",
    role: "Bollywood",
    content: "Zantro থেকে পাওয়া এই হট পিঙ্ক ক্রস-হ্যাল্টার নেট বডিস্যুটটি একদম স্টাইলিশ। Zantro আবারও প্রমাণ করেছে যে তারা স্টাইলিশ ও ট্রেন্ডি প্রোডাক্ট সংগ্রহ করে ক্রেতাদের জন্য নিয়ে আসে। তাদের কালেকশনে এমন বোল্ড ও কোয়ালিটি আইটেম থাকায় অনেকেই খুশি হন। ডেলিভারি ও প্রোডাক্টের কোয়ালিটি নিয়ে Zantro-এর উপর আস্থা রাখা যায়।",
    rating: 5,
    avatar: "https://imgur.com/a/hLpVzzg"
  },
  {
    id: 3,
    name: "Hrithik",
    role: "Bollywood",
    content: "Zantro থেকে কেনা এই কালো-সাদা ওয়াটারপ্রুফ রাইডিং জ্যাকেটটি বৃষ্টিতে দারুণ কাজের। স্টর্ম-প্রুফ ওয়াটারপ্রুফ ফ্যাব্রিক, ভেন্টিলেশন সিস্টেম এবং রিফ্লেক্টিভ স্ট্রিপস থাকায় বৃষ্টির মধ্যেও নিরাপদে ও আরামে রাইড করা যায়। ডিজাইন স্টাইলিশ এবং ফিটিং ভালো। Zantro আবারও ভালো প্রোডাক্ট নিয়ে এসেছে। তাদের কোয়ালিটি ও নির্ভরযোগ্য সার্ভিসের জন্য ধন্যবাদ। বৃষ্টির দিনে বাইকারদের জন্য এটি চমৎকার চয়েস।",
    rating: 4,
    avatar: "https://imgur.com/a/2eyQllQ"
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
