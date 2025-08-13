require("dotenv").config();
const { Client } = require("pg");
const readline = require("readline");

async function sqlTerminal() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("🎯 Connected to Neon Database!");
    console.log('📝 Type SQL commands (type "exit" to quit)');
    console.log("━".repeat(50));

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "SQL> ",
    });

    rl.prompt();

    rl.on("line", async (input) => {
      const query = input.trim();

      if (query.toLowerCase() === "exit") {
        await client.end();
        rl.close();
        return;
      }

      if (query) {
        try {
          const result = await client.query(query);

          if (result.rows.length > 0) {
            console.table(result.rows);
          } else {
            console.log("✅ Query executed successfully");
          }
        } catch (error) {
          console.error("❌ Error:", error.message);
        }
      }

      rl.prompt();
    });
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  }
}

sqlTerminal().catch(console.error);
