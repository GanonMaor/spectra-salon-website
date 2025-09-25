import React, { useState, useEffect } from "react";
import { Play, Heart, MoreHorizontal, Clock } from "lucide-react";
import GlassmorphismCard from "./GlassmorphismCard";
import { getAuthHeader } from "../api/client";

interface Lead {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  source_page: string;
  created_at: string;
  utm_campaign?: string;
}

export default function SpotifyStyleTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedLeads, setLikedLeads] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadLeads = async () => {
      try {
        const response = await fetch("/.netlify/functions/leads?unique=true&limit=20", {
          headers: { ...getAuthHeader() }
        });
        if (response.ok) {
          const data = await response.json();
          setLeads(data.leads || []);
        }
      } catch (error) {
        console.error("Failed to load leads:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, []);

  const toggleLike = (leadId: number) => {
    setLikedLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  const formatDuration = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days}d ago`;
  };

  const getSourceDisplayName = (source: string) => {
    const sourceMap: { [key: string]: string } = {
      "/": "Homepage",
      "/special-offer": "Special Offer",
      "/signup?trial=true": "Trial Signup",
      "/lead-capture": "Lead Capture"
    };
    return sourceMap[source] || source;
  };

  if (loading) {
    return (
      <GlassmorphismCard className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-white/10 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </GlassmorphismCard>
    );
  }

  return (
    <GlassmorphismCard className="overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-white/10">
        <h2 className="text-white font-semibold text-xl">Recent Leads</h2>
        <p className="text-white/60 text-sm mt-1">Your latest customer acquisitions</p>
      </div>

      {/* Table Header */}
      <div className="px-6 py-3 border-b border-white/5">
        <div className="grid grid-cols-12 gap-4 text-white/50 text-xs font-medium uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Customer</div>
          <div className="col-span-3">Source</div>
          <div className="col-span-2">Campaign</div>
          <div className="col-span-1 text-center">
            <Heart className="h-3 w-3 mx-auto" />
          </div>
          <div className="col-span-1 text-right">
            <Clock className="h-3 w-3 ml-auto" />
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="max-h-96 overflow-y-auto">
        {leads.map((lead, index) => (
          <div
            key={lead.id}
            className="px-6 py-3 hover:bg-white/5 transition-all duration-200 group cursor-pointer border-b border-white/5 last:border-b-0"
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Index */}
              <div className="col-span-1 text-white/40 text-sm font-mono">
                <span className="group-hover:hidden">{index + 1}</span>
                <Play className="h-4 w-4 hidden group-hover:block text-white" />
              </div>

              {/* Customer Info */}
              <div className="col-span-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                    {lead.full_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{lead.full_name}</div>
                    <div className="text-white/60 text-xs">{lead.email}</div>
                  </div>
                </div>
              </div>

              {/* Source */}
              <div className="col-span-3">
                <div className="text-white/80 text-sm">{getSourceDisplayName(lead.source_page)}</div>
              </div>

              {/* Campaign */}
              <div className="col-span-2">
                <div className="text-white/60 text-sm">{lead.utm_campaign || "Direct"}</div>
              </div>

              {/* Like Button */}
              <div className="col-span-1 text-center">
                <button
                  onClick={() => toggleLike(lead.id)}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      likedLeads.has(lead.id) 
                        ? "text-red-400 fill-current" 
                        : "text-white/40 hover:text-white/60"
                    }`} 
                  />
                </button>
              </div>

              {/* Duration/Time */}
              <div className="col-span-1 text-right">
                <div className="text-white/60 text-xs font-mono">
                  {formatDuration(lead.created_at)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-white/50 text-xs">
          Showing {leads.length} of your recent leads
        </div>
      </div>
    </GlassmorphismCard>
  );
}
