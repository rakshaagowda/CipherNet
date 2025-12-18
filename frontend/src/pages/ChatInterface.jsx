import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import NavBar from '../components/NavBar';
import BTSVisualization from '../components/BTSVisualization';
import Diagnostics from '../components/Diagnostics';
import * as crypto from '../utils/encryption';
import { Send, Eye, Lock, ArrowLeft, MoreVertical, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInterface = () => {
  const { username } = useParams(); // Partner's username
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]); // { id, text, senderId, ...raw }
  const [inputText, setInputText] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null); // For BTS
  const messagesEndRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);

  // 1. Fetch Partner Details (ID + Public Key)
  useEffect(() => {
    const fetchPartner = async () => {
      try {
        // Fetch all users to find the partner's ID (since key endpoint doesn't return ID)
        const res = await fetch('http://localhost:3000/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await res.json();
        console.log("Debugging: Users fetched:", users);
        console.log("Debugging: Looking for:", username);

        const foundPartner = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (foundPartner) {
          console.log("Debugging: Partner found:", foundPartner);
          setPartner(foundPartner); // Contains id, username, publicKey
        } else {
          console.error("Partner not found in user list. Available:", users.map(u => u.username));
        }
      } catch (err) {
        console.error("Partner fetch failed", err);
      }
    };
    fetchPartner();
  }, [username, token]);

  // 2. Fetch History & Listen for Messages
  useEffect(() => {
    if (!socket || !partner) return;

    // Load Sent Messages Cache
    const getLocalSentMsg = (iv) => {
      try {
        const cache = JSON.parse(localStorage.getItem('sent_messages_cache') || '{}');
        return cache[iv];
      } catch { return null; }
    };

    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:3000/messages/${partner.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const history = await res.json();

        // Process history
        const processed = history.map(msg => {
          let text = "🔒 Encrypted Content";

          if (msg.receiverId === user.userId) {
            // Incoming: Decrypt it
            if (!user.privateKey) {
              text = "❌ Decryption Impossible: Private Key Lost on Logout (Demo Limit)";
            } else {
              try {
                const aesKey = crypto.decryptAESKey(msg.encryptedKey, user.privateKey);
                text = crypto.decryptMessage(msg.content, aesKey, msg.iv);
              } catch (e) {
                console.error("Failed to decrypt history msg", e);
                text = "⚠️ Decryption Failed";
              }
            }
          } else {
            // Outgoing: Check local cache
            const cachedText = getLocalSentMsg(msg.iv);
            if (cachedText) {
              text = cachedText;
            } else {
              text = "🔐 You sent this (Key not saved)";
            }
          }
          return { ...msg, text, isMine: msg.senderId === user.userId };
        });

        setMessages(processed);
      } catch (e) {
        console.error("Fetch history failed", e);
      }
    };

    fetchHistory();

    const handleReceive = (data) => {
      console.log("Debugging: Socket Received:", data);
      console.log("Debugging: Checking against:", {
        partnerId: partner.id,
        userId: user.userId,
        dataSender: data.senderId,
        dataReceiver: data.receiverId
      });

      // Loose comparison (==) to handle string/number ID differences often found in JS/SQLite
      if (data.senderId == partner.id || data.receiverId == partner.id) {
        let decryptedText = "Encrypted Message";
        try {
          if (data.receiverId == user.userId) {
            if (!user.privateKey) {
              decryptedText = "❌ Decryption Impossible: Keys Lost";
            } else {
              const aesKey = crypto.decryptAESKey(data.encryptedKey, user.privateKey);
              decryptedText = crypto.decryptMessage(data.content, aesKey, data.iv);
            }
          } else {
            // For self-echo (if any), assume we have it or use what was sent
            decryptedText = data.localDecrypted || "You sent this";
          }
        } catch (e) { console.error("Decryption err", e); }

        setMessages(prev => [...prev, { ...data, text: decryptedText }]);
      } else {
        console.warn("Debugging: Ignored message", data);
      }
    };

    socket.on('receive_message', handleReceive);
    return () => socket.off('receive_message', handleReceive);
  }, [socket, user, partner, token]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!partner) {
      alert("Error: Partner not found. Please wait for the connection to establish or try refreshing.");
      return;
    }

    try {
      // 0. FETCH FRESH KEY (Crucial fix for re-registrations)
      const keyRes = await fetch(`http://localhost:3000/users/${username}/key`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!keyRes.ok) throw new Error("Partner key fetch failed");
      const keyData = await keyRes.json();
      const currentPublicKey = keyData.publicKey;

      // 1. Generate Session Key
      const aesKey = crypto.generateAESKey();
      const iv = crypto.generateIV();

      // 2. Encrypt Content
      const cipherText = crypto.encryptMessage(inputText, aesKey, iv);

      // 3. Encrypt AES Key for Recipient
      console.log("Debugging: Encrypting with FRESH Key:", currentPublicKey);
      if (!currentPublicKey || !currentPublicKey.includes("BEGIN PUBLIC KEY")) {
        throw new Error("Invalid Public Key format from server");
      }
      const encryptedKey = crypto.encryptAESKey(aesKey, currentPublicKey);

      // 4. Construct Payload
      const payload = {
        senderId: user.userId,
        receiverId: partner.id,
        content: cipherText,
        iv: crypto.bytesToHex(iv),
        encryptedKey: encryptedKey,
        timestamp: new Date().toISOString()
      };

      // 5. Send via Socket
      socket.emit('send_message', payload);

      // SAVE to Local Cache for History restoration
      // (Since we can't decrypt our own RSA-for-recipient messages)
      try {
        const cache = JSON.parse(localStorage.getItem('sent_messages_cache') || '{}');
        cache[crypto.bytesToHex(iv)] = inputText;
        localStorage.setItem('sent_messages_cache', JSON.stringify(cache));
      } catch (e) {
        console.error("Cache save failed", e);
      }

      // Optimistic Update
      setMessages(prev => [...prev, { ...payload, text: inputText, isMine: true, localDecrypted: inputText }]);
      setInputText('');

    } catch (err) {
      console.error("Send failed", err);
      alert("Failed to send message: " + err.message);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AnimatePresence>
        {selectedMessage && (
          <BTSVisualization
            message={selectedMessage}
            isSender={selectedMessage.isMine || selectedMessage.senderId === user.userId}
            onClose={() => setSelectedMessage(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative h-full">
        {/* Chat Header */}
        <header className="h-20 border-b border-white/5 bg-surface/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-red to-purple-800 flex items-center justify-center text-sm font-bold">
                {username[0].toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-lg">{username}</h2>
                <div className="flex items-center gap-1.5 opacity-50 text-xs">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Encrypted Connection Active
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedMessage({ isMine: true, text: "Demo Encryption", senderId: user.userId, iv: "demo", encryptedKey: "demo", content: "demo" })}
                className="px-3 py-1.5 rounded-lg bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold hover:bg-brand-red/20 transition-colors"
              >
                BTS View
              </button>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-12 w-48 bg-surface border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setMessages([]);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> Clear Chat History
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, idx) => {
            const isMine = msg.isMine || msg.senderId === user.userId;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] group relative ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`p-4 rounded-2xl relative overflow-hidden backdrop-blur-sm transition-all border border-transparent group
                      ${isMine
                        ? 'bg-brand-red text-white rounded-br-none shadow-[0_0_15px_rgba(255,0,51,0.3)]'
                        : 'bg-surface border-white/10 rounded-bl-none hover:bg-white/5'
                      }`}
                  >
                    <div className="flex flex-col gap-2">
                      <p className="text-sm select-text leading-relaxed cursor-text">{msg.text}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMessage(msg);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl mt-1 transition-colors border
                            ${isMine
                            ? 'bg-black/20 hover:bg-black/40 border-white/10'
                            : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-brand-red/30'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className={`w-3 h-3 ${isMine ? 'text-white/70' : 'text-brand-red'}`} />
                          <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">
                            Analyze Security
                          </span>
                        </div>
                        <ArrowLeft className="w-3 h-3 rotate-180 opacity-50" />
                      </button>
                      <div className="flex justify-end opacity-50 px-1">
                        <span className="text-[9px] font-mono">
                          {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-surface/30 backdrop-blur-xl border-t border-white/5">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a secured message..."
              className="w-full bg-background/50 border border-white/10 rounded-2xl px-6 py-4 pr-14 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all text-sm placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-2 p-2 bg-brand-red rounded-xl text-white hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send Message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        <Diagnostics />
      </div>
    </div>
  );
};

export default ChatInterface;
