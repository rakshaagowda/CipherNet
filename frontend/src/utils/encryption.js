import forge from 'node-forge';

// --- RSA Utilities ---

export const generateKeyPair = async () => {
  return new Promise((resolve, reject) => {
    forge.pki.rsa.generateKeyPair({ bits: 2048, workers: 2 }, (err, keypair) => {
      if (err) return reject(err);
      const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
      const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
      resolve({ publicKey, privateKey });
    });
  });
};

// --- AES Utilities ---

export const generateAESKey = () => {
  return forge.random.getBytesSync(16); // 128-bit key
};

export const generateIV = () => {
  return forge.random.getBytesSync(16);
};

// --- Encryption Flow ---

// 1. Encrypt Message with AES
export const encryptMessage = (text, aesKey, iv) => {
  const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
  cipher.start({ iv: iv });
  cipher.update(forge.util.createBuffer(text));
  cipher.finish();
  return cipher.output.toHex();
};

// 2. Decrypt Message with AES
// 2. Decrypt Message with AES
export const decryptMessage = (cipherHex, aesKey, iv) => {
  const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
  // IV comes in as Hex from JSON, must convert to bytes for Forge
  const ivBytes = forge.util.hexToBytes(iv);
  decipher.start({ iv: ivBytes });
  decipher.update(forge.util.createBuffer(forge.util.hexToBytes(cipherHex)));
  const success = decipher.finish();
  if (success) {
    return decipher.output.toString();
  }
  return 'Decryption Failed';
};

// 3. Encrypt AES Key with Receiver's Public RSA Key
export const encryptAESKey = (aesKey, publicKeyPem) => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  // OAEP usually recommended, using PKCS#1v1.5 for compatibility/simplicity in demo if preferred
  // but OAEP is safer. detailed comments in BTS will explain.
  const encrypted = publicKey.encrypt(aesKey, 'RSA-OAEP');
  return forge.util.bytesToHex(encrypted);
};

// 4. Decrypt AES Key with Receiver's Private RSA Key
export const decryptAESKey = (encryptedAESKeyHex, privateKeyPem) => {
  try {
    console.log("Debugging: Decrypting AES Key...");
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const encryptedBytes = forge.util.hexToBytes(encryptedAESKeyHex);
    // RSA-OAEP with SHA1 is default in node-forge if not specified, usually matches defaults.
    // Ensure this matches the encrypt call: publicKey.encrypt(aesKey, 'RSA-OAEP')
    const decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP');
    return decrypted;
  } catch (e) {
    console.error("CRITICAL DECRYPTION FAILURE in utils/encryption.js:", e);
    // Don't log full private key in prod, but for this debug:
    console.log("Debug: Key being used starts with:", privateKeyPem ? privateKeyPem.substring(0, 50) : "NULL");
    throw e;
  }
};

// Helpers for UI Visualization
export const bytesToHex = (bytes) => forge.util.bytesToHex(bytes);
export const hexToBytes = (hex) => forge.util.hexToBytes(hex);
