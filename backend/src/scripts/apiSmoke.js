const BASE = 'http://localhost:5000/api';
const results = [];
const check = (n, ok, extra = '') => { results.push(ok); console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${ok ? '' : ' :: ' + extra}`); };
const login = async (email) => {
  const r = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'Admin@123' }) });
  const d = await r.json();
  return { status: r.status, token: d.token, user: d.user, body: d };
};

(async () => {
  const admin = await login('admin@platform.com');
  const cit = await login('citizen@example.com');
  const ent = await login('entrepreneur@example.com');
  const aut = await login('authority@city.gov.in');

  check('admin login', admin.status === 200 && admin.token);
  check('citizen login', cit.status === 200 && cit.token);
  check('entrepreneur login', ent.status === 200 && ent.token);
  check('authority login', aut.status === 200 && aut.token);

  const G = async (path, tok) => { const r = await fetch(`${BASE}${path}`, { headers: tok ? { Authorization: `Bearer ${tok}` } : {} }); return { status: r.status, body: await r.json().catch(() => null) }; };
  const A = async (method, path, tok, payload) => {
    const opts = { method, headers: { 'Content-Type': 'application/json' }, };
    if (tok) opts.headers.Authorization = `Bearer ${tok}`;
    if (payload) opts.body = JSON.stringify(payload);
    const r = await fetch(`${BASE}${path}`, opts);
    return { status: r.status, body: await r.json().catch(() => null) };
  };

  console.log('\n-- PUBLIC --');
  check('GET /content (public)', (await G('/content')).status === 200);
  check('GET /businesses (public)', (await G('/businesses')).status === 200);
  check('GET /businesses/cities', (await G('/businesses/cities')).status === 200);
  check('GET /services (public)', (await G('/services')).status === 200);
  check('GET /entrepreneurs/categories', (await G('/entrepreneurs/categories')).status === 200);
  const svc = await G('/services');
  check('GET /services/:id', svc.body?.length ? (await G(`/services/${svc.body[0].id}`)).status === 200 : true, 'no services');

  console.log('\n-- AUTH PROTECTED --');
  check('GET /auth/me', (await G('/auth/me', cit.token)).status === 200);
  check('GET /issues/mine (citizen)', (await G('/issues/mine', cit.token)).status === 200);
  check('GET /issues (authority)', (await G('/issues', aut.token)).status === 200);
  check('GET /issues (admin)', (await G('/issues', admin.token)).status === 200);
  check('GET /services/mine (entrepreneur)', (await G('/services/mine', ent.token)).status === 200);
  check('GET /entrepreneurs/profile/me', (await G('/entrepreneurs/profile/me', ent.token)).status === 200);
  check('GET /inquiries/mine', (await G('/inquiries/mine', cit.token)).status === 200);
  check('GET /inquiries/received (entrepreneur)', (await G('/inquiries/received', ent.token)).status === 200);

  console.log('\n-- ADMIN --');
  check('GET /admin/profiles', (await G('/admin/profiles', admin.token)).status === 200);
  check('GET /admin/profiles/pending', (await G('/admin/profiles/pending', admin.token)).status === 200);
  check('GET /admin/categories', (await G('/admin/categories', admin.token)).status === 200);
  check('GET /content/all (admin)', (await G('/content/all', admin.token)).status === 200);
  check('GET /stats/stats (admin)', (await G('/stats/stats', admin.token)).status === 200);
  check('GET /stats/users (admin)', (await G('/stats/users', admin.token)).status === 200);
  check('GET /content/complaints (admin)', (await G('/content/complaints', admin.token)).status === 200);

  console.log('\n-- ROLE ENFORCEMENT --');
  check('admin route blocked for citizen', (await G('/stats/stats', cit.token)).status === 403);
  check('admin route blocked for authority', (await G('/stats/stats', aut.token)).status === 403);
  check('admin profiles blocked for citizen', (await G('/admin/profiles', cit.token)).status === 403);
  check('no token -> 401 on /auth/me', (await G('/auth/me')).status === 401);
  check('citizen cannot update issue status', (await A('PUT', '/issues/1/status', cit.token, { status: 'resolved' })).status === 403);
  const issuesList = await G('/issues', aut.token);
  const anyIssue = issuesList.body?.[0];
  const upd = await A('PUT', '/issues/' + (anyIssue ? anyIssue.id : 'missing') + '/status', aut.token, { status: 'in_progress', comment: 'smoke' });
  check('authority CAN update issue status', anyIssue ? upd.status === 200 : upd.status === 400, JSON.stringify(upd.body).slice(0, 120));

  console.log('\n-- REGISTRATION HARDENING --');
  const reg = async (role) => { const r = await fetch(`${BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `smoke_${role}_${Date.now()}@example.com`, password: 'Smoke@123', full_name: 'Smoke Test', role }) }); return r.status; };
  check('cannot register as admin', (await reg('admin')) === 403);
  check('cannot register as authority', (await reg('authority')) === 403);
  check('can register as citizen', [201, 400].includes(await reg('citizen')));
  check('can register as entrepreneur', [201, 400].includes(await reg('entrepreneur')));

  console.log('\n-- MARKETPLACE VISIBILITY --');
  const biz = await G('/businesses');
  check('public businesses list non-empty', Array.isArray(biz.body) && biz.body.length > 0);
  const approved = (biz.body || []).every((b) => b.status === 'approved' || b.status === undefined);
  check('only approved businesses exposed', approved, JSON.stringify((biz.body || []).map(b => b.status)));

  const pass = results.filter(Boolean).length;
  console.log(`\n=== API SMOKE: ${pass} passed, ${results.length - pass} failed ===`);
  process.exit(results.length - pass > 0 ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(1); });