// Temporary script to get NEON_DATABASE_URL from Netlify environment

const { execSync } = require("child_process");
const fs = require("fs");

try {
  // Try to get from netlify env
  const result = execSync("netlify env:get NEON_DATABASE_URL", {
    encoding: "utf8",
  });
  const dbUrl = result.trim();

  if (dbUrl && dbUrl !== "undefined") {
    // Create .env file
    fs.writeFileSync(".env", `NEON_DATABASE_URL=${dbUrl}\n`);
    console.log("✅ Created .env file with NEON_DATABASE_URL");
    console.log("🚀 Now run: cd scripts && node process-retention-data.js");
  } else {
    console.log("❌ NEON_DATABASE_URL not found in Netlify environment");
    console.log("💡 Please set it manually in .env file");
  }
} catch (error) {
  console.log("⚠️  Could not get from Netlify CLI:", error.message);
  console.log("💡 Please create .env file manually with:");
  console.log("NEON_DATABASE_URL=postgresql://user:password@host/database");
}
