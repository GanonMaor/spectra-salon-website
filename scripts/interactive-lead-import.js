const { Client } = require('pg');
const readline = require('readline');

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function interactiveImport() {
  const client = await getClient();
  const leads = [];

  console.log('🎯 Interactive Lead Import Tool');
  console.log('===============================');
  console.log('Enter lead information (press Enter for empty fields)');
  console.log('Type "done" for full_name to finish importing\n');

  while (true) {
    console.log(`\n📝 Lead #${leads.length + 1}:`);
    
    const full_name = await question('Full Name (required): ');
    if (full_name.toLowerCase() === 'done') break;
    
    if (!full_name.trim()) {
      console.log('❌ Full name is required!');
      continue;
    }

    const email = await question('Email (required): ');
    if (!email.trim()) {
      console.log('❌ Email is required!');
      continue;
    }

    const phone = await question('Phone (optional): ');
    const company_name = await question('Company Name (optional): ');
    const message = await question('Message/Notes (optional): ');
    
    console.log('\n📍 Source Page Options:');
    console.log('1. / (Home Page)');
    console.log('2. /special-offer (Special Offer)');
    console.log('3. /ugc-offer (UGC Offer)');
    console.log('4. /features (Features)');
    console.log('5. /contact (Contact)');
    console.log('6. /crm-import (Default for imports)');
    
    const sourceChoice = await question('Select source page (1-6, default: 6): ');
    const sourcePages = ['/', '/special-offer', '/ugc-offer', '/features', '/contact', '/crm-import'];
    const source_page = sourcePages[parseInt(sourceChoice) - 1] || '/crm-import';

    const utm_source = await question('UTM Source (optional, default: crm-import): ') || 'crm-import';
    const utm_medium = await question('UTM Medium (optional, default: import): ') || 'import';
    const utm_campaign = await question('UTM Campaign (optional, default: legacy-crm): ') || 'legacy-crm';

    const lead = {
      full_name: full_name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      company_name: company_name.trim() || null,
      message: message.trim() || null,
      source_page,
      utm_source,
      utm_medium,
      utm_campaign,
      created_at: new Date().toISOString()
    };

    leads.push(lead);
    console.log(`✅ Added: ${lead.full_name} (${lead.email})`);
  }

  if (leads.length === 0) {
    console.log('📝 No leads to import.');
    rl.close();
    await client.end();
    return;
  }

  console.log(`\n📊 Ready to import ${leads.length} leads:`);
  leads.forEach((lead, index) => {
    console.log(`${index + 1}. ${lead.full_name} - ${lead.email} (${lead.source_page})`);
  });

  const confirm = await question('\n🚀 Proceed with import? (y/n): ');
  
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Import cancelled.');
    rl.close();
    await client.end();
    return;
  }

  // Import leads
  let successCount = 0;
  let errorCount = 0;

  for (const lead of leads) {
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
        'interactive-import', // ip_address
        'import-tool', // user_agent
        lead.created_at
      ]);

      successCount++;
      console.log(`✅ Imported: ${lead.email}`);

    } catch (error) {
      errorCount++;
      console.log(`❌ Error importing ${lead.email}: ${error.message}`);
    }
  }

  console.log('\n🎉 Import Summary:');
  console.log(`✅ Successfully imported: ${successCount} leads`);
  console.log(`❌ Errors: ${errorCount}`);

  rl.close();
  await client.end();
}

if (require.main === module) {
  interactiveImport()
    .catch(error => {
      console.error('💥 Import failed:', error);
      process.exit(1);
    });
}

module.exports = { interactiveImport };