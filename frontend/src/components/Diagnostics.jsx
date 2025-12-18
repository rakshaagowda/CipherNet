
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as crypto from '../utils/encryption';
import { ShieldAlert, CheckCircle, XCircle, Database } from 'lucide-react';

const Diagnostics = () => {
  const { user } = useAuth();
  const [report, setReport] = useState([]);

  const runTest = async () => {
    const logs = [];
    const log = (msg, status = 'info') => logs.push({ msg, status });

    log("Starting Diagnostics...", 'info');

    if (!user) {
      log("No User Logged In", 'error');
      setReport(logs);
      return;
    }

    log(`User: ${user.username} (ID: ${user.userId})`, 'info');

    // 1. Check Keys Existence
    if (!user.publicKey) log("Missing Public Key in State", 'error');
    else log("Public Key Present", 'success');

    if (!user.privateKey) {
      log("Missing Private Key in State", 'error');
      // Deep Dive into LocalStorage
      log("--- LocalStorage Scan ---", 'info');
      let foundKeys = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('priv_')) {
          log(`Found Key: ${key}`, 'info');
          foundKeys++;
        }
      }
      if (foundKeys === 0) log("NO Private Keys found in Browser Storage", 'error');
    }
    else log("Private Key Present", 'success');

    // 2. Crypto Test
    try {
      if (user.publicKey && user.privateKey) {
        const testMsg = "CryptoTest_" + Date.now();
        const aesKey = crypto.generateAESKey();
        const iv = crypto.generateIV();

        log("Generated AES Key & IV", 'info');

        // Encrypt with OWN Public Key
        const encKey = crypto.encryptAESKey(aesKey, user.publicKey);
        log("Encrypted AES Key with RSA Public Key", 'success');

        // Decrypt with OWN Private Key
        const decKey = crypto.decryptAESKey(encKey, user.privateKey);

        // Helper to compare
        const toHex = (b) => crypto.bytesToHex(b);

        if (toHex(aesKey) === toHex(decKey)) {
          log("RSA Key Pair Valid! (Encryption -> Decryption success)", 'success');
        } else {
          log("RSA Key Pair MISMATCH! (Decrypted key does not match original)", 'error');
        }

      }
    } catch (e) {
      log("Crypto Test Failed Exception: " + e.message, 'error');
    }

    setReport(logs);
  };

  return (
    <div className="p-4 bg-black/90 text-white font-mono text-sm border-t border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-brand-red" />
          System Diagnostics
        </h3>
        <button
          onClick={runTest}
          className="px-3 py-1 bg-brand-red rounded hover:bg-red-700 transition"
        >
          Run Test
        </button>
      </div>
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {report.map((r, i) => (
          <div key={i} className={`flex items-center gap-2 ${r.status === 'error' ? 'text-red-500' :
              r.status === 'success' ? 'text-green-400' : 'text-gray-400'
            }`}>
            {r.status === 'error' ? <XCircle className="w-3 h-3" /> :
              r.status === 'success' ? <CheckCircle className="w-3 h-3" /> :
                <div className="w-3 h-3" />}
            {r.msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Diagnostics;
