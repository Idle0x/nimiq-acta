const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').find(l => l.startsWith('DATABASE_URL=')).split('=')[1].replace(/"/g, '');
const sql = neon(env);
sql.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`).then(console.log).catch(console.error);
