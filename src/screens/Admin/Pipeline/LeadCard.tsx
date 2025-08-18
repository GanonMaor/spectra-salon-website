import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Mail, Clock, Lock, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

interface LeadCardProps {
  card: Card;
  isPinned: boolean;
  onUpdate: () => void;
}

export default function LeadCard({ card, isPinned, onUpdate }: LeadCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: card.id.toString(),
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const timeInStage = card.updated_at 
    ? formatDistanceToNow(new Date(card.updated_at), { addSuffix: true })
    : 'Recently';
  
  // Check if SLA is violated (mock check - would need stage SLA info)
  const daysSinceUpdate = card.updated_at 
    ? Math.floor((Date.now() - new Date(card.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const isOverdue = daysSinceUpdate > 2; // Mock SLA of 2 days

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        group relative cursor-grab active:cursor-grabbing
        transition-all duration-200 ease-out
        ${isDragging ? 'opacity-50 scale-105 rotate-2' : ''}
        ${isPinned ? 'ring-2 ring-orange-400/60 ring-offset-2 ring-offset-transparent' : ''}
      `}
    >
      <div
        className={`
          p-3 rounded-2xl transition-all duration-200
          ${isPinned 
            ? 'bg-gradient-to-br from-orange-100/80 to-amber-100/60 border-2 border-orange-400/40' 
            : 'bg-white/40 border border-white/50 hover:bg-white/50'
          }
          backdrop-blur-sm hover:shadow-lg hover:-translate-y-0.5
          ${card.is_locked ? 'border-l-4 border-l-orange-500' : ''}
        `}
        style={{
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          minHeight: "72px"
        }}
      >
        {/* Card Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-3 h-3 text-gray-600 flex-shrink-0" />
              <span className="text-sm font-bold text-gray-900 truncate drop-shadow-md">
                {card.title || card.lead_email}
              </span>
              {card.is_locked && (
                <Lock className="w-3 h-3 text-orange-600 flex-shrink-0" />
              )}
            </div>
            
            {card.title && (
              <div className="text-xs text-gray-800 font-semibold truncate drop-shadow-sm">
                {card.lead_email}
              </div>
            )}
          </div>

          {/* Status Indicators */}
          <div className="flex flex-col items-end gap-1">
            {isPinned && (
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            )}
            {isOverdue && (
              <AlertTriangle className="w-3 h-3 text-red-500" />
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-3 h-3" />
            <span 
              className="font-medium"
              style={{ fontFeatureSettings: '"tnum" 1' }}
            >
              {timeInStage}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {card.meta_json?.utm_source && (
              <span className="px-1.5 py-0.5 bg-blue-100/60 text-blue-700 rounded text-xs font-medium">
                {card.meta_json.utm_source}
              </span>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              className="p-1 hover:bg-white/40 rounded transition-colors"
            >
              <ExternalLink className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-white/40 space-y-2">
            <div className="text-xs">
              <div className="text-gray-700 font-medium">Created:</div>
              <div className="text-gray-600" style={{ fontFeatureSettings: '"tnum" 1' }}>
                {card.created_at ? new Date(card.created_at).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
            
            {card.meta_json && Object.keys(card.meta_json).length > 0 && (
              <div className="text-xs">
                <div className="text-gray-700 font-medium">Metadata:</div>
                <div className="text-gray-600 font-mono text-xs bg-white/30 p-2 rounded mt-1">
                  {JSON.stringify(card.meta_json, null, 2)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl pointer-events-none" />
      </div>
    </div>
  );
}
