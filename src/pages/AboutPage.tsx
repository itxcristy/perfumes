import React from 'react';
import { MapPin, Award, Clock, Users, Leaf, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import storefrontImage from '../assets/images/about/aligarh-attar-house-srinagar-book-shops-f67i0wj83m.jpg';
import ownerImage from '../assets/images/about/aligarh-attar-house-maisuma-srinagar-book-shops-ii5m0laxaw.jpg';

export const AboutPage: React.FC = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-amber-900 to-amber-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Aligarh Attar House
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-amber-100"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Crafting Heritage Fragrances Since 1985
            </motion.p>
            <motion.div 
              className="flex items-center justify-center text-lg text-amber-200"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <MapPin className="mr-2 h-5 w-5" />
              <span>Gaw Kadal, Srinagar, Kashmir</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Established in 1985 in the heart of Srinagar's historic Gaw Kadal, Aligarh Attar House has been 
                a beacon of traditional perfumery for nearly four decades. What began as a small family-run 
                enterprise has blossomed into Kashmir's most revered attar house.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Our journey began with Mohammad Altaf Ahmad, a master perfumer who inherited the ancient art 
                of attar distillation from his forefathers. With unwavering dedication to preserving traditional 
                techniques while embracing modern quality standards, he laid the foundation for a legacy that 
                continues to flourish today.
              </p>
              <p className="text-lg text-gray-700">
                Today, under the stewardship of the third generation, we continue to honor our heritage while 
                innovating to meet contemporary preferences, ensuring that each bottle carries the soul of Kashmir.
              </p>
            </motion.div>
            <motion.div 
              className="relative"
              variants={itemVariants}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={storefrontImage} 
                  alt="Aligarh Attar House Storefront" 
                  className="w-full h-96 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-amber-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center">
                  <Award className="h-8 w-8 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">39+</p>
                    <p className="text-sm">Years of Excellence</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Heritage Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Preserving Kashmiri Heritage
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Our traditional attars are crafted using time-honored techniques passed down through generations
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg text-center"
              variants={itemVariants}
            >
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Natural Ingredients</h3>
              <p className="text-gray-700">
                We source only the finest natural ingredients from the pristine valleys of Kashmir, 
                ensuring authentic and pure fragrances that capture the essence of nature.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg text-center"
              variants={itemVariants}
            >
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Traditional Methods</h3>
              <p className="text-gray-700">
                Our artisans employ age-old distillation techniques that have been perfected over centuries, 
                preserving the intricate nuances and depth that modern methods often miss.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg text-center"
              variants={itemVariants}
            >
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Crafted with Passion</h3>
              <p className="text-gray-700">
                Every bottle is a testament to our passion for perfection. Our master perfumers dedicate 
                weeks to crafting each fragrance, ensuring unparalleled quality and longevity.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Owner Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="order-2 lg:order-1"
              variants={itemVariants}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={ownerImage} 
                  alt="Mohammad Altaf Ahmad III, Master Perfumer" 
                  className="w-full h-96 object-cover"
                />
              </div>
            </motion.div>
            <motion.div 
              className="order-1 lg:order-2"
              variants={itemVariants}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Meet Our Master Perfumer
              </h2>
              <h3 className="text-2xl font-semibold text-amber-600 mb-4">
                Mohammad Altaf Ahmad III
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                As the third-generation custodian of Aligarh Attar House, Mohammad Altaf Ahmad III brings 
                together traditional wisdom and modern innovation. Trained under his grandfather since childhood, 
                he mastered the delicate art of attar distillation at a young age.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                His profound understanding of aromatic chemistry and unwavering commitment to quality has 
                elevated our brand to new heights. Under his leadership, we've expanded our repertoire to 
                include over 150 distinctive fragrances while maintaining the authenticity that defines us.
              </p>
              <div className="flex items-center text-gray-700">
                <Users className="h-5 w-5 mr-2 text-amber-600" />
                <span>Leading a team of 25 skilled artisans and perfumers</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Principles that guide everything we do
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm"
              variants={itemVariants}
            >
              <h3 className="text-xl font-bold mb-3 text-amber-400">Authenticity</h3>
              <p className="text-gray-300">
                We remain true to traditional methods and natural ingredients, never compromising on quality.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm"
              variants={itemVariants}
            >
              <h3 className="text-xl font-bold mb-3 text-amber-400">Heritage</h3>
              <p className="text-gray-300">
                Preserving and celebrating the rich perfumery traditions of Kashmir for future generations.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm"
              variants={itemVariants}
            >
              <h3 className="text-xl font-bold mb-3 text-amber-400">Sustainability</h3>
              <p className="text-gray-300">
                Responsible sourcing and eco-friendly practices that protect our environment and communities.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm"
              variants={itemVariants}
            >
              <h3 className="text-xl font-bold mb-3 text-amber-400">Excellence</h3>
              <p className="text-gray-300">
                Unwavering commitment to craftsmanship and customer satisfaction in every bottle we create.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 md:py-24 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Visit Our Boutique
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Experience the magic of Aligarh Attar House in person
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants}>
              <div className="bg-white p-8 rounded-2xl shadow-lg h-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Location</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-6 w-6 text-amber-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Address</h4>
                      <p className="text-gray-700">Gaw Kadal, Srinagar<br />Jammu & Kashmir, India</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-6 w-6 text-amber-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Opening Hours</h4>
                      <p className="text-gray-700">Monday - Sunday: 10:00 AM - 9:00 PM</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Experience Our Legacy</h4>
                  <p className="text-gray-700 mb-6">
                    Step into our boutique and immerse yourself in the world of traditional Kashmiri perfumery. 
                    Our knowledgeable staff will guide you through our extensive collection and help you discover 
                    your signature scent.
                  </p>
                  <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300">
                    Plan Your Visit
                  </button>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="rounded-2xl overflow-hidden shadow-lg h-96"
              variants={itemVariants}
            >
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1678.619686587766!2d74.80939694133554!3d34.074094840072654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38e18fc85ae61ca9%3A0xb805ebeabf647fd4!2sAligarh%20Attar%20House%20best%20perfume%20shop!5e0!3m2!1sen!2sin!4v1761361063055!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="Aligarh Attar House Location"
              ></iframe>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;