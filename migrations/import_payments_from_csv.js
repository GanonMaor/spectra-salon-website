import { neon } from '@neondatabase/serverless';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

// This script imports payments data from a CSV file to the database
// CSV format expected: client,date,currency,amount,country

async function importPayments() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Read CSV file path from command line argument
    const csvFilePath = process.argv[2];
    if (!csvFilePath) {
      console.error('❌ Please provide CSV file path as argument');
      console.log('Usage: node import_payments_from_csv.js path/to/file.csv');
      process.exit(1);
    }

    // Read and parse CSV file
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`📊 Found ${records.length} records to import`);

    // Clear existing data (optional - comment out if you want to append)
    console.log('🗑️  Clearing existing payments...');
    await sql`TRUNCATE TABLE spectra_payments RESTART IDENTITY CASCADE`;

    // Prepare batch insert
    const values = records.map(record => {
      // Parse date - adjust format as needed
      const date = new Date(record.date || record.payment_date);
      
      // Parse amount - remove currency symbols and commas
      const amount = parseFloat(
        (record.amount || '0')
          .replace(/[^0-9.-]/g, '')
          .replace(',', '')
      );

      // Determine currency if not specified
      let currency = record.currency?.toUpperCase();
      if (!currency) {
        // Auto-detect based on amount or client name
        currency = record.client?.includes('NYC') || record.client?.includes('LA') ? 'USD' : 'ILS';
      }

      // Determine country if not specified
      let country = record.country;
      if (!country) {
        if (currency === 'USD' || record.client?.match(/NYC|LA|US/i)) {
          country = 'USA';
        } else {
          country = 'Israel';
        }
      }

      return {
        client: record.client || record.name || 'Unknown Client',
        payment_date: date.toISOString().split('T')[0],
        currency: currency,
        amount: amount,
        country: country
      };
    });

    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < values.length; i += batchSize) {
      const batch = values.slice(i, i + batchSize);
      
      await sql`
        INSERT INTO spectra_payments (client, payment_date, currency, amount, country)
        SELECT * FROM ${sql(batch)}
      `;
      
      console.log(`✅ Imported ${Math.min(i + batchSize, values.length)}/${values.length} records`);
    }

    // Show summary
    const summary = await sql`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT client) as unique_clients,
        COUNT(DISTINCT country) as countries,
        SUM(CASE WHEN currency = 'ILS' THEN amount ELSE 0 END) as total_ils,
        SUM(CASE WHEN currency = 'USD' THEN amount ELSE 0 END) as total_usd
      FROM spectra_payments
    `;

    console.log('\n📈 Import Summary:');
    console.log(`Total Records: ${summary[0].total_records}`);
    console.log(`Unique Clients: ${summary[0].unique_clients}`);
    console.log(`Countries: ${summary[0].countries}`);
    console.log(`Total ILS: ₪${parseFloat(summary[0].total_ils).toLocaleString()}`);
    console.log(`Total USD: $${parseFloat(summary[0].total_usd).toLocaleString()}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Alternative: Import from Excel pivot table format
async function importFromPivotTable() {
  // This function handles pivot table format where:
  // - Rows are clients
  // - Columns are date_currency (e.g., "2024-01_ILS", "2024-01_USD")
  
  const sql = neon(process.env.DATABASE_URL);
  const csvFilePath = process.argv[2];
  
  if (!csvFilePath) {
    console.error('❌ Please provide CSV file path');
    return;
  }

  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const payments = [];
  
  for (const record of records) {
    const client = record.client || record.Client || Object.values(record)[0];
    
    // Process each column (skip the client name column)
    for (const [column, value] of Object.entries(record)) {
      if (column === 'client' || column === 'Client' || !value || value === '0') continue;
      
      // Parse column name (e.g., "2024-01_ILS" or "Jan 2024 ILS")
      const match = column.match(/(\d{4}[-_]\d{2}|\w+ \d{4})\s*[_\s]*(ILS|USD)/i);
      if (!match) continue;
      
      const dateStr = match[1];
      const currency = match[2].toUpperCase();
      
      // Parse date
      let date;
      if (dateStr.includes('-') || dateStr.includes('_')) {
        // Format: 2024-01
        date = new Date(dateStr.replace('_', '-') + '-15');
      } else {
        // Format: Jan 2024
        date = new Date(dateStr + ' 15');
      }
      
      const amount = parseFloat(value.replace(/[^0-9.-]/g, ''));
      if (isNaN(amount) || amount === 0) continue;
      
      payments.push({
        client,
        payment_date: date.toISOString().split('T')[0],
        currency,
        amount,
        country: currency === 'USD' ? 'USA' : 'Israel'
      });
    }
  }

  console.log(`📊 Parsed ${payments.length} payment records`);
  
  // Insert into database
  await sql`TRUNCATE TABLE spectra_payments RESTART IDENTITY CASCADE`;
  
  for (let i = 0; i < payments.length; i += 100) {
    const batch = payments.slice(i, i + 100);
    await sql`
      INSERT INTO spectra_payments (client, payment_date, currency, amount, country)
      SELECT * FROM ${sql(batch)}
    `;
    console.log(`✅ Imported ${Math.min(i + 100, payments.length)}/${payments.length} records`);
  }
}

// Run the appropriate import function
if (process.argv[3] === '--pivot') {
  importFromPivotTable();
} else {
  importPayments();
}
