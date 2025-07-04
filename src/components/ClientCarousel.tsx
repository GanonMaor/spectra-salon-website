import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

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
    salon: "Salon Owner",
    location: "San Francisco, CA",
    photo: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100",
    quote: "The analytics dashboard gives our salon insights we never had before.",
    username: "david_chen",
    likes: "1.2k",
    comments: "24",
    shares: "12",
    isVideo: false
  },
  {
    id: 2,
    name: "Lisa Rodriguez", 
    salon: "Independent Colorist",
    location: "Miami, FL",
    photo: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100",
    quote: "Spectra has made my freelance work more eco-friendly and profitable.",
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
    salon: "Salon Manager", 
    location: "Beverly Hills, CA",
    photo: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100",
    quote: "Spectra has completely transformed how we manage color inventory across our team.",
    username: "sarah_martinez",
    likes: "1.2k",
    comments: "24",
    shares: "15",
    isVideo: false
  },
  {
    id: 4,
    name: "Marcus Johnson",
    salon: "Mobile Hair Stylist",
    location: "New York, NY", 
    photo: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100",
    quote: "The real-time inventory tracking is a game-changer for my mobile business.",
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
    salon: "Booth Renter",
    location: "Austin, TX",
    photo: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100", 
    quote: "My profit margins have improved significantly since implementing Spectra in my booth.",
    username: "emma_thompson",
    likes: "1.2k",
    comments: "24",
    shares: "18",
    isVideo: false
  },
  {
    id: 6,
    name: "Alex Rivera",
    salon: "Salon Co-Owner",
    location: "Chicago, IL",
    photo: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100", 
    quote: "The color matching technology is revolutionary for our salon operations.",
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
    salon: "Suite Owner",
    location: "Seattle, WA",
    photo: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=100&h=100", 
    quote: "Client satisfaction has increased dramatically since I started using Spectra in my suite.",
    username: "jessica_park",
    likes: "2.1k",
    comments: "45",
    shares: "30",
    isVideo: false
  },
  {
    id: 8,
    name: "Ryan Mitchell",
    salon: "Senior Colorist",
    location: "Portland, OR",
    photo: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100", 
    quote: "The inventory management saves me hours every week in our busy salon.",
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
    <div className="relative transition-all duration-300 flex justify-center items-center">
      {/* iPhone Frame - אופטימלי ונקי */}
      <div 
        className="relative bg-gradient-to-b from-[#2c2c2e] via-[#3a3a3c] to-[#2c2c2e] rounded-[2.8rem] p-2 shadow-2xl"
        style={{ 
          width: '280px', 
          height: '560px',
          flexShrink: 0,
          flexGrow: 0
        }}
      >
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-7 bg-black rounded-full z-20 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
        </div>

        {/* Screen */}
        <div className="w-full h-full bg-black rounded-[2.4rem] overflow-hidden relative">
          {/* Instagram Reels Interface */}
          <div className="w-full h-full relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500">
            
            {/* Status Bar - מסודר */}
            <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 text-white text-sm font-semibold z-30">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-6 h-3 border border-white rounded-sm">
                  <div className="w-full h-full bg-green-400 rounded-sm"></div>
                </div>
              </div>
            </div>

            {/* Header - טקסט מסודר */}
            <div className="absolute top-12 left-0 right-0 h-14 flex items-center justify-between px-4 z-30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/50 flex-shrink-0">
                  <img 
                    src={client.photo} 
                    alt={client.name} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white font-semibold text-sm truncate">{client.username}</div>
                  <div className="text-white/80 text-xs">Spectra Client</div>
                </div>
              </div>
              <button className="text-white flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
            </div>

            {/* Main Content Area - טקסט מסודר ונקי */}
            <div className="absolute top-26 left-0 right-0 bottom-28 flex items-center justify-center p-4">
              {client.isVideo ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  <img 
                    src={client.videoImage}
                    alt="Video content"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  {/* Quote בתחתית הוידאו - נקי יותר */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-white text-sm font-medium leading-tight">
                        "{client.quote}"
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center h-full flex flex-col justify-center px-6">
                  <div className="mb-6">
                    <svg className="w-10 h-10 text-white/40 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                    </svg>
                    {/* Quote מסודר ונקי */}
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-white text-base font-medium leading-relaxed">
                        "{client.quote}"
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Actions - מסודר */}
            <div className="absolute right-2 bottom-28 flex flex-col items-center gap-3 z-30">
              <div className="flex flex-col items-center">
                <button className="w-9 h-9 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <span className="text-white text-xs font-medium">{client.likes}</span>
              </div>

              <div className="flex flex-col items-center">
                <button className="w-9 h-9 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <span className="text-white text-xs font-medium">{client.comments}</span>
              </div>

              <div className="flex flex-col items-center">
                <button className="w-9 h-9 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
                <span className="text-white text-xs font-medium">{client.shares}</span>
              </div>

              <div className="w-6 h-6 rounded-lg overflow-hidden border border-white">
                <img 
                  src={client.photo} 
                  alt={client.name} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Bottom Info - טקסט מסודר */}
            <div className="absolute bottom-14 left-4 right-16 z-30">
              <div className="text-white">
                <div className="font-semibold text-sm mb-1 truncate">{client.name}</div>
                <div className="text-xs opacity-90 truncate">{client.salon} • {client.location}</div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-6 left-0 right-0 h-8 flex items-center justify-center z-30">
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
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#007AFF] rounded-full shadow-lg animate-pulse" />
      )}
    </div>
  );
};

export const ClientCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(Math.floor(clientTestimonials.length / 2));

  return (
    <section className="relative w-full overflow-hidden py-8">
      <div className="relative max-w-full">
        
        {/* Ultra-Fast Swiper Carousel - וידוא שלא חותך */}
        <div className="relative px-4 lg:px-8">
          <Swiper
            modules={[Navigation, Pagination, EffectCoverflow, Autoplay]}
            spaceBetween={32}
            slidesPerView={1}
            centeredSlides={true}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            effect="coverflow"
            coverflowEffect={{
              rotate: 12,
              stretch: 0,
              depth: 150,
              modifier: 1,
              slideShadows: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={{
              nextEl: '.client-carousel-next',
              prevEl: '.client-carousel-prev',
            }}
            breakpoints={{
              480: {
                slidesPerView: 1.2,
                spaceBetween: 24,
              },
              640: {
                slidesPerView: 1.5,
                spaceBetween: 28,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 32,
              },
              1024: {
                slidesPerView: 2.5,
                spaceBetween: 36,
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 40,
              },
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="client-carousel-swiper"
            style={{ 
              paddingBottom: '60px',
              paddingTop: '20px'
            }}
          >
            {clientTestimonials.map((client, index) => (
              <SwiperSlide key={client.id} className="pb-8">
                <div className="flex justify-center items-center h-full">
                  <ClientCard
                    client={client}
                    isActive={index === activeIndex}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Arrows */}
          <button className="client-carousel-prev hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full items-center justify-center transition-all duration-300 group shadow-xl border border-white/40">
            <svg className="w-6 h-6 text-gray-600 group-hover:text-[#007AFF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button className="client-carousel-next hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full items-center justify-center transition-all duration-300 group shadow-xl border border-white/40">
            <svg className="w-6 h-6 text-gray-600 group-hover:text-[#007AFF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Custom Swiper Styles */}
      <style>{`
        .client-carousel-swiper {
          padding-left: 0;
          padding-right: 0;
        }
        
        .client-carousel-swiper .swiper-slide {
          height: auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .client-carousel-swiper .swiper-pagination {
          bottom: 0;
        }
        
        .client-carousel-swiper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: #007AFF;
          opacity: 0.4;
          margin: 0 4px;
        }
        
        .client-carousel-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          transform: scale(1.3);
        }
        
        .client-carousel-swiper .swiper-slide-active .relative {
          transform: scale(1);
        }
        
        .client-carousel-swiper .swiper-slide-next .relative,
        .client-carousel-swiper .swiper-slide-prev .relative {
          transform: scale(0.9);
          opacity: 0.85;
        }
      `}</style>
    </section>
  );
};