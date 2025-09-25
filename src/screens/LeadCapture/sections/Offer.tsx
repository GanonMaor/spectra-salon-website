import React from "react";

type OfferProps = {
  onStartTrial: () => void;
};

export const Offer: React.FC<OfferProps> = ({ onStartTrial }) => {
  return (
    <section id="lead-form-section" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-200 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gray-100 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent font-medium">Triple Bundle</span>
            <span className="text-gray-900 font-light"> Special Offer</span>
          </h2>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="space-y-6 mb-12">
            <div className="group p-6 hover:bg-gray-50/80 transition-all duration-300 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">1</div>
                <div className="flex-1">
                  <h4 className="text-xl font-medium text-gray-900 mb-2">30 Day Free Trial</h4>
                  <p className="text-gray-600 leading-relaxed">Full access, no commitment required</p>
                </div>
              </div>
            </div>

            <div className="group p-6 hover:bg-gray-50/80 transition-all duration-300 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">2</div>
                <div className="flex-1">
                  <h4 className="text-xl font-medium text-gray-900 mb-2">Free Equipment</h4>
                  <p className="text-gray-600 leading-relaxed">Smart Bluetooth Scale & Premium Lamicall Stand included as gift</p>
                </div>
              </div>
            </div>

            <div className="group p-6 hover:bg-gray-50/80 transition-all duration-300 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">3</div>
                <div className="flex-1">
                  <h4 className="text-xl font-medium text-gray-900 mb-2">Custom Training & Setup</h4>
                  <p className="text-gray-600 leading-relaxed">Complete setup and team training included (Value: $500)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-14">
            <div className="relative inline-flex flex-col items-center bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl px-8 py-6 border border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300 transition-all duration-500 transform scale-[1.2] hover:scale-[1.25]">
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">50% OFF</div>
              <p className="text-sm text-gray-600 mb-2 font-medium">Starting from</p>
              <div className="flex items-center gap-6 mb-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 mb-1 transform hover:scale-110 transition-transform duration-200">$39<span className="text-lg">/month</span></p>
                  <p className="text-xs text-gray-500 font-medium">Solo User</p>
                </div>
                <div className="w-px h-12 bg-gray-300" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600 mb-1 transform hover:scale-110 transition-transform duration-200">$79<span className="text-lg">/month</span></p>
                  <p className="text-xs text-gray-500 font-medium">Team Plan</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Full access included</p>
            </div>
          </div>

          <div className="text-center pt-4 pb-12">
            <button onClick={onStartTrial}
              className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white px-8 py-3 md:px-10 md:py-4 rounded-xl text-base md:text-lg font-semibold shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform scale-[1.05] hover:scale-[1.10] hover:-rotate-1 min-w-[260px] md:min-w-[280px]">
              <span className="relative z-10 flex items-center justify-center gap-3">Take me straight to my free trial</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};


