
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

(async () => {
  try {
    const db = await open({
      filename: './chat.db',
      driver: sqlite3.Database
    });
    await db.run('DELETE FROM messages');
    await db.run('DELETE FROM users');
    console.log('Database cleared.');
  } catch (e) {
    console.error(e);
  }
})();
