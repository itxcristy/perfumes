import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { showSuccess } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      showSuccess('Thank you for subscribing to our newsletter.', 'Successfully Subscribed!');
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <section className="py-12 md:py-16 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-white">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-8">
            <Mail className="h-10 w-10 text-gray-300" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Stay Connected
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Subscribe to our newsletter for exclusive access to new collections, sophisticated design insights, and curated offers.
            Join our community of discerning customers.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row max-w-lg mx-auto gap-4"
          >
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 text-lg bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isSubscribed ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Subscribed!</span>
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  <span>Subscribe</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-400">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="font-medium">Exclusive Access</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="font-medium">No Spam Promise</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="font-medium">Unsubscribe Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
