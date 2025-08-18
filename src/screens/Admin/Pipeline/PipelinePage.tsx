import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Filter, MoreVertical } from "lucide-react";
import GlassmorphismCard from "../../../components/GlassmorphismCard";
import { GlassButton } from "../../../components/ui/glass-button";
import { GlassInput } from "../../../components/ui/glass-input";
import PipelineBoard from "./PipelineBoard";
import NewPipelineModal from "./NewPipelineModal";
import NewStageModal from "./NewStageModal";
import { getAuthHeader } from "../../../api/client";

interface Pipeline {
  id: number;
  name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
}

interface Stage {
  id: number;
  pipeline_id: number;
  name: string;
  position: number;
  wip_limit?: number;
  sla_hours?: number;
  color?: string;
  created_at: string;
}

export default function PipelinePage() {
  const [searchParams] = useSearchParams();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewPipelineModal, setShowNewPipelineModal] = useState(false);
  const [showNewStageModal, setShowNewStageModal] = useState(false);
  
  // Pin mode for specific lead
  const pinnedLead = searchParams.get('lead');

  useEffect(() => {
    loadPipelines();
  }, []);

  useEffect(() => {
    if (selectedPipeline) {
      loadStages(selectedPipeline.id);
    }
  }, [selectedPipeline]);

  const loadPipelines = async () => {
    try {
      const response = await fetch('/.netlify/functions/pipeline/pipelines', {
        headers: { ...getAuthHeader() }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPipelines(data.pipelines);
        
        // Select default pipeline or first one
        const defaultPipeline = data.pipelines.find((p: Pipeline) => p.is_default) || data.pipelines[0];
        if (defaultPipeline) {
          setSelectedPipeline(defaultPipeline);
        }
      }
    } catch (error) {
      console.error('Failed to load pipelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStages = async (pipelineId: number) => {
    try {
      const response = await fetch(`/.netlify/functions/pipeline/pipelines/${pipelineId}/stages`, {
        headers: { ...getAuthHeader() }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStages(data.stages);
      }
    } catch (error) {
      console.error('Failed to load stages:', error);
    }
  };

  const handleCreatePipeline = async (pipelineData: { name: string; description?: string }) => {
    try {
      console.log('🚀 Creating pipeline via API:', pipelineData);
      
      const response = await fetch('/.netlify/functions/pipeline/pipelines', {
        method: 'POST',
        headers: { 
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pipelineData)
      });
      
      console.log('📡 API Response status:', response.status);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('📄 Raw response:', responseText);
        
        try {
          const data = JSON.parse(responseText);
          console.log('✅ Pipeline created:', data.pipeline);
          
          setPipelines(prev => [...prev, data.pipeline]);
          setSelectedPipeline(data.pipeline);
          setShowNewPipelineModal(false);
        } catch (parseError) {
          console.error('❌ JSON Parse Error:', parseError);
          console.error('📄 Response text:', responseText);
          alert(`Server response parsing error. Check console for details.`);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          alert(`Failed to create pipeline: ${errorData.error || 'Unknown error'}`);
        } catch {
          alert(`Failed to create pipeline: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      alert(`Network error: ${error.message}`);
    }
  };

  const handleCreateStage = async (stageData: { name: string; sla_hours?: number; wip_limit?: number; color?: string }) => {
    if (!selectedPipeline) return;
    
    try {
      const response = await fetch(`/.netlify/functions/pipeline/pipelines/${selectedPipeline.id}/stages`, {
        method: 'POST',
        headers: { 
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stageData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setStages(prev => [...prev, data.stage].sort((a, b) => a.position - b.position));
        setShowNewStageModal(false);
      }
    } catch (error) {
      console.error('Failed to create stage:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/80">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen overflow-x-hidden">
      {/* Header with proper button spacing */}
      <div className="mb-8 px-4 pr-12 overflow-visible isolate">
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2 drop-shadow-lg">
              Sales Pipeline
            </h1>
            <p className="text-white/90 drop-shadow-md">
              Manage leads through your sales process
              {pinnedLead && (
                <span className="ml-2 px-2 py-1 bg-orange-500/20 text-orange-200 rounded-full text-xs font-medium">
                  📌 Pinned: {pinnedLead}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <GlassButton
              variant="orange"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowNewStageModal(true)}
              disabled={!selectedPipeline}
            >
              New Stage
            </GlassButton>
            <GlassButton
              variant="default"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowNewPipelineModal(true)}
            >
              New Pipeline
            </GlassButton>
          </div>
        </div>

        {/* Pipeline Selector & Search with proper margins */}
        <div className="relative z-10 flex items-center gap-4 mb-6 px-2 overflow-visible">
          {/* Select wrapper with bounded width */}
          <div className="flex-1 min-w-0">
            <div className="max-w-[420px] min-w-[220px]">
              <select
                value={selectedPipeline?.id || ''}
                onChange={(e) => {
                  const pipeline = pipelines.find(p => p.id === parseInt(e.target.value));
                  setSelectedPipeline(pipeline || null);
                }}
                className="w-full h-12 px-4 rounded-2xl bg-white/45 border border-white/70 text-gray-900 font-semibold backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-orange-500/60 drop-shadow-sm"
              >
                <option value="">Select Pipeline</option>
                {pipelines.map(pipeline => (
                  <option key={pipeline.id} value={pipeline.id}>
                    {pipeline.name} {pipeline.is_default ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search wrapper with bounded width */}
          <div className="flex-[0_1_320px] min-w-[200px]">
            <GlassInput
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Pipeline Board with proper margins */}
      <div className="px-4">
        {selectedPipeline && stages.length > 0 && (
          <PipelineBoard
          pipeline={selectedPipeline}
          stages={stages}
          searchTerm={searchTerm}
          pinnedLead={pinnedLead}
          onStagesUpdate={setStages}
          />
        )}
      </div>

      {/* Empty State */}
      {selectedPipeline && stages.length === 0 && (
        <GlassmorphismCard variant="default" className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 drop-shadow-sm">No Stages Yet</h3>
            <p className="text-gray-800 mb-4 font-medium drop-shadow-sm">
              Create your first stage to start organizing leads in this pipeline.
            </p>
            <GlassButton
              variant="orange"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowNewStageModal(true)}
            >
              Create First Stage
            </GlassButton>
          </div>
        </GlassmorphismCard>
      )}

      {/* No Pipeline Selected */}
      {!selectedPipeline && (
        <GlassmorphismCard variant="default" className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 drop-shadow-sm">Select a Pipeline</h3>
            <p className="text-gray-800 mb-4 font-medium drop-shadow-sm">
              Choose a pipeline from the dropdown above or create a new one.
            </p>
            <GlassButton
              variant="default"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowNewPipelineModal(true)}
            >
              Create Pipeline
            </GlassButton>
          </div>
        </GlassmorphismCard>
      )}

      {/* Modals */}
      <NewPipelineModal
        isOpen={showNewPipelineModal}
        onClose={() => setShowNewPipelineModal(false)}
        onCreate={handleCreatePipeline}
      />

      <NewStageModal
        isOpen={showNewStageModal}
        onClose={() => setShowNewStageModal(false)}
        onCreate={handleCreateStage}
        pipelineName={selectedPipeline?.name}
      />
    </div>
  );
}
