const { Client } = require("pg");

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
}

async function importLeadsDirectly(leadsArray) {
  const client = await getClient();
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  console.log("🚀 Starting direct leads import...");

  for (const leadData of leadsArray) {
    try {
      // Validate required fields
      if (!leadData.full_name || !leadData.email) {
        throw new Error(`Missing required fields: ${JSON.stringify(leadData)}`);
      }

      // Set defaults for missing fields
      const processedLead = {
        full_name: leadData.full_name,
        email: leadData.email,
        phone: leadData.phone || null,
        company_name: leadData.company_name || null,
        message: leadData.message || null,
        source_page: leadData.source_page || "/crm-import",
        utm_source: leadData.utm_source || "crm-import",
        utm_medium: leadData.utm_medium || "import",
        utm_campaign: leadData.utm_campaign || "legacy-crm",
        referrer: leadData.referrer || null,
        created_at: leadData.created_at || new Date().toISOString(),
      };

      // Insert into database
      await client.query(
        `
        INSERT INTO leads (
          full_name, email, phone, company_name, message, source_page,
          utm_source, utm_medium, utm_campaign, referrer, ip_address, user_agent,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      `,
        [
          processedLead.full_name,
          processedLead.email,
          processedLead.phone,
          processedLead.company_name,
          processedLead.message,
          processedLead.source_page,
          processedLead.utm_source,
          processedLead.utm_medium,
          processedLead.utm_campaign,
          processedLead.referrer,
          "imported",
          "import-script",
          processedLead.created_at,
        ],
      );

      successCount++;
      console.log(`✅ Imported: ${processedLead.email}`);
    } catch (error) {
      errorCount++;
      errors.push(`Lead ${leadData.email || "unknown"}: ${error.message}`);
      console.log(`❌ Error importing lead: ${error.message}`);
    }
  }

  await client.end();

  console.log("\n📊 Import Summary:");
  console.log(`✅ Successfully imported: ${successCount} leads`);
  console.log(`❌ Errors: ${errorCount}`);

  if (errors.length > 0) {
    console.log("\n🚨 Error Details:");
    errors.forEach((error) => console.log(error));
  }

  return { successCount, errorCount, errors };
}

// Example usage with sample data
const sampleLeads = [
  {
    full_name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1-555-0123",
    company_name: "Tech Corp",
    message: "Interested in hair color tracking system",
    source_page: "/",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "hair-tracking",
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    full_name: "Sarah Johnson",
    email: "sarah.j@salon.com",
    phone: "+1-555-0456",
    company_name: "Beauty Studio",
    message: "Looking for color management solution",
    source_page: "/special-offer",
    utm_source: "facebook",
    utm_medium: "social",
    utm_campaign: "special-promo",
    created_at: "2024-01-16T14:15:00Z",
  },
];

if (require.main === module) {
  // You can replace sampleLeads with your actual data array
  importLeadsDirectly(sampleLeads)
    .then((result) => {
      console.log("\n🎉 Import completed!", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Import failed:", error);
      process.exit(1);
    });
}

module.exports = { importLeadsDirectly };
