import React, { useState } from "react";
import { X, Plus, Workflow } from "lucide-react";
import GlassmorphismCard from "../../../components/GlassmorphismCard";
import { GlassButton } from "../../../components/ui/glass-button";
import { GlassInput } from "../../../components/ui/glass-input";

interface NewPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description?: string }) => void;
}

export default function NewPipelineModal({ isOpen, onClose, onCreate }: NewPipelineModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      console.log('🚀 Creating pipeline:', { name: name.trim(), description: description.trim() });
      
      await onCreate({
        name: name.trim(),
        description: description.trim() || undefined
      });
      
      console.log('✅ Pipeline created successfully');
      
      // Reset form
      setName("");
      setDescription("");
    } catch (error) {
      console.error('❌ Failed to create pipeline:', error);
      alert(`Failed to create pipeline: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassmorphismCard 
        variant="default" 
        className="w-full max-w-md p-6"
        style={{
          background: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.7)",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 drop-shadow-sm">
              New Pipeline
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/30 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label="Pipeline Name"
            type="text"
            placeholder="e.g., Sales Process, Onboarding..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            icon={<Workflow className="w-4 h-4" />}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2 drop-shadow-sm">
              Description (Optional)
            </label>
            <textarea
              placeholder="Describe this pipeline's purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-white/35 border border-white/60 text-gray-900 font-medium backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:bg-white/45 resize-none"
              style={{
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <GlassButton
              type="button"
              variant="default"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </GlassButton>
            
            <GlassButton
              type="submit"
              variant="orange"
              loading={loading}
              disabled={!name.trim() || loading}
              icon={<Plus className="w-4 h-4" />}
              className="flex-1"
            >
              Create Pipeline
            </GlassButton>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50/40 rounded-xl border border-blue-200/40">
          <div className="text-xs text-blue-800 font-medium mb-1">💡 Pro Tips:</div>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Use clear, action-oriented names</li>
            <li>• Start with 3-5 stages maximum</li>
            <li>• You can add stages later</li>
          </ul>
        </div>
      </GlassmorphismCard>
    </div>
  );
}
