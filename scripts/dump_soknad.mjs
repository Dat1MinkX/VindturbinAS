import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'databaser', 'database.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Could not open DB:', err);
    process.exit(1);
  }
});

db.all('SELECT rowid, * FROM "Soknad"', [], (err, rows) => {
  if (err) {
    console.error('Query error:', err);
    process.exit(1);
  }
  console.log('Soknad rows:');
  rows.forEach(r => console.log(JSON.stringify(r)));
  db.close();
});
