# Secure Chat Application Using RSA and AES

## 📋 Objective
To design and develop a secure chat application that ensures end-to-end encrypted communication by using hybrid cryptography combining **RSA** for key exchange and **AES** for data encryption.

## 👥 Team Members
| Name | Role |
|------|------|
| **Raksha B R** | Team Member |
| **Rashmi R Pai** | Team Member |
| **Smitha M Dodmane** | Team Member |

## 📄 Abstract
In today’s digital environment, secure communication has become essential due to the increasing risks of data breaches, eavesdropping, and unauthorized access. This project proposes a **Secure Chat Application** that ensures end-to-end confidentiality and integrity of messages using a hybrid cryptographic model combining **AES (Advanced Encryption Standard)** and **RSA (Rivest–Shamir–Adleman)** algorithms.

- **AES**: A symmetric-key cipher, providing fast and efficient encryption for message content.
- **RSA**: An asymmetric-key algorithm, securely encrypting and exchanging the AES session keys.

This hybrid approach leverages the speed of AES and the strong key distribution security of RSA to create a robust communication system.

The application enables users to:
1. Generate public–private key pairs.
2. Exchange public keys.
3. Perform encrypted messaging over a network.

Each message is encrypted with a freshly generated AES key, which is subsequently encrypted using the receiver’s RSA public key to ensure secure key transmission. This design ensures that even if network packets are intercepted, the attacker cannot retrieve the plaintext message or the session key. Additionally, message integrity and authentication mechanisms are implemented to prevent tampering and impersonation.

The project demonstrates the practical implementation of modern cryptographic techniques in real-time communication systems. It highlights secure key management, encrypted data transmission, and protection against common attacks such as man-in-the-middle (MITM), replay attacks, and eavesdropping.

## 🛠️ Technology Stack
- **Frontend**: React, Vite, Tailwind CSS (Dark Red/Black Theme), Framer Motion
- **Backend**: Node.js, Express, Socket.io, SQLite
- **Cryptography**: `node-forge` (RSA & AES implementation)

## 🚀 Getting Started

### Prerequisites
- Node.js installed

### Installation & Run

1. **Start Backend Server**
   ```bash
   cd server
   npm install
   node index.js
   ```

2. **Start Frontend Client**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access Application**
   Open `http://localhost:5173` in your browser. Open a second window in Incognito mode to simulate a second user.

## ✨ Features
- **End-to-End Encryption**: Hybrid AES-256 + RSA-2048.
- **Behind-The-Scenes Visualization**: Interactive modal showing the encryption steps for education/demo purposes.
- **Real-Time Messaging**: Instant delivery via Socket.io.
- **Modern UI**: "Hacker/Cyber" aesthetic with neon glows and glassmorphism.
