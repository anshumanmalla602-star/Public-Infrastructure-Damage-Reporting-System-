require('dotenv').config();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const initializeDatabase = require('../config/initDb');

async function seedUsers() {
  const password = await bcrypt.hash('Admin@123', 10);
  const users = [
    ['admin@platform.com', 'System Admin', 'admin'],
    ['authority@city.gov.in', 'City Authority Officer', 'authority'],
    ['citizen@example.com', 'Ravi Kumar', 'citizen'],
    ['entrepreneur@example.com', 'Priya Sharma', 'entrepreneur'],
  ];
  for (const [email, full_name, role] of users) {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) continue;
    await pool.query(
      'INSERT INTO users (email, password, full_name, role, is_verified) VALUES ($1,$2,$3,$4,TRUE)',
      [email, password, full_name, role]
    );
    console.log(`Created user: ${email} (${role})`);
  }
}

async function seedBusiness() {
  const catRes = await pool.query('SELECT id, name FROM business_categories');
  const catMap = {};
  catRes.rows.forEach((c) => { catMap[c.name] = c.id; });

  const ent = await pool.query('SELECT id FROM users WHERE email = $1', ['entrepreneur@example.com']);
  if (ent.rows.length === 0) return;
  const p = await pool.query('SELECT id FROM entrepreneur_profiles WHERE user_id = $1', [ent.rows[0].id]);
  if (p.rows.length > 0) return;

  const prof = await pool.query(
    `INSERT INTO entrepreneur_profiles
     (user_id, business_name, category_id, description, address, city, state, pincode, phone,
      pricing_info, availability, license_info, cost_estimation, profit_planning, marketing_tips, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'approved') RETURNING id`,
    [ent.rows[0].id, 'Priya Home Tiffin', catMap['Tiffin / Home Food Service'],
     'Fresh home-cooked tiffin delivered daily in the neighbourhood. Vegetarian and non-vegetarian options.',
     '12 Park Street', 'Chennai', 'Tamil Nadu', '600001', '9876543210',
     'Home-cooked meal packages from Rs.150 - Rs.400 per day',
     'Monday to Saturday, 7:00 AM - 9:00 AM delivery',
     'FSSAI Basic Registration (Form B) applicable for home kitchens.',
     'Raw materials ~60%, packaging ~10%, labour ~20%, contingency ~10%.',
     'Break-even at 20 daily orders. Target 45 orders/month for Rs.25,000 margin.',
     'Share daily food photos on WhatsApp Status and Instagram reels. Run weekend tasting camps.']
  );
  await pool.query(
    `INSERT INTO services (entrepreneur_id, title, description, price, category, availability)
     VALUES ($1,'Veg Thali (Full Day)','2 sabzi, dal, rice, 4 roti, salad and sweet.',180.00,'Tiffin / Home Food Service','Daily, 7AM-9AM'),
            ($1,'Non-Veg Meals (6 days)','Chicken curry, rice, dal, 4 roti, sweet.',350.00,'Tiffin / Home Food Service','Mon-Sat'),
            ($1,'Custom Party Tiffin','Customisable thali for small functions, 20+ people.',220.00,'Tiffin / Home Food Service','Weekends')`,
    [prof.rows[0].id]
  );
  console.log('Seeded entrepreneur profile + services');
}

async function seedIssues() {
  const cit = await pool.query('SELECT id FROM users WHERE email = $1', ['citizen@example.com']);
  if (cit.rows.length === 0) return;
  const i = await pool.query('SELECT id FROM issues WHERE reporter_id = $1', [cit.rows[0].id]);
  if (i.rows.length > 0) return;
  await pool.query(
    `INSERT INTO issues (reporter_id, category, description, latitude, longitude, address, status, priority)
     VALUES ($1,'Pothole','Large pothole on the main road near the bus stop, causing accidents.',13.0827,80.2707,'Anna Salai, Chennai','reported','high'),
            ($1,'Streetlight','Streetlight not working for the last 3 nights in the residential lane.',13.0827,80.2707,'Anna Salai, Chennai','in_progress','medium'),
            ($1,'Water Leak','Continuous water leakage from the municipal pipeline.',13.0827,80.2707,'Anna Salai, Chennai','resolved','low')`,
    [cit.rows[0].id]
  );
  console.log('Seeded sample issues');
}

module.exports = { seedUsers, seedBusiness, seedIssues };
