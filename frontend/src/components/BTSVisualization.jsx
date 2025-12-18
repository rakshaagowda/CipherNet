import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Key, FileText, ArrowDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as crypto from '../utils/encryption';

const BTSVisualization = ({ message, onClose, isSender }) => {
  const { user } = useAuth();

  // Decrypt the AES Key for display (if possible)
  const decryptedSessionKey = useMemo(() => {
    if (isSender) return "[Computed Locally]"; // Sender generated it, but we didn't store the raw key in msg object. 
    if (!user?.privateKey) return "[Missing Private Key]";
    try {
      const bytes = crypto.decryptAESKey(message.encryptedKey, user.privateKey);
      return crypto.bytesToHex(bytes);
    } catch (e) {
      return "[Decryption Error]";
    }
  }, [message, user, isSender]);

  const encryptionSteps = [
    {
      title: "1. Plaintext Input",
      icon: <FileText className="w-6 h-6 text-blue-400" />,
      desc: "The process begins with your raw message. Currently, this data is readable in your device's memory. We must transform it before it leaves your device.",
      detail: `Input: "${message.text}"`,
      tech: "Data Type: UTF-8 String (Plaintext)"
    },
    {
      title: "2. AES Session Key Generation",
      icon: <Key className="w-6 h-6 text-yellow-400" />,
      desc: "We generate a unique, one-time-use 256-bit AES Key. We use AES (Symmetric) because it is incredibly fast and efficient for encrypting long messages. RSA is too slow for large data.",
      detail: `AES Key (Hex): [${message.encryptedKey ? message.encryptedKey.substring(0, 32) + "..." : "GENERATED"}]\nIV: ${message.iv}`,
      tech: "Algorithm: AES-256-CBC (Symmetric)"
    },
    {
      title: "3. Payload Encryption (AES)",
      icon: <Lock className="w-6 h-6 text-red-500" />,
      desc: "The message is encrypted using the AES Key. This turns 'Hello' into random garbage (Ciphertext). Without the exact AES Key + IV, this data is mathematically impossible to crack.",
      detail: `Ciphertext: ${message.content}`,
      tech: "Transformation: Plaintext + Key + IV → Ciphertext"
    },
    {
      title: "4. Key Encapsulation (RSA - The Magic Step)",
      icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
      desc: "How do we send the AES Key to the recipient safely? We use THEIR Public RSA Key to encrypt the AES Key itself. This is 'Hybrid Encryption': Fast AES for the message, Secure RSA for the key.",
      detail: `Encrypted AES Key (RSA Block): ${message.encryptedKey}`,
      tech: "Mechanism: RSA-2048 (Asymmetric)"
    },
    {
      title: "5. Secure Transmission",
      icon: <ArrowDown className="w-6 h-6 text-purple-500" />,
      desc: "We bundle the AES-Encrypted Message + the RSA-Encrypted Key into a single packet. Even if a hacker intercepts this, they only see the Public Key lock, which they cannot open.",
      detail: "Packet Status: SENT via Socket.io (WSS)",
      tech: "Transport: TLS 1.3 + Application Layer Encryption"
    }
  ];

  const decryptionSteps = [
    {
      title: "1. Packet Reception",
      icon: <ArrowDown className="w-6 h-6 text-purple-500" />,
      desc: "The packet arrives. It contains two sealed boxes: 1) The Message (Locked with AES) and 2) The AES Key (Locked with your RSA Public Key).",
      detail: `Received Payload Size: ~${(message.content?.length || 0) + (message.encryptedKey?.length || 0)} bytes`,
      tech: "Status: Encrypted Buffer Received"
    },
    {
      title: "2. Key Decryption (RSA - Private Key)",
      icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
      desc: "This is the critical moment. Your device uses its PRIVATE RSA KEY (stored only on this device) to unlock the 'Encrypted AES Key'. This reveals the Session Key.",
      detail: `Recovered AES Key: ${decryptedSessionKey}`,
      tech: "Mechanism: RSA Decryption (Private Key)"
    },
    {
      title: "3. Session Reconstruction",
      icon: <Key className="w-6 h-6 text-yellow-400" />,
      desc: "Now that we have the Session Key, we combine it with the Initialization Vector (IV) to prepare the AES Decryption Engine.",
      detail: `IV: ${message.iv}`,
      tech: "Action: Rebuilding Crypto Implementation"
    },
    {
      title: "4. Payload Decryption (AES)",
      icon: <Lock className="w-6 h-6 text-red-500" />,
      desc: "The engine runs in reverse. It takes the scrambled 'Ciphertext' and applies the AES Key to transform it back into the original text.",
      detail: `Decryption Status: Verified`,
      tech: "Transformation: Ciphertext + Key + IV → Plaintext"
    },
    {
      title: "5. Message Visualization",
      icon: <FileText className="w-6 h-6 text-blue-400" />,
      desc: "The mathematics are complete. The original UTF-8 string is reconstructed and displayed to you.",
      detail: `Output: "${message.text}"`,
      tech: "Final State: UTF-8 String"
    }
  ];

  const steps = isSender ? encryptionSteps : decryptionSteps;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-surface border border-brand-red/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-6 h-6 text-gray-400 hover:text-white" />
        </button>

        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-brand-red/5 to-transparent">
          <div className="flex items-center gap-6 mb-2">
            <div className="w-20 h-20 rounded-2xl bg-brand-red/20 flex items-center justify-center border border-brand-red/30 shadow-[0_0_30px_rgba(255,0,51,0.2)]">
              <Lock className="w-10 h-10 text-brand-red" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-4xl font-bold text-white tracking-tight">
                  {isSender ? "Encryption Process" : "Decryption Process"}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs border ${isSender ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' : 'border-blue-500/30 text-blue-400 bg-blue-500/10'}`}>
                  {isSender ? "OUTGOING" : "INCOMING"}
                </span>
              </div>
              <p className="text-gray-400 text-lg">
                {isSender ? "Securing data before transmission" : "Recovering data after reception"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="relative pl-8 pb-8 border-l border-white/10 last:border-0 last:pb-0">
              {/* Timeline dot */}
              <div className="absolute left-[-20px] top-0 w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center shadow-lg group-hover:border-brand-red transition-colors">
                {step.icon}
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-background/50 border border-white/5 p-6 rounded-2xl hover:border-brand-red/30 transition-colors relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
                    {step.title}
                    {step.tech && <span className="text-[10px] uppercase tracking-wider text-gray-500 border border-white/10 px-2 py-1 rounded">{step.tech}</span>}
                  </h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">{step.desc}</p>
                  <div className="bg-black/80 p-4 rounded-xl font-mono text-xs text-brand-red break-all border border-brand-red/10 shadow-inner">
                    <span className="text-gray-500 select-none">$ </span>{step.detail}
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        <div className="p-8 border-t border-white/5 bg-surface/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Security Level: Maximum</p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs rounded-full border border-green-500/20">RSA-2048</span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full border border-blue-500/20">AES-CBC-256</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BTSVisualization;
