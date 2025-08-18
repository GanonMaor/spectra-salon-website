#!/usr/bin/env node

// Quick setup for pipeline tables - simple version
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

async function quickSetup() {
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found');
    console.log('💡 Set it with: export DATABASE_URL="your-neon-connection-string"');
    return;
  }

  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('🔌 Connected to database');
    
    // Create tables one by one with error handling
    console.log('📝 Creating pipelines table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.pipelines (
        id           bigserial PRIMARY KEY,
        name         text NOT NULL,
        description  text,
        is_default   boolean DEFAULT false,
        created_at   timestamptz DEFAULT now()
      );
    `);
    
    console.log('📝 Creating pipeline_stages table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.pipeline_stages (
        id            bigserial PRIMARY KEY,
        pipeline_id   bigint NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
        name          text NOT NULL,
        position      int  NOT NULL,
        wip_limit     int  NULL,
        sla_hours     int  NULL,
        color         text NULL,
        created_at    timestamptz DEFAULT now(),
        UNIQUE (pipeline_id, position)
      );
    `);
    
    console.log('📝 Creating pipeline_cards table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.pipeline_cards (
        id              bigserial PRIMARY KEY,
        pipeline_id     bigint NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
        stage_id        bigint NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
        lead_email      text   NOT NULL,
        title           text   NULL,
        meta_json       jsonb  NULL,
        is_locked       boolean DEFAULT false,
        created_at      timestamptz DEFAULT now(),
        updated_at      timestamptz DEFAULT now()
      );
    `);
    
    console.log('📝 Creating pipeline_stage_transitions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.pipeline_stage_transitions (
        id           bigserial PRIMARY KEY,
        card_id      bigint NOT NULL REFERENCES public.pipeline_cards(id) ON DELETE CASCADE,
        from_stage   bigint NULL,
        to_stage     bigint NOT NULL,
        by_user      text   NULL,
        occurred_at  timestamptz DEFAULT now()
      );
    `);
    
    console.log('📊 Creating indexes...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cards_pipeline_stage ON public.pipeline_cards (pipeline_id, stage_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cards_lead_email ON public.pipeline_cards (lead_email);`);
    
    console.log('🌱 Creating default pipeline...');
    const pipelineResult = await client.query(`
      INSERT INTO public.pipelines (name, description, is_default) 
      VALUES ('Onboarding', 'Default onboarding pipeline', true) 
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);
    
    let pipelineId;
    if (pipelineResult.rows.length > 0) {
      pipelineId = pipelineResult.rows[0].id;
    } else {
      const existing = await client.query("SELECT id FROM public.pipelines WHERE name = 'Onboarding'");
      pipelineId = existing.rows[0].id;
    }
    
    console.log(`📋 Pipeline ID: ${pipelineId}`);
    
    console.log('🎯 Creating default stages...');
    const stages = [
      { name: 'Applied', position: 1, sla_hours: 48, color: '#3B82F6' },
      { name: 'Qualified', position: 2, sla_hours: 72, color: '#10B981' },
      { name: 'Payment Pending', position: 3, sla_hours: 48, color: '#F59E0B' },
      { name: 'Installed', position: 4, sla_hours: 72, color: '#8B5CF6' },
      { name: 'Active', position: 5, sla_hours: null, color: '#06B6D4' }
    ];
    
    for (const stage of stages) {
      await client.query(`
        INSERT INTO public.pipeline_stages (pipeline_id, name, position, sla_hours, color)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (pipeline_id, position) DO NOTHING
      `, [pipelineId, stage.name, stage.position, stage.sla_hours, stage.color]);
    }
    
    console.log('✅ Pipeline system ready!');
    console.log('🎯 Test URL: /admin/sales/pipeline');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('💡 Common issues:');
    console.log('  • Check DATABASE_URL is correct');
    console.log('  • Ensure database exists and is accessible');
    console.log('  • Check network connection to Neon');
  } finally {
    await client.end();
  }
}

quickSetup();
