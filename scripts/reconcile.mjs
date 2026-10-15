// Proves the Stock -> Accounting integration after a demo reset:
//   value of stock (sum of stock_movements x product.cost)  ==  balance of GL account 1300
//
//   STOCK_DATABASE_URL=... ACCOUNTING_DATABASE_URL=... node scripts/reconcile.mjs
//
// Matches exactly only when PO unit costs equal product.cost, which is true for the demo
// seed. Visitors may enter other prices, so run it right after a reset, not at random times.
import pg from "pg";

async function scalar(url, sql) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    return (await client.query(sql)).rows[0].v;
  } finally {
    await client.end();
  }
}

const stockUrl = process.env.STOCK_DATABASE_URL;
const accountingUrl = process.env.ACCOUNTING_DATABASE_URL;
if (!stockUrl || !accountingUrl) {
  console.error("Set STOCK_DATABASE_URL and ACCOUNTING_DATABASE_URL");
  process.exit(2);
}

const stockValue = await scalar(stockUrl, `
  SELECT COALESCE(SUM(m."quantity"::bigint * p."cost"), 0)::text AS v
  FROM "stock_movements" m JOIN "products" p ON p."id" = m."productId"`);

// Posted entries count, and so do REVERSED ones: a reversal is a separate POSTED entry
// with the opposite lines, so the pair nets to zero.
const gl1300 = await scalar(accountingUrl, `
  SELECT COALESCE(SUM(l."debit" - l."credit"), 0)::text AS v
  FROM "journal_lines" l
  JOIN "journal_entries" e ON e."id" = l."entryId"
  JOIN "accounts" a ON a."id" = l."accountId"
  WHERE a."code" = '1300' AND e."status" <> 'DRAFT'`);

const thb = (satang) => (Number(satang) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });
console.log(`Stock value : ${thb(stockValue)} THB (${stockValue} satang)`);
console.log(`GL 1300     : ${thb(gl1300)} THB (${gl1300} satang)`);
if (stockValue !== gl1300) {
  console.error("MISMATCH: inventory in Stock and GL account 1300 differ");
  process.exit(1);
}
console.log("Reconciled: Stock and Accounting agree.");
