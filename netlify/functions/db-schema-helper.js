const { Client } = require('pg');

// Define EXACT table schemas from Neon DB
const TABLE_SCHEMAS = {
  sumit_customers: {
    id: 'integer',
    created_at: 'timestamp',
    card_name: 'text',
    full_name: 'text',
    id_number: 'text',
    phone: 'text',
    email: 'text',
    address: 'text',
    city: 'text',
    zipcode: 'text',
    status: 'text'
  },
  sumit_payments: {
    id: 'integer',
    created_at: 'timestamp',
    customer_card_name: 'text',
    full_name: 'text',
    id_number: 'text',
    service_name: 'text',
    payment_method: 'text',
    payment_amount: 'numeric',
    payment_date: 'date',
    status: 'text'
  },
  sumit_failed_payments: {
    id: 'integer',
    created_at: 'timestamp',
    customer_card_name: 'text',
    full_name: 'text',
    id_number: 'text',
    service_name: 'text',
    reason: 'text',
    attempt_date: 'date'
  },
  sumit_standing_orders: {
    id: 'integer',
    created_at: 'timestamp',
    customer_card_name: 'text',
    full_name: 'text',
    id_number: 'text',
    service_name: 'text',
    status: 'text',
    start_date: 'date',
    end_date: 'date',
    frequency: 'text'
  }
};

// Create table if it doesn't exist
async function createTableIfNotExists(client, tableName) {
  const schema = TABLE_SCHEMAS[tableName];
  if (!schema) {
    console.log(`⚠️  No schema defined for table: ${tableName}`);
    return false;
  }

  const columns = Object.entries(schema).map(([name, type]) => {
    if (name === 'id') return `${name} SERIAL PRIMARY KEY`;
    if (name === 'created_at') return `${name} TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
    return `${name} ${type.toUpperCase()}`;
  }).join(', ');

  const createQuery = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      ${columns}
    )
  `;

  try {
    await client.query(createQuery);
    console.log(`✅ Table ${tableName} ensured to exist`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create table ${tableName}:`, error.message);
    return false;
  }
}

// Check table structure and verify columns
async function verifyTableStructure(client, tableName) {
  try {
    // Ensure table exists first
    await createTableIfNotExists(client, tableName);

    // Check actual columns
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);

    const actualColumns = columnsResult.rows.map(row => row.column_name);
    const expectedColumns = Object.keys(TABLE_SCHEMAS[tableName] || {});
    
    console.log(`📋 Table ${tableName}:`);
    console.log(`   Expected: ${expectedColumns.join(', ')}`);
    console.log(`   Actual: ${actualColumns.join(', ')}`);

    return {
      exists: actualColumns.length > 0,
      columns: actualColumns,
      expectedColumns,
      missingColumns: expectedColumns.filter(col => !actualColumns.includes(col))
    };

  } catch (error) {
    console.error(`❌ Error verifying table ${tableName}:`, error.message);
    return { exists: false, columns: [], error: error.message };
  }
}

// Generate safe SELECT query using ONLY existing columns
function generateSafeSelectQuery(tableName, requestedFields, actualColumns) {
  const schema = TABLE_SCHEMAS[tableName];
  if (!schema) {
    return `SELECT * FROM ${tableName}`;
  }

  const safeFields = requestedFields.map(field => {
    const columnName = field.column || field.name;
    const alias = field.alias || field.name;
    
    if (actualColumns.includes(columnName)) {
      return `${columnName} as ${alias}`;
    } else {
      // Provide safe defaults based on expected type
      const defaultValue = getDefaultValueForColumn(columnName, schema[columnName]);
      return `${defaultValue} as ${alias}`;
    }
  });

  return `SELECT ${safeFields.join(', ')} FROM ${tableName}`;
}

function getDefaultValueForColumn(columnName, dataType) {
  switch (dataType) {
    case 'integer': return '0';
    case 'numeric': return '0.0';
    case 'timestamp': case 'date': return 'CURRENT_DATE';
    case 'text': 
    default: 
      if (columnName.includes('email')) return "'unknown@example.com'";
      if (columnName.includes('name')) return "'Unknown'";
      if (columnName.includes('status')) return "'Active'";
      return "'Unknown'";
  }
}

module.exports = {
  TABLE_SCHEMAS,
  createTableIfNotExists,
  verifyTableStructure,
  generateSafeSelectQuery
}; 