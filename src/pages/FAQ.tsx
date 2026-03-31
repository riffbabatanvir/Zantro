import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    category: 'Shipping',
    items: [
      {
        q: 'Do you offer free shipping?',
        a: 'Yes! We offer free shipping for all orders within Patuakhali. For orders outside Patuakhali, a delivery charge applies depending on your location.'
      },
      {
        q: 'How long does delivery take?',
        a: 'Within Patuakhali: 1-2 business days. Outside Patuakhali: 3-5 business days depending on your location.'
      },
      {
        q: 'Do you deliver all over Bangladesh?',
        a: 'Yes, we deliver all over Bangladesh through our courier partners.'
      },
    ]
  },
  {
    category: 'Payment',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept bKash, Nagad, Credit/Debit cards, Cryptocurrency, and Cash on Delivery (COD).'
      },
      {
        q: 'Is online payment safe?',
        a: 'Yes, all online payments are processed securely. We do not store any card information.'
      },
      {
        q: 'Can I pay with Cash on Delivery?',
        a: 'Yes! Cash on Delivery is available for all orders across Bangladesh.'
      },
    ]
  },
  {
    category: 'Orders & Returns',
    items: [
      {
        q: 'How do I track my order?',
        a: 'After placing your order, you will receive an order ID. You can contact us via WhatsApp or the Contact page with your order ID to get a status update.'
      },
      {
        q: 'Can I cancel my order?',
        a: 'You can cancel your order within 24 hours of placing it by contacting us. After that, the order may already be dispatched.'
      },
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 7 days of delivery if the product is damaged or defective. Please contact us with photos of the issue.'
      },
      {
        q: 'What if I receive a wrong or damaged product?',
        a: 'Please contact us immediately via WhatsApp or the Contact page with your order ID and photos. We will arrange a replacement or refund.'
      },
    ]
  },
  {
    category: 'Products',
    items: [
      {
        q: 'Are all products genuine?',
        a: 'Yes, all products sold on Zantro are 100% genuine and sourced from verified suppliers.'
      },
      {
        q: 'How do I choose the right size?',
        a: 'Each product page shows available sizes. When in doubt, check the product description or contact us for guidance.'
      },
      {
        q: 'Can I leave a product review?',
        a: 'Yes! You can leave a review on any product page by scrolling down to the Customer Reviews section.'
      },
    ]
  },
];

export default function FAQ() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <div className="bg-white dark:bg-neutral-950 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 py-16 md:py-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black/40 dark:text-white/40 mb-6">Support</h2>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-black dark:text-white mb-4">
            Frequently Asked <span className="text-orange-500">Questions</span>
          </h1>
          <p className="text-sm text-black/50 dark:text-white/50 font-light">
            Can't find your answer? <a href="/contact" className="text-orange-500 hover:underline font-medium">Contact us</a>
          </p>
        </motion.div>

        {/* FAQ Sections */}
        <div className="space-y-12">
          {FAQS.map((section, sIdx) => (
            <motion.div key={section.category} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: sIdx * 0.1 }}>
              <h3 className="text-[11px] font-medium uppercase tracking-[0.3em] text-orange-500 mb-4">{section.category}</h3>
              <div className="space-y-2">
                {section.items.map((item, iIdx) => {
                  const key = `${sIdx}-${iIdx}`;
                  const isOpen = openItem === key;
                  return (
                    <div key={key} className="border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden">
                      <button onClick={() => setOpenItem(isOpen ? null : key)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors">
                        <span className="text-sm font-bold text-black dark:text-white pr-4">{item.q}</span>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
                          <ChevronDown size={16} className="text-black/40 dark:text-white/40" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <div className="px-6 pb-4 border-t border-black/5 dark:border-white/5">
                              <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed pt-3">{item.a}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-16 p-8 bg-orange-50 dark:bg-orange-900/20 rounded-2xl text-center">
          <h3 className="text-lg font-black text-black dark:text-white mb-2">Still have questions?</h3>
          <p className="text-sm text-black/50 dark:text-white/50 mb-4">We're here to help. Reach out to us anytime.</p>
          <a href="/contact" className="inline-block bg-orange-500 text-white px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest hover:bg-orange-600 transition-colors">
            Contact Us
          </a>
        </motion.div>
      </div>
    </div>
  );
}
