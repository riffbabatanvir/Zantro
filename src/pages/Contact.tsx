import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
// WhatsApp SVG icon component
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 inline-block mr-1 text-green-500">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        toast.error('Failed to send message. Please try again later.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
    <Helmet>
      <title>Contact Us — Zantro</title>
      <meta name="description" content="Get in touch with Zantro. We're here to help with your orders and queries." />
      <meta property="og:title" content="Contact Us — Zantro" />
      <meta property="og:url" content="https://zantrobd.com/contact" />
    </Helmet>
    <div className="bg-white dark:bg-neutral-950 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Left Side: Info */}
          <div>
            <div className="mb-16">
              <h1 className="text-[11px] font-medium uppercase tracking-[0.4em] text-black/40 dark:text-white/40 mb-4">Contact</h1>
              <h2 className="text-5xl font-light tracking-tight text-black dark:text-white leading-tight">We're here to assist you.</h2>
            </div>

            <div className="space-y-12">
              <div>
                <h3 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black dark:text-white mb-4">General Inquiries</h3>
                <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">store@zantrobd.com</p>
                <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">+8801779102808</p>
                <a
                  href="https://wa.me/8801779102808"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-black/60 dark:text-white/60 hover:text-green-500 dark:hover:text-green-400 transition-colors leading-relaxed mt-1"
                >
                  <WhatsAppIcon />
                  WhatsApp Us
                </a>
              </div>

              <div>
                <h3 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black dark:text-white mb-4">Showroom</h3>
                <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">Kalapara</p>
                <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">Patuakhali, Bangladesh</p>
              </div>

              <div>
                <h3 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black dark:text-white mb-4">Hours</h3>
                <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">Open 24/7</p>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="bg-gray-50 dark:bg-neutral-900 p-12">
            <div className="mb-10">
              <h3 className="text-2xl font-light tracking-tight text-black dark:text-white">Send Message to Us</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-10">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full border-b border-black/10 dark:border-white/10 bg-transparent py-2 focus:border-black dark:border-white outline-none transition-colors text-sm" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Email *</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full border-b border-black/10 dark:border-white/10 bg-transparent py-2 focus:border-black dark:border-white outline-none transition-colors text-sm" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Phone</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border-b border-black/10 dark:border-white/10 bg-transparent py-2 focus:border-black dark:border-white outline-none transition-colors text-sm" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Subject</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full border-b border-black/10 dark:border-white/10 bg-transparent py-2 focus:border-black dark:border-white outline-none transition-colors text-sm" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Message *</label>
                <textarea 
                  rows={4} 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  className="w-full border-b border-black/10 dark:border-white/10 bg-transparent py-2 focus:border-black dark:border-white outline-none transition-colors text-sm resize-none"
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-5 text-[11px] font-medium uppercase tracking-[0.3em] hover:bg-black/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
