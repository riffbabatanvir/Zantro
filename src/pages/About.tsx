import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <>
    <Helmet>
      <title>About Us — Zantro</title>
      <meta name="description" content="Learn about Zantro — Bangladesh's trusted online shop with the best products and fast delivery." />
      <meta property="og:title" content="About Us — Zantro" />
      <meta property="og:url" content="https://zantrobd.com/about" />
    </Helmet>
    <div className="bg-white dark:bg-neutral-950 text-black dark:text-white">

      {/* Hero */}
      <section className="py-24 md:py-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black/40 dark:text-white/40 mb-6">About Us</h2>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight mb-8">
            We are <span className="text-orange-500">Zantro.</span>
          </h1>
          <p className="text-lg text-black/50 dark:text-white/50 font-light leading-relaxed">
            Curated essentials for the modern lifestyle. We bring you quality products with simplicity and purpose in every detail.
          </p>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="h-px bg-black/5 dark:bg-white/5 mx-6 lg:mx-12" />

      {/* Our Story */}
      <section className="py-24 md:py-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black/40 dark:text-white/40 mb-6">Our Story</h2>
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-8">Built for everyday people.</h3>
            <p className="text-sm text-black/50 dark:text-white/50 font-light leading-relaxed mb-6">
              Zantro was founded with a simple mission — to make high-quality products accessible to everyone. We carefully source and curate every item in our store to ensure it meets our standards of quality, design, and value.
            </p>
            <p className="text-sm text-black/50 dark:text-white/50 font-light leading-relaxed">
              From fashion to electronics, home essentials to accessories — every product we carry is chosen with care and purpose.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-orange-50 dark:bg-neutral-900 rounded-2xl p-12 text-center"
          >
            <div className="text-6xl font-black text-orange-500 mb-4">Z</div>
            <p className="text-sm text-black/40 dark:text-white/40 uppercase tracking-widest">Zantro</p>
            <p className="text-xs text-black/30 dark:text-white/30 mt-2">Clothing · Gadgets · More</p>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-black/5 dark:bg-white/5 mx-6 lg:mx-12" />

      {/* Values */}
      <section className="py-24 md:py-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black/40 dark:text-white/40 mb-6">Our Values</h2>
          <h3 className="text-3xl md:text-4xl font-black tracking-tighter">What we stand for.</h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "Quality", desc: "Every product is carefully selected to meet our high standards. We never compromise on quality." },
            { title: "Simplicity", desc: "We believe great design is simple. Our products are clean, minimal, and built to last." },
            { title: "Purpose", desc: "We only stock products that serve a real purpose. Nothing unnecessary, everything intentional." },
          ].map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border-t border-black/10 dark:border-white/10 pt-8"
            >
              <div className="text-orange-500 font-black text-sm uppercase tracking-widest mb-4">0{i + 1}</div>
              <h4 className="text-xl font-black tracking-tighter mb-4">{value.title}</h4>
              <p className="text-sm text-black/50 dark:text-white/50 font-light leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-black/5 dark:bg-white/5 mx-6 lg:mx-12" />

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 lg:px-12 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl md:text-5xl font-black tracking-tighter mb-8">Ready to explore?</h3>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-full text-sm font-black hover:bg-orange-600 transition-colors shadow-lg"
          >
            SHOP NOW <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

    </div>
    </>
  );
}
