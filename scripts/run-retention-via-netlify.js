// ===================================================================
// RUN RETENTION PROCESSING VIA NETLIFY ENVIRONMENT
// This ensures we use the same database connection as the functions
// ===================================================================

const { exec } = require("child_process");

async function runRetentionProcessing() {
  console.log("🚀 Running retention processing via Netlify environment...");

  return new Promise((resolve, reject) => {
    // Run the script using netlify dev:exec which has access to environment variables
    const command =
      'netlify dev:exec "cd scripts && node process-retention-data.js"';

    console.log("📡 Executing:", command);

    const process = exec(command, {
      cwd: "..", // Go up one directory to project root
      env: { ...process.env },
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer for large output
    });

    process.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    process.stderr.on("data", (data) => {
      console.error(data.toString());
    });

    process.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Retention processing completed successfully!");
        resolve();
      } else {
        console.error(`❌ Process exited with code ${code}`);
        reject(new Error(`Process failed with exit code ${code}`));
      }
    });

    process.on("error", (error) => {
      console.error("❌ Failed to start process:", error);
      reject(error);
    });
  });
}

// Run if called directly
if (require.main === module) {
  runRetentionProcessing()
    .then(() => {
      console.log("🎉 All done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Failed:", error.message);
      process.exit(1);
    });
}

module.exports = { runRetentionProcessing };
