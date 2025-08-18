#!/usr/bin/env node

const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

// Demo cards data
const demoCards = [
  { email: 'sarah.cohen@gmail.com', stage: 1, title: 'Initial Contact', locked: true },
  { email: 'david.levi@yahoo.com', stage: 1, title: 'Website Inquiry', locked: false },
  { email: 'rachel.ben@outlook.com', stage: 2, title: 'Phone Consultation', locked: false },
  { email: 'michael.roth@gmail.com', stage: 2, title: 'Demo Scheduled', locked: false },
  { email: 'anna.green@company.com', stage: 3, title: 'Quote Sent', locked: false },
  { email: 'tom.wilson@business.co', stage: 3, title: 'Payment Processing', locked: false },
  { email: 'lisa.brown@salon.com', stage: 4, title: 'Installation Booked', locked: false },
  { email: 'james.taylor@spa.com', stage: 4, title: 'Training Scheduled', locked: false },
  { email: 'emma.davis@beauty.com', stage: 5, title: 'Live Customer', locked: false },
  { email: 'alex.martin@hair.com', stage: 5, title: 'Success Story', locked: false }
];

async function seedPipelineDemo() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('🔌 Connected to database');
    
    // Get default pipeline ID
    const pipelineResult = await client.query(
      "SELECT id FROM public.pipelines WHERE name = 'Onboarding' LIMIT 1"
    );
    
    if (pipelineResult.rows.length === 0) {
      console.error('❌ Default Onboarding pipeline not found. Run setup-pipeline-db.js first.');
      process.exit(1);
    }
    
    const pipelineId = pipelineResult.rows[0].id;
    console.log(`📋 Using pipeline ID: ${pipelineId}`);
    
    // Get stages
    const stagesResult = await client.query(
      'SELECT id, position, name FROM public.pipeline_stages WHERE pipeline_id = $1 ORDER BY position',
      [pipelineId]
    );
    
    const stages = stagesResult.rows;
    console.log(`📊 Found ${stages.length} stages`);
    
    // Clear existing demo cards
    await client.query('DELETE FROM public.pipeline_cards WHERE pipeline_id = $1', [pipelineId]);
    console.log('🧹 Cleared existing cards');
    
    // Insert demo cards
    let cardsCreated = 0;
    for (const card of demoCards) {
      const stage = stages.find(s => s.position === card.stage);
      if (stage) {
        await client.query(
          `INSERT INTO public.pipeline_cards (pipeline_id, stage_id, lead_email, title, is_locked, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, now() - interval '${Math.floor(Math.random() * 7)} days', now())`,
          [pipelineId, stage.id, card.email, card.title, card.locked]
        );
        cardsCreated++;
      }
    }
    
    console.log(`✅ Created ${cardsCreated} demo cards`);
    console.log('');
    console.log('📋 Demo cards distribution:');
    
    // Show distribution
    for (const stage of stages) {
      const stageCards = demoCards.filter(c => c.stage === stage.position);
      console.log(`  ${stage.name}: ${stageCards.length} cards`);
      stageCards.forEach(card => {
        console.log(`    • ${card.email} ${card.locked ? '🔒' : ''}`);
      });
    }
    
    console.log('');
    console.log('🎯 Test URLs:');
    console.log('  • Main: /admin/sales/pipeline');
    console.log('  • Pin: /admin/sales/pipeline?lead=sarah.cohen@gmail.com');
    console.log('');
    console.log('🚀 Demo data ready!');
    
  } catch (error) {
    console.error('❌ Failed to seed demo data:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedPipelineDemo();
