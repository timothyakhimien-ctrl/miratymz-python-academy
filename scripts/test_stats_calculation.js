const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const clean = line.replace('\r', '').trim();
  if (clean && !clean.startsWith('#') && clean.includes('=')) {
    const idx = clean.indexOf('=');
    env[clean.slice(0, idx).trim()] = clean.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});

const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function calc() {
  const { data: allRecords, error } = await client
    .from('registrations')
    .select('id, tracking_id, full_name, status, amount, category, institution, receipt_url, created_at');

  if (error) {
    console.error('Error:', error);
    return;
  }

  const active = allRecords.filter(r => r.status !== 'Archived');
  const archived = allRecords.filter(r => r.status === 'Archived');
  const approved = active.filter(r => r.status === 'Approved' || r.status === 'Added to VIP Group');
  const underReview = active.filter(r => r.status === 'Under Review');
  const pending = active.filter(r => r.status === 'Pending');
  const declined = active.filter(r => r.status === 'Declined');

  const totalRevenue = approved.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const potentialRevenue = underReview.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  console.log({
    totalInDb: allRecords.length,
    activeCount: active.length,
    archivedCount: archived.length,
    underReviewCount: underReview.length,
    pendingCount: pending.length,
    approvedCount: approved.length,
    declinedCount: declined.length,
    totalRevenue,
    potentialRevenue
  });
}

calc();
