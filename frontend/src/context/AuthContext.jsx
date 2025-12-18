import React, { createContext, useContext, useState, useEffect } from 'react';
import * as crypto from '../utils/encryption';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, username, publicKey, privateKey }
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Check local storage for persistent login
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, [token]);

  // Helper: Find key case-insensitively
  const getStoredPrivateKey = (username) => {
    if (!username) return null;

    // 1. Exact Match
    const exact = localStorage.getItem(`priv_${username}`);
    if (exact) return exact;

    // 2. Case-Insensitive Scan
    const target = `priv_${username.toLowerCase()}`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const lowerKey = key.toLowerCase();

      // Exact case-insensitive match
      if (lowerKey === target) {
        console.log(`Debug: Found key match '${key}' for user '${username}'`);
        return localStorage.getItem(key);
      }

      // 3. Partial / Truncated Match (Fallback)
      // If the stored key is "priv_maxverstapp" and we look for "priv_maxverstappen" (or vice versa)
      if (key.startsWith('priv_')) {
        // Check if one contains the other (e.g. truncation)
        if (target.startsWith(lowerKey) || lowerKey.startsWith(target)) {
          console.log(`Debug: Found partial fuzzy key match '${key}' for user '${username}' (Truncated?)`);
          return localStorage.getItem(key);
        }
      }
    }
    return null;
  };

  const login = async (username, password) => {
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Robust Key Retrieval
      let privateKey = getStoredPrivateKey(data.username);

      if (!privateKey) {
        console.warn("No private key found for this user on this device. Decryption will fail for old messages.");
      } else {
        console.log("Debug: Private Key successfully recovered from storage.");
      }

      const userData = { ...data, privateKey };
      setUser(userData);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      throw err;
    }
  };

  const register = async (username, password) => {
    try {
      // 1. Generate Keys
      const keys = await crypto.generateKeyPair();
      console.log("Debugging: Generated Keys for Registration:", keys);

      if (!keys.publicKey || !keys.publicKey.includes("BEGIN PUBLIC KEY")) {
        throw new Error("Key generation failed to produce valid PEM");
      }

      // 2. Register with Public Key
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, publicKey: keys.publicKey })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 3. Store Private Key Locally
      localStorage.setItem(`priv_${username}`, keys.privateKey);

      const userData = { ...data, privateKey: keys.privateKey, publicKey: keys.publicKey };
      setUser(userData);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
