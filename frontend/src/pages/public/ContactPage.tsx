import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Support & Concierge
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mt-1">
          Contact Our Optical Team
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Have an inquiry regarding custom high-index prescription glazing, frame fitment, or corporate orders? Send us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact form */}
        <div className="md:col-span-7 bg-white border border-neutral-200 rounded-xl p-6">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-neutral-900">Message Received</h3>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                Thank you, {name}. Our clinic concierge will contact you at {phone} within 2 business hours.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSubmitted(false);
                  setMessage('');
                }}
              >
                Send Another Note
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  How can our optometrists assist you?
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your question or required prescription specifications..."
                  className="w-full rounded-md border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  required
                />
              </div>
              <Button type="submit" size="md" className="w-full" icon={<Send className="w-4 h-4" />}>
                Send Message to Optical Desk
              </Button>
            </form>
          )}
        </div>

        {/* Quick contacts */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-neutral-900">Direct Inquiries</h3>
            <div className="space-y-3 text-neutral-600">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-neutral-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-900 block">Telephone Support</span>
                  <span>+91 (022) 2640 8899</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-neutral-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-900 block">General & Orders</span>
                  <span>concierge@ocusphere.in</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-neutral-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-900 block">Showroom</span>
                  <span>401 Turner Road, Bandra West, Mumbai</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
