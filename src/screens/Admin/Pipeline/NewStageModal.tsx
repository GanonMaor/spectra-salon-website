import React, { useState } from "react";
import { X, Plus, Flag, Clock, Users } from "lucide-react";
import GlassmorphismCard from "../../../components/GlassmorphismCard";
import { GlassButton } from "../../../components/ui/glass-button";
import { GlassInput } from "../../../components/ui/glass-input";

interface NewStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; sla_hours?: number; wip_limit?: number; color?: string }) => void;
  pipelineName?: string;
}

const stageColors = [
  { value: '#3B82F6', name: 'Blue', class: 'bg-blue-500' },
  { value: '#10B981', name: 'Green', class: 'bg-green-500' },
  { value: '#F59E0B', name: 'Amber', class: 'bg-amber-500' },
  { value: '#8B5CF6', name: 'Purple', class: 'bg-purple-500' },
  { value: '#06B6D4', name: 'Cyan', class: 'bg-cyan-500' },
  { value: '#EF4444', name: 'Red', class: 'bg-red-500' },
  { value: '#6B7280', name: 'Gray', class: 'bg-gray-500' },
];

export default function NewStageModal({ isOpen, onClose, onCreate, pipelineName }: NewStageModalProps) {
  const [name, setName] = useState("");
  const [slaHours, setSlaHours] = useState("");
  const [wipLimit, setWipLimit] = useState("");
  const [selectedColor, setSelectedColor] = useState(stageColors[0].value);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onCreate({
        name: name.trim(),
        sla_hours: slaHours ? parseInt(slaHours) : undefined,
        wip_limit: wipLimit ? parseInt(wipLimit) : undefined,
        color: selectedColor
      });
      
      // Reset form
      setName("");
      setSlaHours("");
      setWipLimit("");
      setSelectedColor(stageColors[0].value);
    } catch (error) {
      console.error('Failed to create stage:', error);
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
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 drop-shadow-sm">
                New Stage
              </h2>
              {pipelineName && (
                <p className="text-sm text-gray-700 font-medium">
                  in {pipelineName}
                </p>
              )}
            </div>
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
            label="Stage Name"
            type="text"
            placeholder="e.g., Qualified, Payment Pending..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            icon={<Flag className="w-4 h-4" />}
          />

          <div className="grid grid-cols-2 gap-4">
            <GlassInput
              label="SLA Hours (Optional)"
              type="number"
              placeholder="48"
              value={slaHours}
              onChange={(e) => setSlaHours(e.target.value)}
              icon={<Clock className="w-4 h-4" />}
            />

            <GlassInput
              label="WIP Limit (Optional)"
              type="number"
              placeholder="10"
              value={wipLimit}
              onChange={(e) => setWipLimit(e.target.value)}
              icon={<Users className="w-4 h-4" />}
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
              Stage Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {stageColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`
                    w-8 h-8 rounded-full ${color.class} transition-all duration-200
                    ${selectedColor === color.value 
                      ? 'ring-2 ring-offset-2 ring-offset-white/50 ring-gray-900 scale-110' 
                      : 'hover:scale-105'
                    }
                  `}
                  title={color.name}
                />
              ))}
            </div>
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
              Create Stage
            </GlassButton>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-6 p-4 bg-green-50/40 rounded-xl border border-green-200/40">
          <div className="text-xs text-green-800 font-medium mb-1">💡 Stage Tips:</div>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• SLA: Target hours to complete this stage</li>
            <li>• WIP: Maximum cards allowed in this stage</li>
            <li>• Color: Visual identifier for this stage</li>
          </ul>
        </div>
      </GlassmorphismCard>
    </div>
  );
}
