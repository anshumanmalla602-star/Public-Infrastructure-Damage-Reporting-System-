require('dotenv').config();
const pool = require('./config/database');
const initializeDatabase = require('./config/initDb');
const { seedUsers, seedBusiness, seedIssues } = require('./config/seed');

async function seedContent() {
  const admin = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@platform.com']);
  if (admin.rows.length === 0) return;
  const c = await pool.query('SELECT id FROM admin_content WHERE created_by = $1', [admin.rows[0].id]);
  if (c.rows.length > 0) return;

  const rows = [
    ['Step 1: Choose your service category',
     'Pick the category that best matches your primary offering. You can list additional services later from your dashboard. Every category has its own demand pattern, pricing benchmark and licensing checklist.',
     'Getting Started'],
    ['Pricing strategies for home businesses',
     'Start by calculating your true cost per unit including raw material, packaging, fuel, transport and your time. Then price at raw cost + 30-40% margin. Review your pricing every month using repeat order rates as the key signal.',
     'Pricing'],
    ['Basic licensing and compliance',
     'Home food businesses in India typically need FSSAI Basic Registration (turnover under Rs.12 lakh). Beauty services may need GST registration and a municipal trade licence. Keep your registration certificate and ID proof ready for verification.',
     'Compliance'],
    ['Cost estimation and profit planning',
     'Build a simple monthly sheet: Revenue (orders x average order value) minus Costs (ingredients, packaging, rent, transport, platform fee) = Profit. Track your break-even order count each week and aim to grow month over month.',
     'Finance'],
    ['Marketing tips for home businesses',
     'Consistency beats reach. Post one daily story showing your process, collect real customer testimonials, offer a small first-order discount, and ask satisfied customers for referrals. Use your area WhatsApp groups for repeat customers.',
     'Marketing'],
  ];

  for (const [title, content, category] of rows) {
    await pool.query(
      'INSERT INTO admin_content (title, content, category, created_by) VALUES ($1,$2,$3,$4)',
      [title, content, category, admin.rows[0].id]
    );
  }
  console.log('Seeded guidance content');
}

async function run() {
  await initializeDatabase();
  await seedUsers();
  await seedBusiness();
  await seedIssues();
  await seedContent();

  console.log('\n=== Seed complete ===');
  console.log('Admin:        admin@platform.com / Admin@123');
  console.log('Authority:    authority@city.gov.in / Admin@123');
  console.log('Citizen:      citizen@example.com / Admin@123');
  console.log('Entrepreneur: entrepreneur@example.com / Admin@123\n');
  pool.end();
}

run().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
