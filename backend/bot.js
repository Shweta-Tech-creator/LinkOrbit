type="module"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, collectionGroup, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD9ebL8xEeGjHOHxBsUtRY1IL65qm30zD4",
  authDomain: "social-f6c78.firebaseapp.com",
  projectId: "social-f6c78",
  storageBucket: "social-f6c78.appspot.com",
  messagingSenderId: "959340204769",
  appId: "1:959340204769:web:0e049a80321ea701a15da0",
  measurementId: "G-GCWJMNGPGN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Risk Keywords
const riskKeywords = {
  negative: ["hate", "awful", "bad", "worst", "terrible", "stupid", "angry", "disgusting"],
  report: ["report", "spam", "block", "remove", "ban", "flag"],
  controversial: ["fake", "scam", "violence", "boycott", "politics", "crime", "abuse", "threat"]
};

const alertQueue = [];
const seenDocPaths = new Set(); // prevent duplicate alerts between initial load and realtime
const allowedPlatforms = new Set(["facebook", "instagram", "linkedin"]);
let monitoringActive = false; // controls whether alerts are shown immediately

function normalizePlatformFromPath(path, fallback) {
  try {
    const seg0 = (path || "").split("/")[0]?.toLowerCase();
    if (allowedPlatforms.has(seg0)) return seg0;
  } catch { }
  const lower = (fallback || "").toLowerCase();
  if (allowedPlatforms.has(lower)) return lower;
  return ""; // return empty when unknown so UI won't show 'comments'
}

// Binary Search
function binarySearch(arr, word) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === word) return true;
    else if (arr[mid] < word) low = mid + 1;
    else high = mid - 1;
  }
  return false;
}

// Normalize text content from various possible shapes
function normalizeText(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(v => (typeof v === "string" ? v : "")).join(" ");
  if (value && typeof value === "object") {
    if (typeof value.text === "string") return value.text;
    const strings = Object.values(value).filter(v => typeof v === "string");
    if (strings.length) return strings.join(" ");
    try { return JSON.stringify(value); } catch { return ""; }
  }
  if (value == null) return "";
  try { return String(value); } catch { return ""; }
}

// Analyze Text
function analyzeText(data, source) {
  const contentRaw = data.comment || data.comments || data.text || data.caption || data.captions || "";
  const content = normalizeText(contentRaw);
  if (!content || (typeof content === "string" && !content.trim())) return;
  const platformLabel = allowedPlatforms.has((source || "").toLowerCase()) ? source : (source || "");
  console.log(`📘 Checking comment from ${platformLabel}:`, content);

  const words = (content.toLowerCase().match(/\b[\p{L}\p{N}_'-]+\b/gu) || []);
  for (let type in riskKeywords) {
    const sortedList = riskKeywords[type].sort();
    for (let word of words) {
      if (binarySearch(sortedList, word)) {
        enqueueAlert({
          platform: platformLabel || "",
          postId: data.postId || data.id || "N/A",
          reason: `⚠️ ${type.toUpperCase()} keyword detected`,
          text: content
        });
        console.log(`🚨 [${platformLabel}] Risk Detected: "${word}" in → ${content}`);
        return;
      }
    }
  }
}

// Alert Queue
function enqueueAlert(alert) {
  alertQueue.push(alert);
  if (monitoringActive) {
    displayAlert(alert);
  }
}

function displayAlert(alert) {
  const msg = document.createElement("div");
  msg.className = "message bot";
  msg.innerHTML = `${alert.reason}<br>Platform: ${alert.platform}<br>Text: "${alert.text}"`;
  document.getElementById("chat-messages").appendChild(msg);
  scrollBottom();
}

function scrollBottom() {
  const chat = document.getElementById("chat-messages");
  chat.scrollTop = chat.scrollHeight;
}

// Monitor Firestore
const collections = ["facebook", "instagram", "linkedin"];
console.log("🔍 Scanning all collections for risky keywords...");
let initialTopLevelReady = false;
let initialCommentsReady = false;
let loadedCollections = 0;

function maybeAnnounceReady() {
  if (initialTopLevelReady && initialCommentsReady) {
    const botMsg = document.createElement("div");
    botMsg.className = "message bot";
    botMsg.innerText = "✅ Initial scan complete. Real-time monitoring now active.";
    document.getElementById("chat-messages").appendChild(botMsg);
  }
}

// Initial fetch for top-level collections, then start realtime for new docs
(async () => {
  try {
    for (const col of collections) {
      console.log(`🔎 Running initial fetch for '${col}'...`);
      const ref = collection(db, col);
      const snap = await getDocs(ref);
      let initCount = 0;
      snap.forEach((doc) => {
        const path = doc.ref.path;
        if (!seenDocPaths.has(path)) seenDocPaths.add(path);
        const data = doc.data();
        analyzeText({ ...data, platform: col }, col);
        initCount++;
      });
      console.log(`✅ Initial ${col} loaded: ${initCount}`);
    }
  } catch (err) {
    console.error("❌ Initial top-level fetch error:", err);
    const botMsg = document.createElement("div");
    botMsg.className = "message bot";
    botMsg.innerText = `⚠️ Initial top-level fetch error: ${err.message}`;
    document.getElementById("chat-messages").appendChild(botMsg);
  } finally {
    if (!initialTopLevelReady) {
      initialTopLevelReady = true;
      maybeAnnounceReady();
    }
  }

  // Realtime after initial fetch
  collections.forEach((col) => {
    const ref = collection(db, col);
    onSnapshot(ref, (snapshot) => {
      loadedCollections++;
      console.log(`📡 Listening to ${col} collection...`);
      snapshot.docChanges().forEach((change) => {
        if (change.type !== "added") return;
        const path = change.doc.ref.path;
        if (seenDocPaths.has(path)) return; // already processed in initial fetch
        seenDocPaths.add(path);
        analyzeText({ ...change.doc.data(), platform: col }, col);
      });
    }, (err) => {
      console.error(`❌ Realtime error on ${col}:`, err);
      const botMsg = document.createElement("div");
      botMsg.className = "message bot";
      botMsg.innerText = `⚠️ Realtime error on ${col}: ${err.message}`;
      document.getElementById("chat-messages").appendChild(botMsg);
    });
  });
})();

// Initial fetch + realtime for nested comments via collection group: */posts/*/comments
(async () => {
  try {
    const cg = collectionGroup(db, "comments");
    console.log("🔎 Running initial collection group fetch for 'comments'...");
    const initSnap = await getDocs(cg);
    let initCount = 0;
    initSnap.forEach((doc) => {
      const path = doc.ref.path;
      seenDocPaths.add(path);
      const data = doc.data();
      const platform = normalizePlatformFromPath(path, data.platform);
      analyzeText({ ...data, platform }, platform || "");
      initCount++;
    });
    console.log(`✅ Initial comments loaded: ${initCount}`);
  } catch (err) {
    console.error("❌ Initial comments fetch error:", err);
    const botMsg = document.createElement("div");
    botMsg.className = "message bot";
    botMsg.innerText = `⚠️ Initial comments fetch error: ${err.message}\nIf this is a collection group index issue, create the suggested index in Firestore.`;
    document.getElementById("chat-messages").appendChild(botMsg);
  } finally {
    if (!initialCommentsReady) {
      initialCommentsReady = true;
      maybeAnnounceReady();
    }
  }

  try {
    const commentsCg = collectionGroup(db, "comments");
    console.log("📡 Subscribing to realtime 'comments' collection group...");
    onSnapshot(commentsCg, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type !== "added") return;
        const path = change.doc.ref.path; // e.g., facebook/POST_ID/comments/COMMENT_ID
        if (seenDocPaths.has(path)) return;
        seenDocPaths.add(path);
        const data = change.doc.data();
        const platform = normalizePlatformFromPath(path, data.platform);
        analyzeText({ ...data, platform }, platform || "");
      });
    }, (err) => {
      console.error("❌ Realtime comments error:", err);
      const botMsg = document.createElement("div");
      botMsg.className = "message bot";
      botMsg.innerText = `⚠️ Realtime comments error: ${err.message}`;
      document.getElementById("chat-messages").appendChild(botMsg);
    });
  } catch (err) {
    console.error("❌ Failed to subscribe to comments realtime:", err);
  }
})();

// Chat UI
const botBtn = document.getElementById("bot-button");
const chatBox = document.getElementById("chat-box");
botBtn.onclick = () => {
  chatBox.style.display = chatBox.style.display === "flex" ? "none" : "flex";
};

document.getElementById("send-btn").onclick = () => {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.innerText = text;
  document.getElementById("chat-messages").appendChild(userMsg);
  scrollBottom();

  botReply(text);
  input.value = "";
};

function botReply(text) {
  let reply = "🤖 I didn’t understand that.";
  const lower = text.toLowerCase();
  if (lower === "risk" || lower === "risk on" || lower.includes("enable risk")) {
    monitoringActive = true;
    reply = "✅ Risk monitoring enabled. I will display alerts in real time.";
    // display any queued alerts (last 5) as a kick-off
    const recent = alertQueue.slice(-5);
    if (recent.length) {
      recent.forEach(displayAlert);
    }
  } else if (lower === "risk off" || lower.includes("disable risk") || lower.includes("pause")) {
    monitoringActive = false;
    reply = "⏸️ Risk monitoring paused. I will keep scanning silently.";
  } else if (lower.includes("alert")) {
    reply = `You have ${alertQueue.length} alerts detected so far.`;
  } else if (lower.includes("clear")) {
    alertQueue.length = 0;
    reply = "✅ All alerts cleared.";
  } else if (lower.includes("summary")) {
    reply = `📊 Summary: ${alertQueue.length} risks detected across all platforms.`;
  }
  const botMsg = document.createElement("div");
  botMsg.className = "message bot";
  botMsg.innerText = reply;
  document.getElementById("chat-messages").appendChild(botMsg);
  scrollBottom();
}
