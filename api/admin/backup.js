// GET /api/admin/backup?format=json            → 전체 데이터 JSON 백업
// GET /api/admin/backup?format=csv&table=products → 표 하나를 CSV로 백업
const db = require('../_lib/db');

// 이름에 이 단어가 들어간 필드는 값과 상관없이 백업에서 뺍니다.
const SENSITIVE_KEY =
  /(password|passwd|pwd|secret|token|api[_-]?key|private[_-]?key|credential|card|cvc|cvv|account[_-]?number|ssn)/i;

const CSV_TABLES = ['products', 'curriculum', 'pages', 'admins'];

function sanitize(value, path, excluded) {
  if (Array.isArray(value)) return value.map((v, i) => sanitize(v, `${path}[${i}]`, excluded));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      const keyPath = path ? `${path}.${key}` : key;
      if (SENSITIVE_KEY.test(key)) {
        excluded.add(keyPath.replace(/\[\d+\]/g, '[]'));
        continue;
      }
      out[key] = sanitize(v, keyPath, excluded);
    }
    return out;
  }
  return value;
}

function csvCell(v) {
  if (v == null) return '';
  const s = Array.isArray(v) ? v.join(' | ') : typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows) {
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  return [cols.join(','), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))].join('\r\n');
}

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'GET만 지원합니다.' });
  }

  const format = String(req.query.format || 'json').toLowerCase();
  const excluded = new Set();
  const data = sanitize(db, '', excluded);
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10);

  if (format === 'json') {
    const backup = {
      meta: {
        site: db.site.name,
        createdAt: now.toISOString(),
        format: 'json',
        tables: Object.keys(data),
        excludedFields: [...excluded],
        note: '비밀번호·API 키·결제 비밀값 등 민감정보는 백업에서 제외되었습니다.'
      },
      data
    };
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="brand-reason-backup-${stamp}.json"`);
    return res.status(200).send(JSON.stringify(backup, null, 2));
  }

  if (format === 'csv') {
    const table = String(req.query.table || 'products');
    if (!CSV_TABLES.includes(table)) {
      return res.status(400).json({ error: `table은 ${CSV_TABLES.join(', ')} 중 하나여야 합니다.` });
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="brand-reason-${table}-${stamp}.csv"`);
    return res.status(200).send('﻿' + toCsv(data[table])); // BOM: 엑셀에서 한글 깨짐 방지
  }

  return res.status(400).json({ error: 'format은 json 또는 csv여야 합니다.' });
};

module.exports.sanitize = sanitize;
module.exports.toCsv = toCsv;
