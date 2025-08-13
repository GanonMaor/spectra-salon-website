const bcrypt = require("bcrypt");

async function generateHash() {
  const password = "spectra123!";
  const hash = await bcrypt.hash(password, 10);
  console.log("🔐 Password:", password);
  console.log("🔑 Hash:", hash);

  console.log("\n📋 SQL Command to update:");
  console.log(
    `UPDATE users SET password_hash = '${hash}' WHERE email = 'maor@spectra-ci.com';`,
  );
}

generateHash();
