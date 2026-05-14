const Database = require('better-sqlite3');
const db = new Database(':memory:');
db.prepare('CREATE TABLE test (id INTEGER)').run();
db.prepare('BEGIN').run();
try {
  db.prepare('BEGIN').run();
  console.log("Nested begin successful");
} catch(e) {
  console.log("Nested begin failed:", e.message);
}
