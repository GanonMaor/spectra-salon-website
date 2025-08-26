import React, { useState, useEffect, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import StageColumn from "./StageColumn";
import { getAuthHeader } from "../../../api/client";
import "../../../styles/pipeline.css";

interface Pipeline {
  id: number;
  name: string;
  description?: string;
  is_default: boolean;
}

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
  stage_name?: string;
  stage_position?: number;
  stage_color?: string;
}

interface PipelineBoardProps {
  pipeline: Pipeline;
  stages: Stage[];
  searchTerm: string;
  pinnedLead?: string | null;
  onStagesUpdate: (stages: Stage[]) => void;
}

export default function PipelineBoard({
  pipeline,
  stages,
  searchTerm,
  pinnedLead,
  onStagesUpdate
}: PipelineBoardProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadCards();
  }, [pipeline.id, searchTerm]);

  // Auto-scroll to show all columns on load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current && stages.length > 4) {
        const container = containerRef.current;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        container.scrollTo({
          left: maxScrollLeft,
          behavior: 'smooth'
        });
        
        // Hide scroll hint after showing the end
        setTimeout(() => {
          container.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
          setShowScrollHint(false);
        }, 2000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [stages.length]);

  useEffect(() => {
    // Auto-pin lead if specified in URL
    if (pinnedLead && cards.length > 0) {
      const existingCard = cards.find(card => card.lead_email === pinnedLead);
      if (!existingCard && stages.length > 0) {
        // Create locked card in first stage
        createPinnedCard(pinnedLead, stages[0].id);
      } else if (existingCard) {
        // Scroll to stage and highlight card
        setTimeout(() => {
          const stageElement = document.getElementById(`stage-${existingCard.stage_id}`);
          stageElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 500);
      }
    }
  }, [pinnedLead, cards, stages]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const url = new URL(`/.netlify/functions/pipeline/pipelines/${pipeline.id}/cards`, window.location.origin);
      if (searchTerm) {
        url.searchParams.set('query', searchTerm);
      }
      
      const response = await fetch(url.toString(), {
        headers: { ...getAuthHeader() }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCards(data.cards);
      }
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPinnedCard = async (leadEmail: string, stageId: number) => {
    try {
      const response = await fetch(`/.netlify/functions/pipeline/pipelines/${pipeline.id}/cards`, {
        method: 'POST',
        headers: { 
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lead_email: leadEmail,
          stage_id: stageId,
          title: `${leadEmail} - Onboarding`,
          is_locked: true
        })
      });
      
      if (response.ok) {
        loadCards(); // Refresh cards
      }
    } catch (error) {
      console.error('Failed to create pinned card:', error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find(c => c.id.toString() === event.active.id);
    setDraggedCard(card || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedCard(null);
    
    if (!over || active.id === over.id) return;
    
    const cardId = parseInt(active.id.toString());
    const targetStageId = parseInt(over.id.toString().replace('stage-', ''));
    
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    
    try {
      const response = await fetch(`/.netlify/functions/pipeline/cards/${cardId}/move`, {
        method: 'PATCH',
        headers: { 
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to_stage: targetStageId })
      });
      
      if (response.ok) {
        // Update local state optimistically
        setCards(prev => prev.map(c => 
          c.id === cardId 
            ? { ...c, stage_id: targetStageId }
            : c
        ));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to move card');
      }
    } catch (error) {
      console.error('Failed to move card:', error);
      alert('Failed to move card');
    }
  };

  // Group cards by stage
  const cardsByStage = cards.reduce((acc, card) => {
    if (!acc[card.stage_id]) {
      acc[card.stage_id] = [];
    }
    acc[card.stage_id].push(card);
    return acc;
  }, {} as Record<number, Card[]>);

  return (
    <div className="relative">
      {/* Board Container */}
      <div ref={containerRef} className="pipeline-board-container">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div 
            className="pipeline-stages-flex"
            style={{ '--stage-count': stages.length } as React.CSSProperties}
          >
            {stages.map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                cards={cardsByStage[stage.id] || []}
                pinnedLead={pinnedLead}
                loading={loading}
                onStageUpdate={(updatedStage) => {
                  onStagesUpdate(prev => prev.map(s => s.id === updatedStage.id ? updatedStage : s));
                }}
                onCardUpdate={loadCards}
              />
            ))}
          </div>
        </DndContext>
      </div>

      {/* Scroll Hint - More Prominent */}
      {stages.length > 4 && showScrollHint && (
        <div className="absolute top-4 right-8 z-20">
          <div className="bg-orange-500/30 backdrop-blur-md rounded-full px-4 py-2 border border-orange-400/60 shadow-lg">
            <div className="flex items-center gap-3 text-sm text-orange-100 font-bold">
              <span>Scroll right →</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse animation-delay-100" />
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse animation-delay-200" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drag Overlay */}
      {draggedCard && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/70 transform rotate-3 scale-105">
            <div className="text-sm font-semibold text-gray-900">
              {draggedCard.title || draggedCard.lead_email}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Moving to new stage...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
