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
import { usePublicSettings } from '../../hooks/usePublicSettings';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const {
    getSiteSetting,
    footerLinks,
    socialMedia,
    contactInfo
  } = usePublicSettings();

  // Get dynamic settings
  const siteName = getSiteSetting('site_name') || 'Aligarh Attar House';
  const copyrightText = getSiteSetting('copyright_text') || `© ${currentYear} Aligarh Attar House. All rights reserved.`;
  const logoUrl = getSiteSetting('logo_url') || logo;

  // Group footer links by section
  const groupedFooterLinks = footerLinks.reduce((acc, link) => {
    if (!acc[link.section_name]) {
      acc[link.section_name] = [];
    }
    acc[link.section_name].push(link);
    return acc;
  }, {} as Record<string, typeof footerLinks>);

  // Get contact information
  const emailContact = contactInfo.find(c => c.contact_type === 'email' && c.is_primary);
  const phoneContact = contactInfo.find(c => c.contact_type === 'phone' && c.is_primary);
  const addressContact = contactInfo.find(c => c.contact_type === 'address' && c.is_primary);

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
                  src={logoUrl}
                  alt={siteName}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {siteName}
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
                {socialMedia.filter(s => s.is_active).map((social, index) => {
                  const IconComponent =
                    social.platform === 'facebook' ? Facebook :
                      social.platform === 'instagram' ? Instagram :
                        social.platform === 'twitter' ? Twitter :
                          social.platform === 'youtube' ? Youtube :
                            Facebook; // fallback icon

                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform_name}
                      className="w-9 h-9 rounded-lg bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-600 hover:border-purple-600 transition-all duration-300"
                    >
                      <IconComponent className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(groupedFooterLinks).map(([sectionName, links]) => (
            <div key={sectionName}>
              <h4 className="text-sm font-semibold mb-4 text-gray-200 uppercase tracking-wider">
                {sectionName}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.id}>
                    <Link
                      to={link.link_url}
                      target={link.opens_new_tab ? "_blank" : "_self"}
                      className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-200 inline-flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.link_text}
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
            {emailContact && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email Us</p>
                  <a href={`mailto:${emailContact.value}`} className="text-sm text-gray-300 hover:text-purple-400 transition-colors">
                    {emailContact.value}
                  </a>
                </div>
              </div>
            )}

            {phoneContact && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Call Us</p>
                  <a href={`tel:${phoneContact.value}`} className="text-sm text-gray-300 hover:text-purple-400 transition-colors">
                    {phoneContact.value}
                  </a>
                </div>
              </div>
            )}

            {addressContact && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Visit Us</p>
                  <p className="text-sm text-gray-300">
                    {addressContact.value}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700/50 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 flex items-center gap-1">
              {copyrightText}
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500">
              <Link to="/privacy-policy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-purple-400 transition-colors">Terms of Service</Link>
              <Link to="/refund-policy" className="hover:text-purple-400 transition-colors">Refund Policy</Link>
              <Link to="/shipping-policy" className="hover:text-purple-400 transition-colors">Shipping Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};