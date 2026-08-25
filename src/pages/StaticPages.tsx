import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown, CheckCircle2, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useToast } from '../context/ToastContext.js';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Our Brand Philosophy
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight">
          Shop Smart. Live Better.
        </h1>
        <p className="text-base text-zinc-600 leading-relaxed">
          Founded in 2026, Zylo was established with a singular mission: to make world-class design, acoustic excellence, premium apparel, and conscious beauty accessible with unmatched transparency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">
            01
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Meticulous Curation</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Every product in our catalog undergoes rigorous multi-point testing for build durability, ergonomic feel, and authentic materials.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
            02
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Direct From Artisans</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            By partnering directly with elite manufacturers and ethical workshops, we cut out inflated middlemen markups.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg">
            03
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Lifetime Commitment</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            All purchases come backed by our 30-day hassle-free return guarantee and dedicated 24/7 client care concierge.
          </p>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { success } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    success('Thank you! Your message has been sent to our customer care team.');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Contact Customer Support</h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          Have questions regarding an order, product sizing, or warranty claims? We're here 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-6">
            <h3 className="text-base font-black text-zinc-900">Contact Information</h3>
            
            <div className="space-y-4 text-xs text-zinc-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-zinc-900">Email Inquiries</div>
                  <div>support@novacart.com</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-zinc-900">Phone Support</div>
                  <div>+1 (800) 555-NOVA</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-zinc-900">Headquarters</div>
                  <div>500 Howard Street, Suite 400, San Francisco, CA</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm">
          <h3 className="text-base font-black text-zinc-900 mb-4">Send Us a Direct Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Your Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Subject *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Order tracking, sizing inquiry, etc."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Message *</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-zinc-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const FAQPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How fast will my order arrive?',
      a: 'Orders placed before 2:00 PM PST are packed and dispatched the same business day. Free standard delivery takes 2-4 business days. Priority express arrives in 1-2 business days.',
    },
    {
      q: 'What is your return policy?',
      a: 'We offer a 30-day no-questions-asked return policy on all eligible items. Items must be in original condition with manufacturer packaging.',
    },
    {
      q: 'Are all products authentic and covered by warranty?',
      a: 'Yes. Zylo is an authorized premium partner for all stocked brands. Every product includes an official warranty card.',
    },
    {
      q: 'How can I track my shipment?',
      a: 'You will receive real-time tracking numbers upon dispatch. You can also visit our Order Tracking page anytime to view live courier status.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover), UPI & Instant QR, and Cash on Delivery (COD).',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Frequently Asked Questions</h1>
        <p className="text-xs sm:text-sm text-zinc-500">Quick answers to common questions about Zylo services</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm transition-all"
          >
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full p-5 text-left font-bold text-zinc-900 text-sm flex items-center justify-between gap-4"
            >
              <span>{faq.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                  openIdx === idx ? 'rotate-180 text-indigo-600' : ''
                }`}
              />
            </button>
            {openIdx === idx && (
              <div className="px-5 pb-5 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6 text-zinc-700 leading-relaxed text-sm">
      <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-4">Shipping & Returns Policy</h1>
      <p>
        At Zylo, we are committed to delivering your purchases promptly, securely, and in pristine condition.
      </p>
      <h3 className="text-lg font-bold text-zinc-900 pt-4">1. Free Shipping Threshold</h3>
      <p>
        All domestic orders with a subtotal of $100 or greater qualify for Free Standard Delivery. Orders below $100 carry a flat shipping rate of $15.
      </p>
      <h3 className="text-lg font-bold text-zinc-900 pt-4">2. Returns & Refunds</h3>
      <p>
        If you are not completely satisfied with your purchase, you may initiate a return within 30 days of receipt. Refunds will be issued back to your original payment method within 3-5 business days of receiving the returned item.
      </p>
    </div>
  );
};
