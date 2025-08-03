const { Client } = require('pg');

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
}

const sampleLeads = [
  {
    full_name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+972-50-123-4567',
    company_name: 'Beauty Studio Pro',
    message: 'Interested in the color tracking system for our salon',
    source_page: '/',
    utm_source: 'google',
    utm_medium: 'organic',
    utm_campaign: 'brand-search',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // yesterday
  },
  {
    full_name: 'Michael Chen',
    email: 'mike.chen@beautyworks.com',
    phone: '+972-54-987-6543',
    company_name: 'BeautyWorks',
    message: 'Would like to know more about pricing for multiple locations',
    source_page: '/features',
    utm_source: 'facebook',
    utm_medium: 'cpc',
    utm_campaign: 'features-campaign',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
  },
  {
    full_name: 'Emma Rodriguez',
    email: 'emma.r@hairdesign.co.il',
    phone: '+972-52-555-1234',
    company_name: 'Hair Design Studio',
    message: 'Special offer looks great! When can we start?',
    source_page: '/special-offer',
    utm_source: 'instagram',
    utm_medium: 'social',
    utm_campaign: 'special-offer',
    created_at: new Date().toISOString() // today
  },
  {
    full_name: 'David Miller',
    email: 'd.miller@luxurybeauty.com',
    phone: '+972-50-777-8888',
    company_name: 'Luxury Beauty Lounge',
    message: 'Saw your Instagram video, very impressive technology',
    source_page: '/',
    utm_source: 'instagram',
    utm_medium: 'referral',
    utm_campaign: 'organic',
    created_at: new Date().toISOString() // today
  },
  {
    full_name: 'Rachel Cohen',
    email: 'rachel@modernsalon.co.il',
    phone: '+972-53-444-5555',
    company_name: 'Modern Salon',
    message: 'Need help with inventory management, heard you have solutions',
    source_page: '/features',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'inventory-keywords',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() // 12 hours ago
  },
  {
    full_name: 'Alex Thompson',
    email: 'alex.t@stylehub.com',
    phone: '+972-54-333-2222',
    company_name: 'StyleHub',
    message: 'Interested in a demo for our team',
    source_page: 'whatsapp',
    utm_source: 'whatsapp',
    utm_medium: 'direct',
    utm_campaign: 'whatsapp-widget',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() // 6 hours ago
  }
];

async function addSampleLeads() {
  const client = await getClient();
  let successCount = 0;
  let errorCount = 0;

  console.log('🚀 Adding sample leads...');

  for (const lead of sampleLeads) {
    try {
      await client.query(`
        INSERT INTO leads (
          full_name, email, phone, company_name, message, source_page,
          utm_source, utm_medium, utm_campaign, referrer, ip_address, user_agent,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      `, [
        lead.full_name,
        lead.email,
        lead.phone,
        lead.company_name,
        lead.message,
        lead.source_page,
        lead.utm_source,
        lead.utm_medium,
        lead.utm_campaign,
        null, // referrer
        'sample-script', // ip_address
        'sample-data-generator', // user_agent
        lead.created_at
      ]);

      successCount++;
      console.log(`✅ Added: ${lead.full_name} - ${lead.email}`);

    } catch (error) {
      errorCount++;
      console.log(`❌ Error adding ${lead.email}: ${error.message}`);
    }
  }

  await client.end();
  
  console.log('\n📊 Summary:');
  console.log(`✅ Successfully added: ${successCount} leads`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('\n🎉 Sample leads have been added to demonstrate the dashboard!');
}

addSampleLeads().catch(console.error);