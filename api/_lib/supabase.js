// Supabase(Postgres) 연결: 상품·멤버십·커리큘럼·페이지 표를 읽습니다.
// publishable 키는 공개용 키입니다. 표마다 RLS가 켜져 있어 읽기만 되고 쓰기는 막혀 있습니다.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://okbkxulmoychqpoyqbkc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_muqYGi2tKZ6t9FpHS1by3w_skQm8wop';

const TABLES = {
  products: 'select=id,plan,name,summary,price,currency,status,items&order=id',
  memberships: 'select=id,name,billing,price,currency,reviewsPerMonth:reviews_per_month,status,benefits&order=sort',
  curriculum: 'select=step,title,output&order=step',
  pages: 'select=path,title,sections&order=path'
};

async function fetchTable(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${TABLES[table]}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  if (!res.ok) throw new Error(`${table}: HTTP ${res.status}`);
  return res.json();
}

// Supabase에서 표를 모두 읽어 옵니다. 실패하면 null을 돌려주고 호출한 쪽이 로컬 데이터로 대신합니다.
async function loadFromSupabase() {
  try {
    const names = Object.keys(TABLES);
    const rows = await Promise.all(names.map(fetchTable));
    return Object.fromEntries(names.map((n, i) => [n, rows[i]]));
  } catch (err) {
    console.error('[supabase] load failed:', err.message);
    return null;
  }
}

module.exports = { loadFromSupabase, SUPABASE_URL };
