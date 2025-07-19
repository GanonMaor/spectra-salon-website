"use client";

import React, { useState } from "react";

interface Feature {
  id: string;
  title: string;
  description: string;
  image: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const features: Feature[] = [
  {
    id: "inventory-tracking",
    title: "Real-Time Inventory",
    description: "Track every tube in real-time. Know exactly what you have and when to reorder.",
    image: "/inventory.png",
    position: "top-left"
  },
  {
    id: "color-matching",
    title: "Smart Color Matching",
    description: "AI-powered color analysis for perfect matches every time.",
    image: "/assets/Smart Color Tracking.png",
    position: "top-right"
  },
  {
    id: "trend-analytics",
    title: "Trend Analytics",
    description: "Stay ahead with real-time trend analysis and predictions.",
    image: "/assets/ai-featuer.png",
    position: "bottom-left"
  },
  {
    id: "client-history",
    title: "Client History",
    description: "Complete client profiles with color history and preferences.",
    image: "/profile-kendall.jpg",
    position: "bottom-right"
  }
];

export const SmartColorTrackingSection: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Smart Color Intelligence
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Revolutionary AI-powered system that transforms how salons manage colors, 
            track inventory, and delight clients.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                selectedFeature === feature.id ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''
              }`}
              onClick={() => setSelectedFeature(selectedFeature === feature.id ? null : feature.id)}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Feature Detail */}
        {selectedFeature && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transition-all duration-500">
            {features
              .filter(f => f.id === selectedFeature)
              .map(feature => (
                <div key={feature.id} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                      {feature.description}
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Real-time updates</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">AI-powered insights</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Mobile-friendly interface</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-64 object-cover rounded-xl shadow-lg"
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SmartColorTrackingSection; 