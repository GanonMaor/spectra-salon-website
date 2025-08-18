#!/usr/bin/env node

const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8888';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yourdomain.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Passw0rd!';

async function testPipelineAPI() {
  console.log('🧪 Testing Pipeline API...');
  console.log(`📡 Base URL: ${BASE_URL}`);
  
  try {
    // 1. Login to get token
    console.log('\n1️⃣ Getting admin token...');
    const loginResponse = await fetch(`${BASE_URL}/.netlify/functions/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Token received');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Test pipelines endpoint
    console.log('\n2️⃣ Testing pipelines endpoint...');
    const pipelinesResponse = await fetch(`${BASE_URL}/.netlify/functions/pipeline/pipelines`, {
      headers
    });
    
    if (!pipelinesResponse.ok) {
      console.error('❌ Pipelines endpoint failed:', await pipelinesResponse.text());
      return;
    }
    
    const pipelinesData = await pipelinesResponse.json();
    console.log(`✅ Found ${pipelinesData.pipelines.length} pipelines`);
    pipelinesData.pipelines.forEach(p => {
      console.log(`  • ${p.name} ${p.is_default ? '(default)' : ''}`);
    });
    
    // Get default pipeline
    const defaultPipeline = pipelinesData.pipelines.find(p => p.is_default);
    if (!defaultPipeline) {
      console.error('❌ No default pipeline found');
      return;
    }
    
    console.log(`🎯 Using pipeline: ${defaultPipeline.name} (ID: ${defaultPipeline.id})`);
    
    // 3. Test stages endpoint
    console.log('\n3️⃣ Testing stages endpoint...');
    const stagesResponse = await fetch(`${BASE_URL}/.netlify/functions/pipeline/pipelines/${defaultPipeline.id}/stages`, {
      headers
    });
    
    if (!stagesResponse.ok) {
      console.error('❌ Stages endpoint failed:', await stagesResponse.text());
      return;
    }
    
    const stagesData = await stagesResponse.json();
    console.log(`✅ Found ${stagesData.stages.length} stages`);
    stagesData.stages.forEach(s => {
      console.log(`  ${s.position}. ${s.name} ${s.sla_hours ? `(${s.sla_hours}h SLA)` : ''}`);
    });
    
    // 4. Test cards endpoint
    console.log('\n4️⃣ Testing cards endpoint...');
    const cardsResponse = await fetch(`${BASE_URL}/.netlify/functions/pipeline/pipelines/${defaultPipeline.id}/cards`, {
      headers
    });
    
    if (!cardsResponse.ok) {
      console.error('❌ Cards endpoint failed:', await cardsResponse.text());
      return;
    }
    
    const cardsData = await cardsResponse.json();
    console.log(`✅ Found ${cardsData.cards.length} cards`);
    
    // Group by stage
    const cardsByStage = {};
    cardsData.cards.forEach(card => {
      if (!cardsByStage[card.stage_name]) {
        cardsByStage[card.stage_name] = [];
      }
      cardsByStage[card.stage_name].push(card);
    });
    
    Object.keys(cardsByStage).forEach(stageName => {
      const cards = cardsByStage[stageName];
      console.log(`  📋 ${stageName}: ${cards.length} cards`);
      cards.forEach(card => {
        console.log(`    • ${card.lead_email} ${card.is_locked ? '🔒' : ''}`);
      });
    });
    
    // 5. Test metrics endpoint
    console.log('\n5️⃣ Testing metrics endpoint...');
    const metricsResponse = await fetch(`${BASE_URL}/.netlify/functions/pipeline/pipelines/${defaultPipeline.id}/metrics`, {
      headers
    });
    
    if (!metricsResponse.ok) {
      console.error('❌ Metrics endpoint failed:', await metricsResponse.text());
      return;
    }
    
    const metricsData = await metricsResponse.json();
    console.log(`✅ Metrics loaded for ${metricsData.metrics.length} stages`);
    metricsData.metrics.forEach(metric => {
      console.log(`  📊 ${metric.name}: ${metric.card_count} cards, ${Math.round(metric.sla_compliance_percent)}% SLA, ${parseFloat(metric.avg_days_in_stage || 0).toFixed(1)}d avg`);
    });
    
    // 6. Test card creation
    console.log('\n6️⃣ Testing card creation...');
    const testCard = {
      lead_email: 'test@pipeline-demo.com',
      stage_id: stagesData.stages[0].id,
      title: 'API Test Card',
      is_locked: true
    };
    
    const createCardResponse = await fetch(`${BASE_URL}/.netlify/functions/pipeline/pipelines/${defaultPipeline.id}/cards`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testCard)
    });
    
    if (!createCardResponse.ok) {
      console.error('❌ Card creation failed:', await createCardResponse.text());
      return;
    }
    
    const newCard = await createCardResponse.json();
    console.log(`✅ Created test card: ${newCard.card.lead_email} (ID: ${newCard.card.id})`);
    
    // 7. Test card move
    if (stagesData.stages.length > 1) {
      console.log('\n7️⃣ Testing card move...');
      const moveResponse = await fetch(`${BASE_URL}/.netlify/functions/pipeline/cards/${newCard.card.id}/move`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ to_stage: stagesData.stages[1].id })
      });
      
      if (!moveResponse.ok) {
        console.error('❌ Card move failed:', await moveResponse.text());
        return;
      }
      
      console.log(`✅ Moved card to stage: ${stagesData.stages[1].name}`);
    }
    
    console.log('\n🎉 All API tests passed!');
    console.log('\n🔗 Test URLs:');
    console.log(`  • Pipeline: ${BASE_URL}/admin/sales/pipeline`);
    console.log(`  • Pin mode: ${BASE_URL}/admin/sales/pipeline?lead=sarah.cohen@gmail.com`);
    console.log(`  • Test card: ${BASE_URL}/admin/sales/pipeline?lead=test@pipeline-demo.com`);
    
  } catch (error) {
    console.error('❌ API test failed:', error);
    process.exit(1);
  }
}

testPipelineAPI();
