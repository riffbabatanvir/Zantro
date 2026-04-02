import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
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
                <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">riffbaba@gmail.com</p>
                <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">+8801779102808</p>
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
  );
}
