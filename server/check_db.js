
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

(async () => {
  try {
    const db = await open({
      filename: './chat.db',
      driver: sqlite3.Database
    });
    const users = await db.all('SELECT * FROM users');
    console.log('Users:', users);

    const messages = await db.all('SELECT * FROM messages');
    console.log('Messages:', messages.length);
  } catch (e) {
    console.error(e);
  }
})();
