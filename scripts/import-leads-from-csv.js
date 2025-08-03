const { Client } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
}

async function importLeadsFromCSV(csvFilePath) {
  const client = await getClient();
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  console.log('🚀 Starting leads import from CSV...');

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (row) => {
        try {
          // Map CSV columns to database fields
          // Adjust these mappings based on your CSV structure
          const leadData = {
            full_name: row['Full Name'] || row['Name'] || row['full_name'] || '',
            email: row['Email'] || row['email'] || '',
            phone: row['Phone'] || row['phone'] || null,
            company_name: row['Company'] || row['company_name'] || null,
            message: row['Message'] || row['Notes'] || row['message'] || null,
            source_page: row['Source'] || row['source_page'] || '/crm-import', // Default for imported leads
            utm_source: row['UTM Source'] || row['utm_source'] || 'crm-import',
            utm_medium: row['UTM Medium'] || row['utm_medium'] || 'import',
            utm_campaign: row['Campaign'] || row['utm_campaign'] || 'legacy-crm',
            referrer: row['Referrer'] || row['referrer'] || null,
            created_at: row['Date'] || row['created_at'] || new Date().toISOString()
          };

          // Validate required fields
          if (!leadData.full_name || !leadData.email) {
            throw new Error(`Missing required fields: ${JSON.stringify(row)}`);
          }

          // Insert into database
          await client.query(`
            INSERT INTO leads (
              full_name, email, phone, company_name, message, source_page,
              utm_source, utm_medium, utm_campaign, referrer, ip_address, user_agent,
              created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
          `, [
            leadData.full_name,
            leadData.email,
            leadData.phone,
            leadData.company_name,
            leadData.message,
            leadData.source_page,
            leadData.utm_source,
            leadData.utm_medium,
            leadData.utm_campaign,
            leadData.referrer,
            'imported', // ip_address
            'import-script', // user_agent
            leadData.created_at
          ]);

          successCount++;
          console.log(`✅ Imported: ${leadData.email}`);

        } catch (error) {
          errorCount++;
          errors.push(`Row ${errorCount}: ${error.message}`);
          console.log(`❌ Error importing row: ${error.message}`);
        }
      })
      .on('end', async () => {
        await client.end();
        console.log('\n📊 Import Summary:');
        console.log(`✅ Successfully imported: ${successCount} leads`);
        console.log(`❌ Errors: ${errorCount}`);
        
        if (errors.length > 0) {
          console.log('\n🚨 Error Details:');
          errors.forEach(error => console.log(error));
        }
        
        resolve({ successCount, errorCount, errors });
      })
      .on('error', reject);
  });
}

// Usage example
if (require.main === module) {
  const csvFile = process.argv[2];
  if (!csvFile) {
    console.log('Usage: node import-leads-from-csv.js <path-to-csv-file>');
    process.exit(1);
  }

  importLeadsFromCSV(csvFile)
    .then(result => {
      console.log('\n🎉 Import completed!', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importLeadsFromCSV };