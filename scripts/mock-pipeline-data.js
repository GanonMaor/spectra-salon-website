#!/usr/bin/env node

// Mock pipeline data for development when DB is not available
const mockData = {
  pipelines: [
    {
      id: 1,
      name: 'Onboarding',
      description: 'Default onboarding pipeline for new leads',
      is_default: true,
      created_at: new Date().toISOString()
    }
  ],
  stages: [
    { id: 1, pipeline_id: 1, name: 'Applied', position: 1, sla_hours: 48, color: '#3B82F6' },
    { id: 2, pipeline_id: 1, name: 'Qualified', position: 2, sla_hours: 72, color: '#10B981' },
    { id: 3, pipeline_id: 1, name: 'Payment Pending', position: 3, sla_hours: 48, color: '#F59E0B' },
    { id: 4, pipeline_id: 1, name: 'Installed', position: 4, sla_hours: 72, color: '#8B5CF6' },
    { id: 5, pipeline_id: 1, name: 'Active', position: 5, sla_hours: null, color: '#06B6D4' }
  ],
  cards: [
    { id: 1, pipeline_id: 1, stage_id: 1, lead_email: 'sarah.cohen@gmail.com', title: 'Initial Contact', is_locked: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, pipeline_id: 1, stage_id: 2, lead_email: 'david.levi@yahoo.com', title: 'Qualified Lead', is_locked: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, pipeline_id: 1, stage_id: 3, lead_email: 'rachel.ben@outlook.com', title: 'Payment Processing', is_locked: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ]
};

console.log('📊 Mock Pipeline Data Created');
console.log('💡 This is temporary data for development');
console.log('🔗 To use real DB, set up DATABASE_URL and run quick-pipeline-setup.js');
console.log('');
console.log('📋 Mock Data Summary:');
console.log(`  • ${mockData.pipelines.length} pipeline(s)`);
console.log(`  • ${mockData.stages.length} stages`);
console.log(`  • ${mockData.cards.length} demo cards`);
console.log('');
console.log('🎯 Test the UI at: /admin/sales/pipeline');

module.exports = mockData;
