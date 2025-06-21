import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';

interface ClientTestimonial {
  id: number;
  name: string;
  salon: string;
  location: string;
  photo: string;
  quote: string;
  username: string;
  likes: string;
  comments: string;
  shares: string;
  isVideo: boolean;
  videoImage?: string;
}

const clientTestimonials: ClientTestimonial[] = [
  {
    id: 1,
    name: "David Chen",
    salon: "Precision Cuts",
    location: "San Francisco, CA",
    photo: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100",
    quote: "The analytics dashboard gives us insights we never had before.",
    username: "david_chen",
    likes: "1.2k",
    comments: "24",
    shares: "12",
    isVideo: false
  },
  {
    id: 2,
    name: "Lisa Rodriguez", 
    salon: "Glamour Studio",
    location: "Miami, FL",
    photo: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100",
    quote: "Spectra has made our salon more eco-friendly and profitable.",
    username: "lisa_rodriguez",
    likes: "1.2k",
    comments: "24", 
    shares: "8",
    isVideo: true,
    videoImage: "https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=400&h=600"
  },
  {
    id: 3,
    name: "Sarah Martinez",
    salon: "Luxe Hair Studio", 
    location: "Beverly Hills, CA",
    photo: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100",
    quote: "Spectra has completely transformed how we manage our color inventory.",
    username: "sarah_martinez",
    likes: "1.2k",
    comments: "24",
    shares: "15",
    isVideo: false
  },
  {
    id: 4,
    name: "Marcus Johnson",
    salon: "Urban Edge Salon",
    location: "New York, NY", 
    photo: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100",
    quote: "The real-time inventory tracking is a game-changer.",
    username: "marcus_johnson",
    likes: "1.2k",
    comments: "24",
    shares: "20",
    isVideo: true,
    videoImage: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400&h=600"
  },
  {
    id: 5,
    name: "Emma Thompson",
    salon: "Bloom Beauty Bar",
    location: "Austin, TX",
    photo: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100", 
    quote: "Our profit margins have improved significantly since implementing Spectra.",
    username: "emma_thompson",
    likes: "1.2k",
    comments: "24",
    shares: "18",
    isVideo: false
  },
  {
    id: 6,
    name: "Alex Rivera",
    salon: "Modern Styles",
    location: "Chicago, IL",
    photo: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100", 
    quote: "The color matching technology is revolutionary for our business.",
    username: "alex_rivera",
    likes: "1.5k",
    comments: "32",
    shares: "25",
    isVideo: true,
    videoImage: "https://images.pexels.com/photos/3992660/pexels-photo-3992660.jpeg?auto=compress&cs=tinysrgb&w=400&h=600"
  },
  {
    id: 7,
    name: "Jessica Park",
    salon: "Elite Hair Lounge",
    location: "Seattle, WA",
    photo: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=100&h=100", 
    quote: "Client satisfaction has increased dramatically since we started using Spectra.",
    username: "jessica_park",
    likes: "2.1k",
    comments: "45",
    shares: "30",
    isVideo: false
  },
  {
    id: 8,
    name: "Ryan Mitchell",
    salon: "Artisan Hair Co",
    location: "Portland, OR",
    photo: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100", 
    quote: "The inventory management saves us hours every week.",
    username: "ryan_mitchell",
    likes: "1.8k",
    comments: "38",
    shares: "22",
    isVideo: true,
    videoImage: "https://images.pexels.com/photos/3992663/pexels-photo-3992663.jpeg?auto=compress&cs=tinysrgb&w=400&h=600"
  }
];

interface ClientCardProps {
  client: ClientTestimonial;
  isActive: boolean;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, isActive }) => {
  return (
    <div
      className={`relative transition-all duration-500 ${
        isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-70'
      }`}
    >
      {/* iPhone Frame - גודל קבוע לחלוטין */}
      <div 
        className="relative mx-auto bg-gradient-to-b from-[#2c2c2e] via-[#3a3a3c] to-[#2c2c2e] rounded-[2.8rem] p-2 shadow-2xl border border-gray-600/30"
        style={{ 
          width: '300px', 
          height: '600px',
          flexShrink: 0,
          flexGrow: 0
        }}
      >
        {/* Device Shadow */}
        <div className="absolute -inset-4 bg-gradient-to-br from-black/20 via-black/10 to-transparent rounded-[3rem] blur-2xl opacity-60"></div>
        
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-7 bg-black rounded-full z-20 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
        </div>

        {/* Screen */}
        <div className="w-full h-full bg-black rounded-[2.4rem] overflow-hidden relative">
          {/* Instagram Reels Interface */}
          <div className="w-full h-full relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500">
            
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 text-white text-sm font-semibold z-30">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-6 h-3 border border-white rounded-sm">
                  <div className="w-full h-full bg-green-400 rounded-sm"></div>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="absolute top-12 left-0 right-0 h-16 flex items-center justify-between px-4 z-30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/50">
                  <img src={client.photo} alt={client.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{client.username}</div>
                  <div className="text-white/80 text-xs">Spectra Client</div>
                </div>
              </div>
              <button className="text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
            </div>

            {/* Main Content Area - גובה קבוע */}
            <div className="absolute top-28 left-0 right-0 bottom-32 flex items-center justify-center">
              {client.isVideo ? (
                <div className="relative w-full h-full">
                  <img 
                    src={client.videoImage}
                    alt="Stock video"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-base font-medium leading-tight">
                      "{client.quote}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="px-6 text-center h-full flex flex-col justify-center">
                  <div className="mb-8">
                    <svg className="w-12 h-12 text-white/30 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                    </svg>
                    <p className="text-white text-lg font-medium leading-relaxed">
                      "{client.quote}"
                    </p>
                  </div>
                  
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="absolute right-3 bottom-32 flex flex-col items-center gap-4 z-30">
              <div className="flex flex-col items-center">
                <button className="w-10 h-10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <span className="text-white text-xs font-medium">{client.likes}</span>
              </div>

              <div className="flex flex-col items-center">
                <button className="w-10 h-10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <span className="text-white text-xs font-medium">{client.comments}</span>
              </div>

              <div className="flex flex-col items-center">
                <button className="w-10 h-10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
                <span className="text-white text-xs font-medium">{client.shares}</span>
              </div>

              <div className="w-6 h-6 rounded-lg overflow-hidden border border-white">
                <img src={client.photo} alt={client.name} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-4 left-4 right-20 z-30">
              <div className="text-white">
                <div className="font-semibold text-sm mb-1">{client.name}</div>
                <div className="text-xs opacity-90">{client.salon} • {client.location}</div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-center z-30">
              <span className="text-white text-sm font-medium">Reels</span>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full"></div>
          </div>
        </div>

        {/* Physical Buttons */}
        <div className="absolute left-0 top-20 w-1 h-12 bg-gray-600 rounded-r-full"></div>
        <div className="absolute left-0 top-36 w-1 h-8 bg-gray-600 rounded-r-full"></div>
        <div className="absolute left-0 top-48 w-1 h-8 bg-gray-600 rounded-r-full"></div>
        <div className="absolute right-0 top-32 w-1 h-16 bg-gray-600 rounded-l-full"></div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#007AFF] rounded-full shadow-lg" />
      )}
    </div>
  );
};

export const ClientCarousel: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: 'center',
    skipSnaps: false,
    dragFree: false,
    containScroll: 'keepSnaps'
  });
  
  const [selectedIndex, setSelectedIndex] = useState(Math.floor(clientTestimonials.length / 2));
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    const middleIndex = Math.floor(clientTestimonials.length / 2);
    emblaApi.scrollTo(middleIndex, false);
    setSelectedIndex(middleIndex);
    
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleCardClick = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      id="client-testimonials"
      className="relative w-full bg-gradient-to-b from-gray-50 to-white py-24 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative max-w-7xl mx-auto px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-[#1d1d1f] mb-6 leading-tight tracking-[-0.02em]">
            What Our Customers Are Saying
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            See how salons like yours are using Spectra every day to reduce waste, increase profits, and streamline operations.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Navigation Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 w-14 h-14 bg-white/90 hover:bg-white backdrop-blur-xl rounded-full flex items-center justify-center transition-all duration-300 group shadow-xl hover:shadow-2xl border border-gray-200/50"
          >
            <svg className="w-6 h-6 text-gray-600 group-hover:text-[#007AFF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 w-14 h-14 bg-white/90 hover:bg-white backdrop-blur-xl rounded-full flex items-center justify-center transition-all duration-300 group shadow-xl hover:shadow-2xl border border-gray-200/50"
          >
            <svg className="w-6 h-6 text-gray-600 group-hover:text-[#007AFF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Embla Carousel - פתרון מושלם */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-8">
              {clientTestimonials.map((client, index) => (
                <div 
                  key={client.id} 
                  className="cursor-pointer"
                  onClick={() => handleCardClick(index)}
                  style={{ 
                    flex: '0 0 300px',
                    minWidth: '300px'
                  }}
                >
                  <ClientCard
                    client={client}
                    isActive={index === selectedIndex}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-3 mt-16">
            {clientTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === selectedIndex 
                    ? 'bg-[#007AFF] scale-125 shadow-lg' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <button className="group relative px-10 py-5 bg-[#007AFF] hover:bg-[#0056CC] text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02]">
            <span className="relative z-10">Join These Successful Salons</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#007AFF] to-[#0056CC] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <p className="mt-4 text-gray-600 text-lg font-light">
            Start your 14-day free trial today
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};