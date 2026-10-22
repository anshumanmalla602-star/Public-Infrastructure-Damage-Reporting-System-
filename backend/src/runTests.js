/* Integration test script - exercises the full API surface */
const fs = require('fs');
const path = require('path');
const { req, check, results } = require('./testApi');

async function runBusinessTests(citizenToken, entToken) {
  console.log('\n=== BUSINESS / SERVICES ===');
  const businesses = await req('GET', '/businesses');
  check('approved businesses listed', businesses.status === 200 && businesses.data.length > 0);
  const biz = businesses.data[0];

  const bizDetail = await req('GET', `/businesses/${biz.id}`, { token: citizenToken });
  check('business detail loads', bizDetail.status === 200);

  const bizServices = await req('GET', `/businesses/${biz.id}/services`);
  check('business services load', bizServices.status === 200 && bizServices.data.length > 0);

  const cities = await req('GET', '/businesses/cities');
  check('cities endpoint works', cities.status === 200 && Array.isArray(cities.data));

  const services = await req('GET', '/services');
  check('service listing works', services.status === 200 && services.data.length > 0);

  const filtered = await req('GET', '/services?category=Tiffin%20%2F%20Home%20Food%20Service');
  check('service category filter works', filtered.data.length > 0);

  const searched = await req('GET', '/services?search=thali');
  check('service search works', searched.data.length > 0);

  const entServices = await req('GET', '/services/mine', { token: entToken });
  check('entrepreneur own services', entServices.status === 200 && entServices.data.length > 0);

  console.log('\n=== INQUIRIES ===');
  const svc = services.data[0];
  const inq = await req('POST', '/inquiries', {
    token: citizenToken,
    body: { entrepreneur_id: svc.entrepreneur_id, service_id: svc.id, message: 'Do you deliver to Anna Salai?' },
  });
  check('inquiry created', inq.status === 201);

  const myInq = await req('GET', '/inquiries/mine', { token: citizenToken });
  check('customer sees own inquiry', myInq.data.length > 0);

  const recvd = await req('GET', '/inquiries/received', { token: entToken });
  check('entrepreneur receives inquiry', recvd.data.length > 0);

  const responded = await req('PUT', `/inquiries/${inq.data.id}/respond`, {
    token: entToken, body: { status: 'responded', response: 'Yes, we deliver daily.' },
  });
  check('entrepreneur responds', responded.status === 200 && responded.data.status === 'responded');
}

async function runAdminTests(adminToken, citizenToken) {
  console.log('\n=== ADMIN ===');
  const pending = await req('GET', '/admin/profiles/pending', { token: adminToken });
  check('pending profiles endpoint works', pending.status === 200);

  const allProfiles = await req('GET', '/admin/profiles', { token: adminToken });
  check('all profiles endpoint works', allProfiles.status === 200);

  const cats = await req('GET', '/admin/categories', { token: adminToken });
  check('admin categories works', cats.status === 200 && cats.data.length > 0);

  const newCat = await req('POST', '/admin/categories', {
    token: adminToken, body: { name: 'Test Category ' + Date.now(), description: 'temp' },
  });
  check('admin creates category', newCat.status === 201);

  const delCat = await req('DELETE', `/admin/categories/${newCat.data.id}`, { token: adminToken });
  check('admin deletes category', delCat.status === 200);

  const content = await req('GET', '/content');
  check('public guidance content loads', content.status === 200 && content.data.length > 0);

  const newContent = await req('POST', '/content', {
    token: adminToken, body: { title: 'Test Guide', content: 'Body text', category: 'Testing' },
  });
  check('admin creates content', newContent.status === 201);

  const updContent = await req('PUT', `/content/${newContent.data.id}`, {
    token: adminToken, body: { title: 'Test Guide Updated' },
  });
  check('admin updates content', updContent.status === 200);

  const delContent = await req('DELETE', `/content/${newContent.data.id}`, { token: adminToken });
  check('admin deletes content', delContent.status === 200);

  const complaint = await req('POST', '/content/complaints', {
    token: citizenToken, body: { title: 'Service issue', description: 'Wrong order' },
  });
  check('complaint created', complaint.status === 201);

  const complaints = await req('GET', '/content/complaints', { token: adminToken });
  check('admin views complaints', complaints.status === 200);

  const updComplaint = await req('PUT', `/content/complaints/${complaint.data.id}/status`, {
    token: adminToken, body: { status: 'closed' },
  });
  check('admin closes complaint', updComplaint.status === 200);

  const stats = await req('GET', '/stats/stats', { token: adminToken });
  check('stats endpoint works', stats.status === 200 && stats.data.totalUsers > 0);
  check('stats has issue breakdown', Array.isArray(stats.data.issuesByStatus));
  check('stats has category breakdown', Array.isArray(stats.data.issuesByCategory));

  const users = await req('GET', '/stats/users', { token: adminToken });
  check('admin lists users', users.status === 200 && users.data.length > 0);

  console.log('\n=== REGISTRATION ===');
  const newEmail = `test${Date.now()}@example.com`;
  const reg = await req('POST', '/auth/register', {
    body: { email: newEmail, password: 'Test@1234', full_name: 'Test User', phone: '9999999999', role: 'entrepreneur' },
  });
  check('new user registers', reg.status === 201 && reg.data.token);

  const dupe = await req('POST', '/auth/register', {
    body: { email: newEmail, password: 'Test@1234', full_name: 'Dup', role: 'citizen' },
  });
  check('duplicate email rejected', dupe.status === 400);

  const me = await req('GET', '/auth/me', { token: citizenToken });
  check('/auth/me returns profile', me.status === 200 && me.data.email === 'citizen@example.com');

  const esc = await req('POST', '/auth/register', {
    body: { email: `esc${Date.now()}@example.com`, password: 'Test@1234', full_name: 'Escalator', role: 'admin' },
  });
  check('cannot self-register as admin', esc.status === 403, JSON.stringify(esc.data));

  const esc2 = await req('POST', '/auth/register', {
    body: { email: `esc2${Date.now()}@example.com`, password: 'Test@1234', full_name: 'Escalator2', role: 'authority' },
  });
  check('cannot self-register as authority', esc2.status === 403);

  const weak = await req('POST', '/auth/register', {
    body: { email: `weak${Date.now()}@example.com`, password: 'abc', full_name: 'Weak' },
  });
  check('short password rejected', weak.status === 400);
}

async function runValidationTests(citizenToken, adminToken, authorityToken) {
  console.log('\n=== INPUT VALIDATION ===');

  // Malformed UUIDs must be rejected as 400 rather than bubbling up a 500
  // from the Postgres UUID cast.
  const badIssue = await req('GET', '/issues/1', { token: citizenToken });
  check('malformed issue id returns 400', badIssue.status === 400, JSON.stringify(badIssue.data));

  const badStatus = await req('PUT', '/issues/not-a-uuid/status', {
    token: authorityToken, body: { status: 'in_progress' },
  });
  check('malformed issue id on status update returns 400', badStatus.status === 400, JSON.stringify(badStatus.data));

  const badService = await req('GET', '/services/abc');
  check('malformed service id returns 400', badService.status === 400);

  const badBusiness = await req('GET', '/businesses/123');
  check('malformed business id returns 400', badBusiness.status === 400);

  const badCategory = await req('PUT', '/admin/categories/xyz', {
    token: adminToken, body: { name: 'Bad' },
  });
  check('malformed category id returns 400', badCategory.status === 400);

  const badContent = await req('DELETE', '/content/xyz', { token: adminToken });
  check('malformed content id returns 400', badContent.status === 400);

  // A well-formed but unknown UUID is a 404, not a 400.
  const missing = await req('GET', '/issues/00000000-0000-0000-0000-000000000000', { token: citizenToken });
  check('unknown but valid issue id returns 404', missing.status === 404, JSON.stringify(missing.data));
}

module.exports = { runBusinessTests, runAdminTests, runValidationTests };


(async () => {
  console.log('\n=== AUTH ===');
  const login = await req('POST', '/auth/login', {
    body: { email: 'admin@platform.com', password: 'Admin@123' },
  });
  check('admin login', login.status === 200 && login.data.token, JSON.stringify(login.data));
  const adminToken = login.data.token;

  const cit = await req('POST', '/auth/login', {
    body: { email: 'citizen@example.com', password: 'Admin@123' },
  });
  const citizenToken = cit.data.token;
  check('citizen login', cit.status === 200);

  const ent = await req('POST', '/auth/login', {
    body: { email: 'entrepreneur@example.com', password: 'Admin@123' },
  });
  const entToken = ent.data.token;
  check('entrepreneur login', ent.status === 200);

  const auth = await req('POST', '/auth/login', {
    body: { email: 'authority@city.gov.in', password: 'Admin@123' },
  });
  const authToken = auth.data.token;
  check('authority login', auth.status === 200);

  const bad = await req('POST', '/auth/login', {
    body: { email: 'admin@platform.com', password: 'wrong' },
  });
  check('bad password rejected', bad.status === 400);

  const noAuth = await req('GET', '/stats/stats');
  check('unauthenticated blocked', noAuth.status === 401);

  const citizenBlocked = await req('GET', '/stats/stats', { token: citizenToken });
  check('non-admin blocked from admin route', citizenBlocked.status === 403);

  console.log('\n=== ISSUES ===');
  const tmpImg = path.join(__dirname, 'test-upload.png');
  fs.writeFileSync(tmpImg, Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex'));

  const fd = new FormData();
  fd.append('category', 'Pothole');
  fd.append('description', 'Deep pothole near the bridge approach, auto risk.');
  fd.append('latitude', '13.0850');
  fd.append('longitude', '80.2700');
  fd.append('address', 'Bridge Road, Chennai');
  fd.append('image', new Blob([fs.readFileSync(tmpImg)], { type: 'image/png' }), 'test-upload.png');

  const created = await req('POST', '/issues', { token: citizenToken, formData: fd });
  check('issue created with photo', created.status === 201 && created.data.image_url, JSON.stringify(created.data));
  check('issue defaults to reported', created.data.status === 'reported');
  const issueId = created.data.id;

  const mine = await req('GET', '/issues/mine', { token: citizenToken });
  check('my issues lists report', mine.status === 200 && mine.data.some(i => i.id === issueId));

  const detail = await req('GET', `/issues/${issueId}`, { token: citizenToken });
  check('issue detail has reporter name', detail.data.reporter_name === 'Ravi Kumar');

  const statusUpd = await req('PUT', `/issues/${issueId}/status`, {
    token: authToken,
    body: { status: 'in_progress', priority: 'high', comment: 'Assigned to road team' },
  });
  check('authority updates status', statusUpd.status === 200 && statusUpd.data.status === 'in_progress');

  const citizenStatus = await req('PUT', `/issues/${issueId}/status`, {
    token: citizenToken, body: { status: 'resolved' },
  });
  check('citizen cannot update status', citizenStatus.status === 403);

  const resolved = await req('PUT', `/issues/${issueId}/status`, {
    token: authToken, body: { status: 'resolved', comment: 'Repaired' },
  });
  check('issue resolved', resolved.data.status === 'resolved' && resolved.data.resolved_at);

  await runBusinessTests(citizenToken, entToken);
  await runAdminTests(adminToken, citizenToken);
  await runValidationTests(citizenToken, adminToken, authToken);

  const { pass, fail } = results();
  console.log(`\n=== RESULTS: ${pass} passed, ${fail} failed ===\n`);
  process.exit(fail > 0 ? 1 : 0);
})().catch((err) => {
  console.error('TEST CRASH:', err);
  process.exit(1);
});

