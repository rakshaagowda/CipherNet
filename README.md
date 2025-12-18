# 🔐 CipherNet — Secure Chat Application Using RSA & AES

<p align="center">
  <img src="https://img.shields.io/badge/Encryption-AES--256%20%7C%20RSA--2048-red?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Frontend-React%20%7C%20Vite-black?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Socket.io-darkred?style=for-the-badge"/>
</p>

<p align="center">
  <b>End-to-End Encrypted Real-Time Chat Application</b><br/>
  <i>Hybrid Cryptography • Modern UI • Educational BTS Visualization</i>
</p>

---

## 📌 Objective
To design and develop a **secure real-time chat application** that ensures **end-to-end encrypted communication** using **hybrid cryptography**, combining:

- 🔑 **RSA** for secure key exchange  
- 🔒 **AES** for fast and efficient message encryption  

---

## 👥 Team Members
| Name | Role |
|------|------|
| **Raksha B R** | Developer |
| **Rashmi R Pai** | Developer |
| **Smitha M Dodmane** | Developer |

---

## 📄 Abstract
With the rapid growth of digital communication, ensuring confidentiality and integrity of messages has become critical. **CipherNet** implements a **hybrid cryptographic model** combining **AES (Advanced Encryption Standard)** and **RSA (Rivest–Shamir–Adleman)** to provide strong end-to-end security.

Each message is encrypted using a **unique AES session key**, and this key is encrypted using the **receiver’s RSA public key**. This approach combines the **speed of AES** with the **secure key exchange of RSA**, ensuring protection against eavesdropping, replay attacks, and man-in-the-middle (MITM) attacks.

---

## 🧠 System Architecture
![Architecture](assets/architecture.svg)

```mermaid
flowchart LR
    A[Sender] -->|Plain Message| B[AES Encryption]
    B -->|Encrypted Message| C[RSA Encrypt AES Key]
    C -->|Encrypted Payload| D[Server]
    D -->|Forward Payload| E[Receiver]
    E -->|RSA Decrypt AES Key| F[AES Decryption]
    F -->|Plain Message| G[Chat Interface]
```




## ⚙️ Tech Stack

| Layer | Technologies |
|------|-------------|
| 🖥️ **Frontend** | [![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev) <br/> [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev) <br/> [![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com) |
| ⚙️ **Backend** | [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org) <br/> [![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com) <br/> [![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io) |
| 🗄️ **Database** | [![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/index.html) |
| 🔐 **Cryptography** | [![RSA](https://img.shields.io/badge/RSA-Encryption-red?style=for-the-badge)](https://en.wikipedia.org/wiki/RSA_(cryptosystem)) <br/> [![AES](https://img.shields.io/badge/AES--256-Encryption-darkred?style=for-the-badge)](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) <br/> [![node-forge](https://img.shields.io/badge/node--forge-Crypto-orange?style=for-the-badge)](https://github.com/digitalbazaar/forge) |



🚀 Getting Started
Prerequisites

Node.js (v16+)

Git

Installation & Run
# Backend
cd server
npm install
node index.js
# Frontend
cd frontend
npm install
npm run dev
Open:http://localhost:5173


