import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow, Autoplay } from 'swiper/modules';
import { walkthroughSteps } from "../../../constants/walkthroughSteps";
import { VideoSection } from "./VideoSection";
import { SmartColorTrackingSection } from "./SmartColorTrackingSection";
import { ContactSection } from "../../../components/ContactSection";
import { BACKGROUND_IMAGES } from "../../../constants/backgroundImages";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

export const StepsSection: React.FC = () => {
  return (
    <>
    {/* Ultra-Fast Optimized Carousel */}
    <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
      {/* Minimal background effects */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-100 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Simplified Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 mb-6 border border-gray-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700 text-sm font-medium uppercase tracking-wider">The Journey</span>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-light text-gray-900 mb-4">
            Five Revolutionary
          </h2>
          <h2 className="text-4xl lg:text-6xl font-light bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Steps
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From chaos to perfection. Experience the future of salon management.
          </p>
        </div>

        {/* High-Performance Swiper Carousel */}
        <div className="mb-16">
          <Swiper
            modules={[Navigation, Pagination, EffectCoverflow, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            centeredSlides={true}
            loop={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            effect="coverflow"
            coverflowEffect={{
              rotate: 15,
              stretch: 0,
              depth: 200,
              modifier: 1,
              slideShadows: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={true}
            breakpoints={{
              640: {
                slidesPerView: 1.5,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
            }}
            className="steps-swiper"
            style={{ paddingBottom: '60px' }}
          >
            {walkthroughSteps.map((step, index) => {
              const colors = [
                { bg: 'bg-blue-50', accent: 'bg-blue-500', text: 'text-blue-600' },
                { bg: 'bg-amber-50', accent: 'bg-amber-500', text: 'text-amber-600' },
                { bg: 'bg-red-50', accent: 'bg-red-500', text: 'text-red-600' },
                { bg: 'bg-emerald-50', accent: 'bg-emerald-500', text: 'text-emerald-600' },
                { bg: 'bg-purple-50', accent: 'bg-purple-500', text: 'text-purple-600' }
              ];
              
              const colorScheme = colors[index];
              
              return (
                <SwiperSlide key={index} className="pb-8">
                  <div className="group h-full">
                    <div className={`relative ${colorScheme.bg} rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full`}>
                      
                      {/* Optimized Image Container */}
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={step.image}
                          alt={step.alt}
                          loading={index < 2 ? "eager" : "lazy"}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://images.unsplash.com/photo-158${8000000 + index}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`;
                          }}
                        />
                        
                        {/* Step Number Badge */}
                        <div className="absolute top-4 left-4">
                          <div className={`w-8 h-8 ${colorScheme.accent} rounded-full flex items-center justify-center shadow-lg`}>
                            <span className="text-white text-sm font-bold">{index + 1}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Clean Content */}
                      <div className="p-6">
                        <h3 className={`text-xl font-semibold ${colorScheme.text} mb-3`}>
                          {step.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {step.description}
                        </p>
                        
                        {/* Simple Progress Bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${colorScheme.accent} rounded-full transition-all duration-1000`}
                              style={{ width: `${((index + 1) / walkthroughSteps.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {index + 1}/{walkthroughSteps.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Clean CTA */}
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Experience all five revolutionary steps and transform your salon today
          </p>
          
          <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            Start Free Trial
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

      </div>

      {/* Custom Swiper Styles */}
      <style>{`
        .steps-swiper {
          padding-left: 0;
          padding-right: 0;
        }
        
        .steps-swiper .swiper-slide {
          height: auto;
          display: flex;
        }
        
        .steps-swiper .swiper-pagination {
          bottom: 10px;
        }
        
        .steps-swiper .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: #6366f1;
          opacity: 0.5;
        }
        
        .steps-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          transform: scale(1.2);
        }
        
        .steps-swiper .swiper-button-next,
        .steps-swiper .swiper-button-prev {
          color: #6366f1;
          font-weight: bold;
        }
        
        .steps-swiper .swiper-button-next:after,
        .steps-swiper .swiper-button-prev:after {
          font-size: 18px;
        }
        
        @media (max-width: 768px) {
          .steps-swiper .swiper-button-next,
          .steps-swiper .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
      
    </section>

    {/* Lazy Load Other Sections */}
    <VideoSection />
    <SmartColorTrackingSection />
    <ContactSection 
      backgroundImage={BACKGROUND_IMAGES.yourCustomSalon}
      title="Ready to"
      subtitle="Transform?"
      description="Join thousands of salon professionals who've revolutionized their business with Spectra."
    />
    </>
  );
};