import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { name, email, phone, company, message } = JSON.parse(event.body);

    // Validate required fields
    if (!name || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name and email are required' })
      };
    }

    // Insert into database
    const query = `
      INSERT INTO investor_contacts (
        name, 
        email, 
        phone, 
        company, 
        message,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id
    `;

    const values = [name, email, phone || null, company || null, message || null];
    const result = await pool.query(query, values);

    // Optional: Send notification email using Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'noreply@spectraai.io',
            to: 'investors@spectraai.io',
            subject: `New Investor Interest - ${name}`,
            html: `
              <h2>New Investor Contact</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <p><strong>Company/Fund:</strong> ${company || 'Not provided'}</p>
              <p><strong>Message:</strong> ${message || 'No message'}</p>
              <hr>
              <p style="font-size: 12px; color: #666;">
                Submitted at: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}
              </p>
            `
          })
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the whole request if email fails
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        success: true, 
        id: result.rows[0].id,
        message: 'Thank you for your interest. We will be in touch soon.'
      })
    };
  } catch (error) {
    console.error('Error processing investor contact:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
