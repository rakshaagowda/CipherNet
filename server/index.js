import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB, getDB } from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow all for dev
    methods: ["GET", "POST"]
  }
});


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Secure Chat Backend is Running. Please visit port 5173 for the Frontend.');
});

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key-123';

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

async function startServer() {
  await initDB();
  const db = getDB();

  // Auth Routes
  app.post('/auth/register', async (req, res) => {
    const { username, password, publicKey } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.run(
        'INSERT INTO users (username, password_hash, public_key, status) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, publicKey, 'Online']
      );
      const token = jwt.sign({ id: result.lastID, username }, SECRET_KEY);
      res.json({ token, userId: result.lastID, username });
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update status
    await db.run("UPDATE users SET status = 'Online' WHERE id = ?", [user.id]);

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
    res.json({
      token,
      userId: user.id,
      username: user.username,
      publicKey: user.public_key
    });
  });

  // User Routes
  app.get('/users', authenticateToken, async (req, res) => {
    const users = await db.all('SELECT id, username, public_key AS publicKey, status FROM users WHERE id != ?', [req.user.id]);
    res.json(users);
  });

  app.get('/users/:username/key', authenticateToken, async (req, res) => {
    const user = await db.get('SELECT public_key FROM users WHERE username = ?', [req.params.username]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ publicKey: user.public_key });
  });

  // Get History
  app.get('/messages/:otherUserId', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const otherId = req.params.otherUserId;

    try {
      const messages = await db.all(
        `SELECT * FROM messages 
         WHERE (sender_id = ? AND receiver_id = ?) 
            OR (sender_id = ? AND receiver_id = ?) 
         ORDER BY timestamp ASC`,
        [userId, otherId, otherId, userId]
      );

      // Transform keys to match frontend expectation (camelCase)
      const formatted = messages.map(m => ({
        id: m.id,
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        content: m.content,
        iv: m.iv,
        encryptedKey: m.encrypted_key,
        timestamp: m.timestamp
      }));

      res.json(formatted);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Socket.io Logic
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', async (userId) => {
      socket.userId = userId;
      await db.run("UPDATE users SET status = 'Online' WHERE id = ?", [userId]);
      io.emit('user_status_change', { userId, status: 'Online' });
    });

    socket.on('send_message', async (data) => {
      // data = { senderId, receiverId, content (cipher), iv, encryptedKey }
      // Store in DB
      try {
        const { senderId, receiverId, content, iv, encryptedKey } = data;
        await db.run(
          `INSERT INTO messages (sender_id, receiver_id, content, iv, encrypted_key) VALUES (?, ?, ?, ?, ?)`,
          [senderId, receiverId, content, iv, encryptedKey]
        );

        // Forward to receiver (simple broadcast for now, ideally targeted)
        io.emit('receive_message', data);
      } catch (e) {
        console.error("Msg Error", e);
      }
    });

    socket.on('disconnect', async () => {
      if (socket.userId) {
        await db.run("UPDATE users SET status = 'Offline' WHERE id = ?", [socket.userId]);
        io.emit('user_status_change', { userId: socket.userId, status: 'Offline' });
      }
      console.log('User disconnected');
    });
  });

  const PORT = 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
