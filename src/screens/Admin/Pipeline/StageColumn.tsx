import React, { useState, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { MoreVertical, Clock, Users, TrendingUp, AlertTriangle } from "lucide-react";
import GlassmorphismCard from "../../../components/GlassmorphismCard";
import LeadCard from "./LeadCard";
import { getAuthHeader } from "../../../api/client";

interface Stage {
  id: number;
  pipeline_id: number;
  name: string;
  position: number;
  wip_limit?: number;
  sla_hours?: number;
  color?: string;
}

interface Card {
  id: number;
  pipeline_id: number;
  stage_id: number;
  lead_email: string;
  title?: string;
  meta_json?: any;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

interface StageMetrics {
  card_count: number;
  sla_compliance_percent: number;
  avg_days_in_stage: number;
}

interface StageColumnProps {
  stage: Stage;
  cards: Card[];
  pinnedLead?: string | null;
  loading: boolean;
  onStageUpdate: (stage: Stage) => void;
  onCardUpdate: () => void;
}

export default function StageColumn({
  stage,
  cards,
  pinnedLead,
  loading,
  onStageUpdate,
  onCardUpdate
}: StageColumnProps) {
  const [metrics, setMetrics] = useState<StageMetrics>({
    card_count: 0,
    sla_compliance_percent: 100,
    avg_days_in_stage: 0
  });
  const [showMenu, setShowMenu] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
  });

  useEffect(() => {
    loadMetrics();
  }, [cards.length, stage.id]);

  const loadMetrics = async () => {
    try {
      const response = await fetch(`/.netlify/functions/pipeline/pipelines/${stage.pipeline_id}/metrics`, {
        headers: { ...getAuthHeader() }
      });
      
      if (response.ok) {
        const data = await response.json();
        const stageMetrics = data.metrics.find((m: any) => m.id === stage.id);
        if (stageMetrics) {
          setMetrics({
            card_count: parseInt(stageMetrics.card_count),
            sla_compliance_percent: parseFloat(stageMetrics.sla_compliance_percent || 100),
            avg_days_in_stage: parseFloat(stageMetrics.avg_days_in_stage || 0)
          });
        }
      }
    } catch (error) {
      console.error('Failed to load stage metrics:', error);
    }
  };

  const getSLAStatus = () => {
    if (!stage.sla_hours) return null;
    
    if (metrics.sla_compliance_percent >= 90) return 'good';
    if (metrics.sla_compliance_percent >= 70) return 'warning';
    return 'danger';
  };

  const slaStatus = getSLAStatus();

  return (
    <div
      id={`stage-${stage.id}`}
      className="stage-column"
    >
      <GlassmorphismCard
        variant="default"
        className={`h-full transition-all duration-200 ${
          isOver ? 'ring-2 ring-orange-400/50 bg-orange-50/20' : ''
        }`}
        style={{
          background: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.6)",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
        }}
      >
        {/* Stage Header */}
        <div className="p-4 border-b border-white/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {stage.color && (
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
              )}
              <h3 className="font-bold text-gray-900 text-sm drop-shadow-md">
                {stage.name}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <span 
                className="text-xs font-bold text-gray-900 px-2 py-1 rounded-full bg-white/60 drop-shadow-sm"
                style={{ fontFeatureSettings: '"tnum" 1' }}
              >
                {metrics.card_count}
              </span>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-white/30 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Stage KPIs - Inline Analytics */}
          <div className="flex items-center gap-4 text-xs">
            {stage.sla_hours && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-600" />
                <span 
                  className={`font-medium ${
                    slaStatus === 'good' ? 'text-green-800' :
                    slaStatus === 'warning' ? 'text-yellow-800' :
                    'text-red-800'
                  }`}
                  style={{ fontFeatureSettings: '"tnum" 1' }}
                >
                  {Math.round(metrics.sla_compliance_percent)}% SLA
                </span>
              </div>
            )}
            
            {metrics.avg_days_in_stage > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-gray-600" />
                <span 
                  className="font-semibold text-gray-800 drop-shadow-sm"
                  style={{ fontFeatureSettings: '"tnum" 1' }}
                >
                  {metrics.avg_days_in_stage.toFixed(1)}d avg
                </span>
              </div>
            )}
            
            {stage.wip_limit && metrics.card_count > stage.wip_limit && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-600" />
                <span className="font-bold text-red-800 text-xs drop-shadow-sm">
                  WIP exceeded
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cards Container */}
        <div
          ref={setNodeRef}
          className="flex-1 p-4 space-y-3 min-h-[200px] overflow-y-auto overflow-x-hidden"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
            </div>
          ) : cards.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-center">
              <div>
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-800 font-semibold drop-shadow-sm">No leads yet</p>
                <p className="text-xs text-gray-700 font-medium drop-shadow-sm">Drag cards here or create new ones</p>
              </div>
            </div>
          ) : (
            cards.map((card) => (
              <LeadCard
                key={card.id}
                card={card}
                isPinned={pinnedLead === card.lead_email}
                onUpdate={onCardUpdate}
              />
            ))
          )}
        </div>

        {/* Stage Footer - WIP Limit */}
        {stage.wip_limit && (
          <div className="p-3 border-t border-white/30 bg-white/20">
            <div className="text-xs text-gray-700 font-medium">
              WIP Limit: {metrics.card_count}/{stage.wip_limit}
              <div 
                className="w-full bg-white/30 rounded-full h-1.5 mt-1"
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    metrics.card_count > stage.wip_limit ? 'bg-red-500' :
                    metrics.card_count === stage.wip_limit ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min((metrics.card_count / stage.wip_limit) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </GlassmorphismCard>

      {/* Stage Menu */}
      {showMenu && (
        <div className="absolute top-16 right-4 z-10">
          <GlassmorphismCard variant="dark" className="p-3 w-48">
            <div className="space-y-2">
              <button className="w-full text-left text-sm text-white hover:text-orange-300 transition-colors p-2 hover:bg-white/10 rounded-lg">
                Edit Stage
              </button>
              <button className="w-full text-left text-sm text-white hover:text-red-300 transition-colors p-2 hover:bg-white/10 rounded-lg">
                Delete Stage
              </button>
              <button 
                onClick={() => setShowMenu(false)}
                className="w-full text-left text-sm text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                Close
              </button>
            </div>
          </GlassmorphismCard>
        </div>
      )}
    </div>
  );
}
