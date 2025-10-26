import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
  Heart,
  Shield,
  Truck,
  CreditCard,
  Award
} from 'lucide-react';
import logo from '../../assets/images/logo.png';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Shop',
      links: [
        { name: 'All Products', href: '/products' },
        { name: 'New Arrivals', href: '/new-arrivals' },
        { name: 'Best Sellers', href: '/best-sellers' },
        { name: 'Special Offers', href: '/deals' },
        { name: 'Gift Cards', href: '/gift-cards' },
      ],
    },
    {
      title: 'Customer Care',
      links: [
        { name: 'Contact Us', href: '/contact' },
        { name: 'Track Order', href: '/track-order' },
        { name: 'Returns & Refunds', href: '/returns' },
        { name: 'Shipping Info', href: '/shipping' },
        { name: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: 'About',
      links: [
        { name: 'Our Story', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
        { name: 'Sustainability', href: '/sustainability' },
        { name: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'Accessibility', href: '/accessibility' },
      ],
    },
  ];

  const features = [
    { icon: <Truck className="h-5 w-5" />, text: 'Free Shipping Over ₹999' },
    { icon: <Shield className="h-5 w-5" />, text: '100% Authentic Products' },
    { icon: <CreditCard className="h-5 w-5" />, text: 'Secure Payment' },
    { icon: <Award className="h-5 w-5" />, text: 'Premium Quality' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Features Bar */}
      <div className="border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 justify-center md:justify-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400">
                  {feature.icon}
                </div>
                <span className="text-sm text-gray-300 hidden sm:block">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 p-2 shadow-lg group-hover:shadow-purple-500/50 transition-shadow duration-300">
                <img
                  src={logo}
                  alt="Aligarh Attar House"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Aligarh Attar House
                </h3>
                <p className="text-xs text-gray-400">Premium Fragrances</p>
              </div>
            </Link>

            <p className="text-gray-400 mb-6 leading-relaxed text-sm">
              Experience the essence of luxury with our curated collection of authentic attars and perfumes.
              Crafted with passion, delivered with care.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-3 text-gray-200">Stay Updated</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <button className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/50">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-200">Follow Us</h4>
              <div className="flex gap-3">
                {[
                  { icon: <Facebook className="h-4 w-4" />, href: '#', label: 'Facebook' },
                  { icon: <Instagram className="h-4 w-4" />, href: '#', label: 'Instagram' },
                  { icon: <Twitter className="h-4 w-4" />, href: '#', label: 'Twitter' },
                  { icon: <Youtube className="h-4 w-4" />, href: '#', label: 'YouTube' },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-600 hover:border-purple-600 transition-all duration-300"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold mb-4 text-gray-200 uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-200 inline-flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email Us</p>
                <a href="mailto:support@aligarhattarhouse.com" className="text-sm text-gray-300 hover:text-purple-400 transition-colors">
                  support@aligarhattarhouse.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Call Us</p>
                <a href="tel:+911234567890" className="text-sm text-gray-300 hover:text-purple-400 transition-colors">
                  +91 123 456 7890
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Visit Us</p>
                <p className="text-sm text-gray-300">
                  Aligarh, Uttar Pradesh, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700/50 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 flex items-center gap-1">
              © {currentYear} Aligarh Attar House. Made with <Heart className="h-3 w-3 text-red-500 fill-current" /> in India
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500">
              <Link to="/privacy" className="hover:text-purple-400 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-purple-400 transition-colors">Terms</Link>
              <Link to="/cookies" className="hover:text-purple-400 transition-colors">Cookies</Link>
              <Link to="/sitemap" className="hover:text-purple-400 transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
