#!/usr/bin/env node

const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

// Extended demo cards with realistic data
const extendedDemoCards = [
  // Applied (Stage 1) - Fresh leads
  { email: 'sarah.cohen@gmail.com', stage: 1, title: 'Website Contact Form', locked: true, daysAgo: 1 },
  { email: 'david.levi@yahoo.com', stage: 1, title: 'Instagram Inquiry', locked: false, daysAgo: 2 },
  { email: 'rachel.ben@outlook.com', stage: 1, title: 'Google Ads Click', locked: false, daysAgo: 3 },
  { email: 'michael.roth@gmail.com', stage: 1, title: 'Referral from Client', locked: false, daysAgo: 1 },
  { email: 'anna.green@company.com', stage: 1, title: 'LinkedIn Message', locked: false, daysAgo: 4 },
  { email: 'tom.wilson@business.co', stage: 1, title: 'Trade Show Lead', locked: false, daysAgo: 2 },

  // Qualified (Stage 2) - Interested prospects
  { email: 'lisa.brown@salon.com', stage: 2, title: 'Phone Consultation Done', locked: false, daysAgo: 5 },
  { email: 'james.taylor@spa.com', stage: 2, title: 'Demo Scheduled', locked: false, daysAgo: 3 },
  { email: 'emma.davis@beauty.com', stage: 2, title: 'Needs Assessment', locked: false, daysAgo: 4 },
  { email: 'alex.martin@hair.com', stage: 2, title: 'Budget Confirmed', locked: false, daysAgo: 6 },
  { email: 'sophie.white@studio.com', stage: 2, title: 'Technical Review', locked: false, daysAgo: 2 },

  // Payment Pending (Stage 3) - Ready to buy
  { email: 'carlos.rivera@salon.mx', stage: 3, title: 'Quote Approved', locked: false, daysAgo: 7 },
  { email: 'marie.dubois@beaute.fr', stage: 3, title: 'Contract Signed', locked: false, daysAgo: 1 },
  { email: 'yuki.tanaka@beauty.jp', stage: 3, title: 'Payment Processing', locked: false, daysAgo: 2 },
  { email: 'hans.mueller@friseur.de', stage: 3, title: 'Finance Approval', locked: false, daysAgo: 3 },
  { email: 'nina.petrov@salon.ru', stage: 3, title: 'Installment Plan', locked: false, daysAgo: 1 },

  // Installed (Stage 4) - Implementation
  { email: 'raj.patel@beauty.in', stage: 4, title: 'Installation Booked', locked: false, daysAgo: 10 },
  { email: 'lucia.santos@beleza.br', stage: 4, title: 'Training Scheduled', locked: false, daysAgo: 8 },
  { email: 'ahmed.hassan@salon.eg', stage: 4, title: 'Hardware Delivered', locked: false, daysAgo: 5 },
  { email: 'olga.ivanova@beauty.bg', stage: 4, title: 'Software Setup', locked: false, daysAgo: 12 },
  { email: 'jean.martin@coiffure.be', stage: 4, title: 'Staff Training', locked: false, daysAgo: 7 },

  // Active (Stage 5) - Success stories
  { email: 'isabella.rossi@salone.it', stage: 5, title: 'Live Customer - 3 months', locked: false, daysAgo: 90 },
  { email: 'erik.johansson@salong.se', stage: 5, title: 'Success Story', locked: false, daysAgo: 120 },
  { email: 'fatima.al-zahra@salon.ae', stage: 5, title: 'Referral Source', locked: false, daysAgo: 60 },
  { email: 'chen.wei@beauty.cn', stage: 5, title: 'Case Study Featured', locked: false, daysAgo: 45 },
  { email: 'maria.garcia@salon.es', stage: 5, title: 'Expansion Planning', locked: false, daysAgo: 75 },
  { email: 'pierre.bernard@salon.fr', stage: 5, title: 'Partnership Opportunity', locked: false, daysAgo: 30 }
];

// UTM sources for realistic metadata
const utmSources = [
  'google_ads', 'facebook_ads', 'instagram', 'linkedin', 'referral', 
  'organic_search', 'email_campaign', 'trade_show', 'partner', 'direct'
];

async function seedExtendedDemo() {
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
    
    // Clear existing cards
    await client.query('DELETE FROM public.pipeline_cards WHERE pipeline_id = $1', [pipelineId]);
    await client.query('DELETE FROM public.pipeline_stage_transitions WHERE card_id IN (SELECT id FROM public.pipeline_cards WHERE pipeline_id = $1)', [pipelineId]);
    console.log('🧹 Cleared existing cards and transitions');
    
    // Insert extended demo cards
    let cardsCreated = 0;
    for (const card of extendedDemoCards) {
      const stage = stages.find(s => s.position === card.stage);
      if (stage) {
        // Create realistic metadata
        const metadata = {
          utm_source: utmSources[Math.floor(Math.random() * utmSources.length)],
          utm_campaign: `campaign_${Math.floor(Math.random() * 5) + 1}`,
          initial_interest: ['color_tracking', 'inventory_management', 'analytics'][Math.floor(Math.random() * 3)],
          salon_size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)],
          budget_range: ['5k-10k', '10k-25k', '25k-50k', '50k+'][Math.floor(Math.random() * 4)]
        };

        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - card.daysAgo);
        
        const updatedAt = new Date();
        updatedAt.setDate(updatedAt.getDate() - Math.floor(card.daysAgo / 2));

        const result = await client.query(
          `INSERT INTO public.pipeline_cards (pipeline_id, stage_id, lead_email, title, meta_json, is_locked, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
          [pipelineId, stage.id, card.email, card.title, JSON.stringify(metadata), card.locked, createdAt, updatedAt]
        );

        // Add some realistic stage transitions for cards not in first stage
        if (card.stage > 1) {
          for (let fromStage = 1; fromStage < card.stage; fromStage++) {
            const fromStageData = stages.find(s => s.position === fromStage);
            const toStageData = stages.find(s => s.position === fromStage + 1);
            
            if (fromStageData && toStageData) {
              const transitionDate = new Date(createdAt);
              transitionDate.setDate(transitionDate.getDate() + (fromStage * 2)); // 2 days per stage
              
              await client.query(
                `INSERT INTO public.pipeline_stage_transitions (card_id, from_stage, to_stage, by_user, occurred_at)
                 VALUES ($1, $2, $3, $4, $5)`,
                [result.rows[0].id, fromStageData.id, toStageData.id, 'system@spectra-ci.com', transitionDate]
              );
            }
          }
        }
        
        cardsCreated++;
      }
    }
    
    console.log(`✅ Created ${cardsCreated} extended demo cards with realistic data`);
    console.log('');
    console.log('📋 Distribution by stage:');
    
    // Show distribution
    const distribution = await client.query(`
      SELECT s.name, s.position, COUNT(c.id) as count
      FROM public.pipeline_stages s
      LEFT JOIN public.pipeline_cards c ON s.id = c.stage_id
      WHERE s.pipeline_id = $1
      GROUP BY s.id, s.name, s.position
      ORDER BY s.position
    `, [pipelineId]);
    
    distribution.rows.forEach(row => {
      console.log(`  ${row.position}. ${row.name}: ${row.count} cards`);
    });
    
    console.log('');
    console.log('🌍 International leads with UTM data:');
    console.log('  • Realistic SLA timings');
    console.log('  • Metadata with UTM sources');
    console.log('  • Stage transition history');
    console.log('  • Mixed salon sizes and budgets');
    
    console.log('');
    console.log('🎯 Test URLs:');
    console.log('  • Main: /admin/sales/pipeline');
    console.log('  • Pin: /admin/sales/pipeline?lead=sarah.cohen@gmail.com');
    console.log('  • International: /admin/sales/pipeline?lead=isabella.rossi@salone.it');
    console.log('');
    console.log('🚀 Extended demo data ready for QA!');
    
  } catch (error) {
    console.error('❌ Failed to seed extended demo:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedExtendedDemo();
