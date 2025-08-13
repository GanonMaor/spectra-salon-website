import React, { useState } from "react";
import { CTAButton } from "../../../components/CTAButton";

// Team data structure
const foundersTeam = [
  {
    name: "Maor Ganon",
    age: 37,
    title: "Co-founder & CEO",
    description:
      "A former salon owner with over 20 years of experience as a hair colorist, Maor founded Spectra CI to revolutionize how salons operate. His passion and vision empower professionals worldwide.",
    email: "maor@spectra-ci.com",
    image: "/team/maor-ganon.jpg",
  },
  {
    name: "Danny Michaeli",
    age: 37,
    title: "Co-founder & CTO",
    description:
      "A CRM prodigy with extensive experience in global development teams, Danny single-handedly built the Spectra CI app, applying expertise gained from leading systems for major banks.",
    email: "danny@spectra-ci.com",
    image: "/team/danny-michaeli.jpg",
  },
  {
    name: "Elad Gotlib",
    age: 47,
    title: "Co-founder & COO",
    description:
      "An expert in scaling businesses, Elad brings deep expertise in inventory management and operations, driving Spectra CI's transformation into a major success.",
    email: "elad@spectra-ci.com",
    image: "/team/elad-gotlib.jpg",
  },
];

const inHouseTeam = [
  {
    name: "Mika Bachur",
    age: 42,
    title: "Admin and Operation",
    image: "/team/mika-bachur.jpg",
  },
  {
    name: "Yaar Ben-Jay",
    age: 23,
    title: "Database Manager and Customer Support",
    image: "/team/yaar-ben-jay.jpg",
  },
];

const advisors = [
  {
    name: "Roy Gefen",
    title: "Marketing Advisor",
    description:
      "Former CMO at accessiBe, Roy brings over a decade of experience in marketing, branding, and leadership roles with global organizations.",
    image: "/team/roy-gefen.jpg",
  },
  {
    name: "Nava Ravid",
    title: "Strategic Consultant, Former CEO of L'Oréal Israel",
    description:
      "Led L'Oréal Israel for 6 years, driving growth, market leadership, and corporate responsibility. Served as Chairperson of the Cosmetics Division at the Manufacturers Association of Israel. Recognized for industry impact, she left L'Oréal in 2015 after 24 years of innovation and success.",
    image: "/team/nava-ravid.jpg",
  },
];

const investors = [
  {
    name: "Udi Oster",
    title: "Visionary Investor",
    description:
      "Co-founder of Tapingo, acquired by Grubhub for $150M. Udi excels in scaling startups and fostering innovation.",
    image: "/team/udi-oster.jpg",
  },
  {
    name: "Brian Cooper",
    title: "Strategic Investor",
    description:
      "Founder of Retailx, a retail management solutions leader, with a landmark $650M acquisition by NCR.",
    image: "/team/brian-cooper.jpg",
  },
  {
    name: "Amos Horovitz",
    title: "Business Pioneer",
    description:
      "Led global successes with brands like Crocs and Blundstone in Israel, establishing himself as a leader in retail and brand growth.",
    image: "/team/amos-horovitz.jpg",
  },
];

export const AboutSection: React.FC = () => {
  const [selectedFounder, setSelectedFounder] = useState(0);

  return (
    <section
      id="about"
      className="relative py-20 sm:py-24 lg:py-32 bg-black overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
            <div className="w-2 h-2 bg-[#d4c4a8] rounded-full animate-pulse"></div>
            <span className="text-white/70 text-sm font-medium uppercase tracking-wider">
              OUR STORY
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-4 sm:mb-6 leading-tight">
            <span className="text-white">Built by Professionals,</span>
            <br />
            <span className="text-[#d4c4a8] font-medium">
              For Professionals
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Meet the team of industry veterans, tech experts, and visionary
            leaders revolutionizing salon management
          </p>
        </div>

        {/* Maor's Personal Story */}
        <div className="mb-20 text-center max-w-4xl mx-auto">
          <div className="p-8 bg-gradient-to-br from-[#d4c4a8]/20 to-[#c8b896]/10 rounded-3xl backdrop-blur-sm border border-[#d4c4a8]/20">
            <h3 className="text-2xl font-semibold text-white mb-4">
              From Personal Pain to Global Solution
            </h3>
            <p className="text-lg text-white/80 leading-relaxed mb-4">
              "I was running a successful salon - clients booked months ahead,
              stylists at capacity. But I couldn't tell if we were actually
              profitable. Every day was chaos: guessing color quantities,
              watching products expire, losing money to waste."
            </p>
            <p className="text-white/70 italic">
              - Maor Ganon, after 20 years in the beauty industry
            </p>
          </div>
        </div>

        {/* Founders Team */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              The Founders Team
            </h3>
            <p className="text-white/70 text-lg">
              Industry veterans who lived the problems they're solving
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Founder Selection */}
            <div className="space-y-4">
              {foundersTeam.map((founder, index) => (
                <div
                  key={founder.name}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    selectedFounder === index
                      ? "bg-[#d4c4a8]/20 border-2 border-[#d4c4a8]/40"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  }`}
                  onClick={() => setSelectedFounder(index)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#d4c4a8]/30">
                      <img
                        src={founder.image}
                        alt={founder.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(founder.name)}&size=64&background=d4c4a8&color=000&format=png`;
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white">
                        {founder.name}, {founder.age}
                      </h4>
                      <p className="text-[#d4c4a8] font-medium">
                        {founder.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Founder Details */}
            <div className="lg:sticky lg:top-8">
              <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-white/20">
                <div className="w-32 h-32 rounded-3xl mx-auto mb-6 overflow-hidden border-4 border-[#d4c4a8]/30">
                  <img
                    src={foundersTeam[selectedFounder].image}
                    alt={foundersTeam[selectedFounder].name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(foundersTeam[selectedFounder].name)}&size=128&background=d4c4a8&color=000&format=png`;
                    }}
                  />
                </div>

                <div className="text-center">
                  <h4 className="text-2xl font-bold text-white mb-2">
                    {foundersTeam[selectedFounder].name}
                  </h4>
                  <p className="text-[#d4c4a8] font-semibold text-lg mb-4">
                    {foundersTeam[selectedFounder].title}
                  </p>
                  <p className="text-white/80 leading-relaxed mb-6">
                    {foundersTeam[selectedFounder].description}
                  </p>
                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <div className="w-2 h-2 bg-[#d4c4a8] rounded-full"></div>
                    <span className="text-white/70 text-sm">
                      {foundersTeam[selectedFounder].email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* In-House Team */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              In-House Team
            </h3>
            <p className="text-white/70 text-lg">
              The operational backbone of Spectra
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {inHouseTeam.map((member) => (
              <div
                key={member.name}
                className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20 text-center"
              >
                <div className="w-24 h-24 rounded-2xl mx-auto mb-4 overflow-hidden border-3 border-[#d4c4a8]/30">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=96&background=d4c4a8&color=000&format=png`;
                    }}
                  />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">
                  {member.name}, {member.age}
                </h4>
                <p className="text-[#d4c4a8] font-medium">{member.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Advisors */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Strategic Advisors
            </h3>
            <p className="text-white/70 text-lg">
              Industry leaders guiding our growth
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {advisors.map((advisor) => (
              <div
                key={advisor.name}
                className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20"
              >
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-[#d4c4a8]/30 flex-shrink-0">
                    <img
                      src={advisor.image}
                      alt={advisor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(advisor.name)}&size=80&background=d4c4a8&color=000&format=png`;
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-white mb-2">
                      {advisor.name}
                    </h4>
                    <p className="text-[#d4c4a8] font-medium mb-3">
                      {advisor.title}
                    </p>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {advisor.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visionary Investors */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Visionary Investors
            </h3>
            <p className="text-white/70 text-lg">
              Proven track record in scaling tech businesses
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {investors.map((investor) => (
              <div
                key={investor.name}
                className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20 text-center"
              >
                <div className="w-20 h-20 rounded-2xl mx-auto mb-4 overflow-hidden border-3 border-[#d4c4a8]/30">
                  <img
                    src={investor.image}
                    alt={investor.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(investor.name)}&size=80&background=d4c4a8&color=000&format=png`;
                    }}
                  />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  {investor.name}
                </h4>
                <p className="text-[#d4c4a8] font-medium mb-3 text-sm">
                  {investor.title}
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  {investor.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="mb-20 pt-12 border-t border-white/20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-semibold text-white mb-4">
              The Impact We've Made Together
            </h3>
            <p className="text-white/70">
              Real numbers from real salons using Spectra
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-[#d4c4a8] mb-2">
                500+
              </div>
              <div className="text-white/70 font-medium">
                Salons Transformed
              </div>
              <div className="text-sm text-white/50 mt-1">
                Across 20+ countries
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-[#d4c4a8] mb-2">
                $2M+
              </div>
              <div className="text-white/70 font-medium">Waste Prevented</div>
              <div className="text-sm text-white/50 mt-1">
                In product costs saved
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-[#d4c4a8] mb-2">
                85%
              </div>
              <div className="text-white/70 font-medium">Waste Reduction</div>
              <div className="text-sm text-white/50 mt-1">
                Average per salon
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-[#d4c4a8] mb-2">
                4.9★
              </div>
              <div className="text-white/70 font-medium">User Satisfaction</div>
              <div className="text-sm text-white/50 mt-1">
                From verified reviews
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Ready to Join the Revolution?
            </h3>
            <p className="text-white/70 leading-relaxed">
              Experience the platform built by salon professionals, for salon
              professionals. Start your free trial today and see why industry
              leaders trust Spectra.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton>Start Free Trial</CTAButton>

            <button className="group flex items-center gap-3 text-white/80 hover:text-[#d4c4a8] font-medium text-base transition-all duration-200 mx-auto sm:mx-0">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:bg-[#d4c4a8]/20 transition-all duration-200">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Talk to Our Team</div>
                <div className="text-xs text-white/60">
                  Personal consultation
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Default export for lazy loading
export default AboutSection;
