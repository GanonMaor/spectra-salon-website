const { Client } = require('pg');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

// Mock data fallback for development
const mockData = {
  pipelines: [
    { id: 1, name: 'Onboarding', description: 'Default pipeline', is_default: true, created_at: new Date().toISOString() }
  ],
  stages: [
    { id: 1, pipeline_id: 1, name: 'Applied', position: 1, sla_hours: 48, color: '#3B82F6' },
    { id: 2, pipeline_id: 1, name: 'Qualified', position: 2, sla_hours: 72, color: '#10B981' },
    { id: 3, pipeline_id: 1, name: 'Payment Pending', position: 3, sla_hours: 48, color: '#F59E0B' },
    { id: 4, pipeline_id: 1, name: 'Installed', position: 4, sla_hours: 72, color: '#8B5CF6' },
    { id: 5, pipeline_id: 1, name: 'Active', position: 5, sla_hours: null, color: '#06B6D4' },
    { id: 6, pipeline_id: 1, name: 'Follow-up', position: 6, sla_hours: 168, color: '#EC4899' },
    { id: 7, pipeline_id: 1, name: 'Closed Won', position: 7, sla_hours: null, color: '#22C55E' }
  ],
  cards: [
    { 
      id: 1, 
      pipeline_id: 1, 
      stage_id: 1, 
      lead_email: 'sarah.cohen@gmail.com', 
      title: 'Initial Contact', 
      is_locked: true,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      stage_name: 'Applied',
      stage_position: 1,
      stage_color: '#3B82F6'
    },
    { 
      id: 2, 
      pipeline_id: 1, 
      stage_id: 2, 
      lead_email: 'david.levi@yahoo.com', 
      title: 'Qualified Lead', 
      is_locked: false,
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      stage_name: 'Qualified',
      stage_position: 2,
      stage_color: '#10B981'
    },
    { 
      id: 3, 
      pipeline_id: 1, 
      stage_id: 3, 
      lead_email: 'rachel.ben@outlook.com', 
      title: 'Payment Processing', 
      is_locked: false,
      created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      stage_name: 'Payment Pending',
      stage_position: 3,
      stage_color: '#F59E0B'
    },
    { 
      id: 4, 
      pipeline_id: 1, 
      stage_id: 6, 
      lead_email: 'anna.green@company.com', 
      title: 'Follow-up Call', 
      is_locked: false,
      created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      stage_name: 'Follow-up',
      stage_position: 6,
      stage_color: '#EC4899'
    },
    { 
      id: 5, 
      pipeline_id: 1, 
      stage_id: 7, 
      lead_email: 'tom.wilson@business.co', 
      title: 'Success Story', 
      is_locked: false,
      created_at: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      stage_name: 'Closed Won',
      stage_position: 7,
      stage_color: '#22C55E'
    }
  ]
};

// Helper function to create response with CORS headers
function createResponse(statusCode, data, isError = false) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    },
    body: JSON.stringify(isError ? { error: data } : data)
  };
}

// Helper function to verify JWT token
function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid authorization header');
  }
  
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Mock data handler for development
function handleMockData(event) {
  const method = event.httpMethod;
  const path = event.path.replace('/.netlify/functions/pipeline', '') || '/';
  const pathSegments = path.split('/').filter(Boolean);
  
  console.log('🎭 Mock mode:', { method, path, pathSegments });
  
  // GET /pipelines
  if (method === 'GET' && pathSegments.length === 1 && pathSegments[0] === 'pipelines') {
    return createResponse(200, { pipelines: mockData.pipelines });
  }
  
  // GET /pipelines/:id/stages
  if (method === 'GET' && pathSegments.length === 3 && pathSegments[0] === 'pipelines' && pathSegments[2] === 'stages') {
    const pipelineId = parseInt(pathSegments[1]);
    const stages = mockData.stages.filter(s => s.pipeline_id === pipelineId);
    return createResponse(200, { stages });
  }
  
  // GET /pipelines/:id/cards
  if (method === 'GET' && pathSegments.length === 3 && pathSegments[0] === 'pipelines' && pathSegments[2] === 'cards') {
    const pipelineId = parseInt(pathSegments[1]);
    const cards = mockData.cards
      .filter(c => c.pipeline_id === pipelineId)
      .map(card => ({
        ...card,
        // Ensure timestamps are valid
        created_at: card.created_at || new Date().toISOString(),
        updated_at: card.updated_at || new Date().toISOString()
      }));
    return createResponse(200, { cards });
  }
  
  // GET /pipelines/:id/metrics
  if (method === 'GET' && pathSegments.length === 3 && pathSegments[0] === 'pipelines' && pathSegments[2] === 'metrics') {
    const pipelineId = parseInt(pathSegments[1]);
    const stages = mockData.stages.filter(s => s.pipeline_id === pipelineId);
    const metrics = stages.map(stage => {
      const stageCards = mockData.cards.filter(c => c.stage_id === stage.id);
      return {
        id: stage.id,
        name: stage.name,
        position: stage.position,
        sla_hours: stage.sla_hours,
        card_count: stageCards.length,
        sla_compliance_percent: 95,
        avg_days_in_stage: 2.5
      };
    });
    return createResponse(200, { metrics });
  }
  
  // POST /pipelines - Mock creation
  if (method === 'POST' && pathSegments.length === 1 && pathSegments[0] === 'pipelines') {
    const body = JSON.parse(event.body || '{}');
    const newPipeline = {
      id: mockData.pipelines.length + 1,
      name: body.name,
      description: body.description || null,
      is_default: body.is_default || false,
      created_at: new Date().toISOString()
    };
    
    mockData.pipelines.push(newPipeline);
    console.log('✅ Mock pipeline created:', newPipeline);
    
    return createResponse(201, { pipeline: newPipeline });
  }
  
  return createResponse(404, 'Endpoint not found in mock mode', true);
}

// Helper function to log user actions
async function logUserAction(client, userEmail, action, metaJson = {}) {
  try {
    await client.query(
      `INSERT INTO public.user_actions (user_email, action, meta_json, occurred_at) 
       VALUES ($1, $2, $3, now())`,
      [userEmail, action, JSON.stringify(metaJson)]
    );
  } catch (error) {
    console.error('Failed to log user action:', error);
  }
}

exports.handler = async function(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      },
      body: ''
    };
  }

  // Use mock data if no DATABASE_URL or connection fails
  if (!DATABASE_URL || DATABASE_URL.includes('No project id found') || DATABASE_URL.length < 10) {
    console.log('⚠️ No valid DATABASE_URL found, using mock data');
    return handleMockData(event);
  }

  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    
    // Test if tables exist
    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema='public' AND table_name='pipelines'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('⚠️ Pipeline tables not found, using mock data');
      await client.end();
      return handleMockData(event);
    }
    
    // Verify authentication
    const user = verifyToken(event.headers.authorization);
    if (!user) {
      return createResponse(401, 'Unauthorized', true);
    }

    const method = event.httpMethod;
    const path = event.path.replace('/.netlify/functions/pipeline', '') || '/';
    const pathSegments = path.split('/').filter(Boolean);
    
    console.log('🔍 Debug:', { method, path, pathSegments, body: event.body });
    
    // Route handling
    switch (method) {
      case 'GET':
        return await handleGet(client, pathSegments, event.queryStringParameters, user);
      case 'POST':
        return await handlePost(client, pathSegments, JSON.parse(event.body || '{}'), user);
      case 'PATCH':
        return await handlePatch(client, pathSegments, JSON.parse(event.body || '{}'), user);
      case 'DELETE':
        return await handleDelete(client, pathSegments, user);
      default:
        return createResponse(405, 'Method not allowed', true);
    }
  } catch (error) {
    console.error('Pipeline API Error:', error);
    
    // If DB connection fails, fallback to mock data
    if (error.code === 'ENOTFOUND' || error.message.includes('does not exist')) {
      console.log('🎭 DB connection failed, falling back to mock data');
      try {
        await client.end();
      } catch {}
      return handleMockData(event);
    }
    
    return createResponse(
      error.message.includes('Unauthorized') ? 401 : 500,
      error.message,
      true
    );
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

async function handleGet(client, pathSegments, query, user) {
  // GET /pipelines
  if (pathSegments.length === 1 && pathSegments[0] === 'pipelines') {
    const result = await client.query(
      'SELECT * FROM public.pipelines ORDER BY is_default DESC, created_at ASC'
    );
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pipelines: result.rows })
    };
  }
  
  // GET /pipelines/:id/stages
  if (pathSegments.length === 3 && pathSegments[0] === 'pipelines' && pathSegments[2] === 'stages') {
    const pipelineId = pathSegments[1];
    const result = await client.query(
      'SELECT * FROM public.pipeline_stages WHERE pipeline_id = $1 ORDER BY position ASC',
      [pipelineId]
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ stages: result.rows })
    };
  }
  
  // GET /pipelines/:id/cards
  if (pathSegments.length === 3 && pathSegments[0] === 'pipelines' && pathSegments[2] === 'cards') {
    const pipelineId = pathSegments[1];
    const leadEmail = query?.lead_email;
    const searchQuery = query?.query;
    
    let sql = `
      SELECT pc.*, ps.name as stage_name, ps.position as stage_position, ps.color as stage_color
      FROM public.pipeline_cards pc
      JOIN public.pipeline_stages ps ON pc.stage_id = ps.id
      WHERE pc.pipeline_id = $1
    `;
    const params = [pipelineId];
    
    if (leadEmail) {
      sql += ' AND pc.lead_email = $2';
      params.push(leadEmail);
    }
    
    if (searchQuery) {
      sql += leadEmail ? ' AND pc.title ILIKE $3' : ' AND pc.title ILIKE $2';
      params.push(`%${searchQuery}%`);
    }
    
    sql += ' ORDER BY ps.position ASC, pc.created_at ASC';
    
    const result = await client.query(sql, params);
    return {
      statusCode: 200,
      body: JSON.stringify({ cards: result.rows })
    };
  }
  
  // GET /pipelines/:id/metrics
  if (pathSegments.length === 3 && pathSegments[0] === 'pipelines' && pathSegments[2] === 'metrics') {
    const pipelineId = pathSegments[1];
    
    // Count per stage
    const stageStats = await client.query(`
      SELECT 
        ps.id,
        ps.name,
        ps.position,
        ps.sla_hours,
        COUNT(pc.id) as card_count,
        COALESCE(
          COUNT(pc.id) FILTER (
            WHERE ps.sla_hours IS NOT NULL 
            AND pc.updated_at > now() - (ps.sla_hours || ' hours')::interval
          ) * 100.0 / NULLIF(COUNT(pc.id), 0), 
          100
        ) as sla_compliance_percent,
        AVG(EXTRACT(epoch FROM (now() - pc.created_at)) / 86400) as avg_days_in_stage
      FROM public.pipeline_stages ps
      LEFT JOIN public.pipeline_cards pc ON ps.id = pc.stage_id
      WHERE ps.pipeline_id = $1
      GROUP BY ps.id, ps.name, ps.position, ps.sla_hours
      ORDER BY ps.position ASC
    `, [pipelineId]);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ metrics: stageStats.rows })
    };
  }
  
  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Endpoint not found' })
  };
}

async function handlePost(client, pathSegments, body, user) {
  // Admin only for creation
  if (user.role !== 'admin') {
    return createResponse(403, 'Admin access required', true);
  }
  
  // POST /pipelines
  if (pathSegments.length === 1 && pathSegments[0] === 'pipelines') {
    const { name, description, is_default } = body;
    
    if (!name || !name.trim()) {
      return createResponse(400, 'Pipeline name is required', true);
    }
    
    console.log('💾 Creating pipeline in DB:', { name, description, is_default });
    
    try {
      const result = await client.query(
        'INSERT INTO public.pipelines (name, description, is_default) VALUES ($1, $2, $3) RETURNING *',
        [name.trim(), description || null, is_default || false]
      );
      
      await logUserAction(client, user.email, 'pipeline_create', { 
        pipeline_id: result.rows[0].id,
        name 
      });
      
      return createResponse(201, { pipeline: result.rows[0] });
    } catch (dbError) {
      console.error('❌ Database error creating pipeline:', dbError);
      return createResponse(500, `Database error: ${dbError.message}`, true);
    }
  }
  
  // POST /pipelines/:id/stages
  if (pathSegments.length === 3 && pathSegments[0] === 'pipelines' && pathSegments[2] === 'stages') {
    const pipelineId = pathSegments[1];
    const { name, position, wip_limit, sla_hours, color } = body;
    
    // If position not provided, get next position
    let finalPosition = position;
    if (!finalPosition) {
      const maxPos = await client.query(
        'SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM public.pipeline_stages WHERE pipeline_id = $1',
        [pipelineId]
      );
      finalPosition = maxPos.rows[0].next_pos;
    }
    
    const result = await client.query(
      'INSERT INTO public.pipeline_stages (pipeline_id, name, position, wip_limit, sla_hours, color) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [pipelineId, name, finalPosition, wip_limit || null, sla_hours || null, color || null]
    );
    
    await logUserAction(client, user.email, 'stage_create', { 
      pipeline_id: pipelineId,
      stage_id: result.rows[0].id,
      name,
      position: finalPosition
    });
    
    return {
      statusCode: 201,
      body: JSON.stringify({ stage: result.rows[0] })
    };
  }
  
  // POST /pipelines/:id/cards
  if (pathSegments.length === 3 && pathSegments[0] === 'pipelines' && pathSegments[2] === 'cards') {
    const pipelineId = pathSegments[1];
    const { lead_email, stage_id, title, meta_json, is_locked } = body;
    
    const result = await client.query(
      'INSERT INTO public.pipeline_cards (pipeline_id, stage_id, lead_email, title, meta_json, is_locked) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [pipelineId, stage_id, lead_email, title || null, meta_json || null, is_locked || false]
    );
    
    await logUserAction(client, user.email, 'pipeline_card_create', { 
      pipeline_id: pipelineId,
      stage_id,
      lead_email,
      card_id: result.rows[0].id
    });
    
    return {
      statusCode: 201,
      body: JSON.stringify({ card: result.rows[0] })
    };
  }
  
  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Endpoint not found' })
  };
}

async function handlePatch(client, pathSegments, body, user) {
  // PATCH /cards/:id/move
  if (pathSegments.length === 3 && pathSegments[0] === 'cards' && pathSegments[2] === 'move') {
    const cardId = pathSegments[1];
    const { to_stage } = body;
    
    // Get current card info
    const cardResult = await client.query(
      'SELECT * FROM public.pipeline_cards WHERE id = $1',
      [cardId]
    );
    
    if (cardResult.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Card not found' })
      };
    }
    
    const card = cardResult.rows[0];
    
    // Check if locked and moving backwards (only admin can do this)
    if (card.is_locked && user.role !== 'admin') {
      const currentStage = await client.query(
        'SELECT position FROM public.pipeline_stages WHERE id = $1',
        [card.stage_id]
      );
      const targetStage = await client.query(
        'SELECT position FROM public.pipeline_stages WHERE id = $1',
        [to_stage]
      );
      
      if (targetStage.rows[0].position < currentStage.rows[0].position) {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Cannot move locked card backwards. Admin access required.' })
        };
      }
    }
    
    // Update card
    await client.query(
      'UPDATE public.pipeline_cards SET stage_id = $1, updated_at = now() WHERE id = $2',
      [to_stage, cardId]
    );
    
    // Log transition
    await client.query(
      'INSERT INTO public.pipeline_stage_transitions (card_id, from_stage, to_stage, by_user) VALUES ($1, $2, $3, $4)',
      [cardId, card.stage_id, to_stage, user.email]
    );
    
    await logUserAction(client, user.email, 'pipeline_move', { 
      card_id: cardId,
      from_stage: card.stage_id,
      to_stage,
      lead_email: card.lead_email
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  }
  
  // PATCH /cards/:id
  if (pathSegments.length === 2 && pathSegments[0] === 'cards') {
    const cardId = pathSegments[1];
    const { title, meta_json, is_locked } = body;
    
    // Admin only for unlocking
    if (is_locked === false && user.role !== 'admin') {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Admin access required to unlock cards' })
      };
    }
    
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(title);
    }
    if (meta_json !== undefined) {
      updates.push(`meta_json = $${paramIndex++}`);
      params.push(JSON.stringify(meta_json));
    }
    if (is_locked !== undefined) {
      updates.push(`is_locked = $${paramIndex++}`);
      params.push(is_locked);
    }
    
    if (updates.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No updates provided' })
      };
    }
    
    updates.push(`updated_at = now()`);
    params.push(cardId);
    
    await client.query(
      `UPDATE public.pipeline_cards SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      params
    );
    
    await logUserAction(client, user.email, 'pipeline_card_update', { 
      card_id: cardId,
      updates: Object.keys(body)
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  }
  
  // PATCH /stages/:id
  if (pathSegments.length === 2 && pathSegments[0] === 'stages') {
    if (user.role !== 'admin') {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Admin access required' })
      };
    }
    
    const stageId = pathSegments[1];
    const { name, position, wip_limit, sla_hours, color } = body;
    
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (name) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (position) {
      updates.push(`position = $${paramIndex++}`);
      params.push(position);
    }
    if (wip_limit !== undefined) {
      updates.push(`wip_limit = $${paramIndex++}`);
      params.push(wip_limit);
    }
    if (sla_hours !== undefined) {
      updates.push(`sla_hours = $${paramIndex++}`);
      params.push(sla_hours);
    }
    if (color !== undefined) {
      updates.push(`color = $${paramIndex++}`);
      params.push(color);
    }
    
    if (updates.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No updates provided' })
      };
    }
    
    params.push(stageId);
    
    await client.query(
      `UPDATE public.pipeline_stages SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      params
    );
    
    await logUserAction(client, user.email, 'stage_update', { 
      stage_id: stageId,
      updates: Object.keys(body)
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  }
  
  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Endpoint not found' })
  };
}



async function handleDelete(client, pathSegments, user) {
  // Admin only for deletion
  if (user.role !== 'admin') {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Admin access required' })
    };
  }
  
  // DELETE /stages/:id
  if (pathSegments.length === 2 && pathSegments[0] === 'stages') {
    const stageId = pathSegments[1];
    
    await client.query('DELETE FROM public.pipeline_stages WHERE id = $1', [stageId]);
    
    await logUserAction(client, user.email, 'stage_delete', { 
      stage_id: stageId
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  }
  
  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Endpoint not found' })
  };
}
