import React from 'react';
import { BookOpen, Package, Shield, Truck } from 'lucide-react';

// Simple, clean CSS - no animations
const style = `
  .feature-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .feature-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

// Feature data - two simple cards
const features = [
  {
    id: 1,
    icon: BookOpen,
    title: "Traditional Craftsmanship",
    subtitle: "Heritage & Authenticity",
    description: "Each attar is crafted using centuries-old techniques passed down through generations of master perfumers in Aligarh."
  },
  {
    id: 2,
    icon: Package,
    title: "Premium Quality",
    subtitle: "Pure & Natural",
    description: "We source only the finest natural ingredients, ensuring every bottle contains authentic, alcohol-free attars of the highest quality."
  }
];

// Simple Feature Card Component - Two cards in one row
const FeatureCard: React.FC<{ feature: typeof features[0] }> = ({ feature }) => {
  const Icon = feature.icon;

  return (
    <div className="feature-card bg-white border border-gray-200 rounded-lg p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
      {/* Text content on the left side */}
      <div className="flex-1 text-center sm:text-left">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          {feature.title}
        </h3>
        <p className="text-sm md:text-base font-semibold text-purple-600 mb-3">
          {feature.subtitle}
        </p>
        <p className="text-gray-600 leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* Icon on the right side */}
      <div className="flex-shrink-0">
        <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
          <Icon className="w-full h-full text-purple-600" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};



export const LovedByThousands: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-white">
      <style>{style}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Sufi Essences
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover what makes our attars special
          </p>
        </div>

        {/* Two Feature Cards in One Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LovedByThousands;