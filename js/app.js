// TouchGrass — minimal: 2 hòm random kiểu CS2 + tab kho địa điểm AI.
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const store = {
  get(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  del(k) { localStorage.removeItem(k); }
};

// Kho hoạt động AI gom được: [{id, title, desc, who, budget, vibe, time, cost, priceHint, query, hot, tier}]
let aiActs = store.get("tg_aiActs", []);
// Kho địa điểm AI gom được, lưu theo hoạt động: {actId: [{name, address, price, note}]}
let aiPlaces = store.get("tg_aiPlaces", {});
const allActs = () => [...ACTIVITIES, ...aiActs];
const findActAny = (id) => allActs().find(a => a.id === id);
const aiCount = () => Object.values(aiPlaces).reduce((s, arr) => s + arr.length, 0);
const placesFor = (actId) => [...(PLACES[actId] || []), ...(aiPlaces[actId] || [])];

// Độ hiếm kiểu CS2 cho từng hoạt động
const ACT_TIER = {
  "go-kart": "legend", "cam-trai": "legend", "ban-sung": "legend",
  "trekking": "epic", "sup": "epic", "leo-tuong": "epic", "escape-room": "epic",
  "ban-cung": "epic", "phim-ngoai-troi": "epic", "phuot": "epic",
  "pickleball": "rare", "padel": "rare", "boxing": "rare", "foodtour": "rare",
  "cafe-song-ao": "rare", "workshop": "rare", "phim-rap": "rare", "dap-xe": "rare",
  "chay-bo": "uncommon", "picnic": "uncommon", "boi": "uncommon", "cau-long": "uncommon",
  "yoga": "uncommon", "bowling": "uncommon", "sushi": "uncommon", "bao-tang": "uncommon",
  "show-live": "uncommon", "truot-bang": "uncommon", "escape-room-x": "uncommon",
};
const WEIGHT = { common: 45, uncommon: 28, rare: 15, epic: 8, legend: 4 };
const TIER_NAME = { common: "Common", uncommon: "Uncommon", rare: "Rare", epic: "Epic", legend: "Legendary" };

const tierOfAct = (a) => a.tier || ACT_TIER[a.id] || "common";
// Tier địa điểm: hash ổn định theo tên + địa chỉ, cùng 1 chỗ luôn cùng 1 tier.
// Trọng số: common nhiều nhất, legendary hiếm nhất (giống hòm CS2).
const PLACE_TIER_POOL = ["common","common","common","common","common","common",
  "uncommon","uncommon","uncommon","uncommon",
  "rare","rare","rare", "epic","epic", "legend"];
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const tierOfPlace = (p) => PLACE_TIER_POOL[hashStr((p.name || "") + "|" + (p.address || "")) % PLACE_TIER_POOL.length];

// ---------- Tabs ----------
$$(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".tab").forEach(b => b.classList.remove("active"));
    $$(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    $("#tab-" + btn.dataset.tab).classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
function goTab(name) { document.querySelector(`.tab[data-tab="${name}"]`)?.click(); }

const filters = { vibe: "all", budget: "all" };
let currentAct = null;
let spinning = false;

function bindChips(id, key) {
  $("#" + id).addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    $$("#" + id + " .chip").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    filters[key] = btn.dataset.value;
  });
}
bindChips("filterVibe", "vibe");
bindChips("filterBudget", "budget");

function filteredActs() {
  return allActs().filter(a => {
    if (filters.vibe !== "all" && a.vibe !== filters.vibe) return false;
    if (filters.budget !== "all" && a.budget !== filters.budget) return false;
    return true;
  });
}

function weightedAct(pool) {
  const total = pool.reduce((s, a) => s + (WEIGHT[tierOfAct(a)] || 10), 0);
  let r = Math.random() * total;
  for (const a of pool) {
    r -= (WEIGHT[tierOfAct(a)] || 10);
    if (r <= 0) return a;
  }
  return pool[pool.length - 1];
}

// ---------- Âm thanh (WebAudio, không cần file) ----------
let soundOn = store.get("tg_sound", true);
function beep(freq, dur = 0.05, type = "square", vol = 0.04, when = 0) {
  if (!soundOn) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    beep.ctx = beep.ctx || new Ctx();
    const t = beep.ctx.currentTime + when;
    const o = beep.ctx.createOscillator();
    const g = beep.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(beep.ctx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  } catch {}
}
const tickSound = () => beep(1400, 0.03, "square", 0.03);
function winSound(tier) {
  if (tier === "legend") [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.18, "triangle", 0.08, i * 0.11));
  else if (tier === "epic") [523, 659, 784].forEach((f, i) => beep(f, 0.15, "triangle", 0.07, i * 0.1));
  else [440, 660].forEach((f, i) => beep(f, 0.1, "triangle", 0.06, i * 0.09));
}
function refreshSoundBtn() { $("#soundBtn").textContent = "Âm thanh: " + (soundOn ? "bật" : "tắt"); }
$("#soundBtn").addEventListener("click", () => {
  soundOn = !soundOn;
  store.set("tg_sound", soundOn);
  refreshSoundBtn();
});

// ---------- Reel kiểu CS2 ----------
function cellHTML(name, sub, tier) {
  return `<div class="reel-cell t-${tier}"><span class="r-tier">${TIER_NAME[tier]}</span><span class="r-name">${escapeHtml(name)}</span><span class="r-sub">${escapeHtml(sub || "")}</span></div>`;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

// Dựng track tĩnh cho đẹp lúc chưa quay
function idleReel(track, items, toCell) {
  track.style.transition = "none";
  track.style.transform = "translateX(0)";
  track.innerHTML = items.slice(0, 14).map(toCell).join("");
}

function spinReel(track, items, toCell, winner, tierOf, dur = 5200) {
  return new Promise((resolve) => {
    const TOTAL = 60, WIN_IDX = 52;
    const seq = [];
    for (let i = 0; i < TOTAL; i++) seq.push(items[Math.floor(Math.random() * items.length)]);
    seq[WIN_IDX] = winner;
    track.style.transition = "none";
    track.style.transform = "translateX(0)";
    track.innerHTML = seq.map((it) => toCell(it, tierOf(it))).join("");
    // ép reflow rồi mới quay
    void track.offsetWidth;
    const gap = 8;
    const cellW = track.children[0].offsetWidth + gap;
    const wrapW = track.parentElement.offsetWidth;
    const offset = WIN_IDX * cellW - (wrapW / 2 - cellW / 2);
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const start = performance.now();
    let lastPassed = -1;
    requestAnimationFrame(function frame(now) {
      const t = Math.min((now - start) / dur, 1);
      const pos = easeOut(t) * offset;
      const passed = Math.floor((pos + wrapW / 2) / cellW);
      if (passed > lastPassed) { lastPassed = passed; tickSound(); }
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    });
    track.style.transition = `transform ${dur}ms cubic-bezier(.12,.75,.05,1)`;
    track.style.transform = `translateX(${-offset}px)`;
  });
}

// ---------- Hòm 1: hoạt động ----------
const actCell = (a, tier) => cellHTML(a.title, a.cost, tier);

$("#openActBtn").addEventListener("click", async () => {
  if (spinning) return;
  const pool = filteredActs();
  if (!pool.length) { toast("Filter gắt quá, không còn gì để mở. Nới lỏng đi."); return; }
  spinning = true;
  $("#openActBtn").disabled = true;
  $("#actResult").classList.add("hidden");
  const winner = weightedAct(pool);
  await spinReel($("#actTrack"), pool, actCell, winner, tierOfAct);
  showActWinner(winner);
  winSound(tierOfAct(winner));
  spinning = false;
  $("#openActBtn").disabled = false;
});

function showActWinner(a) {
  currentAct = a;
  const tier = tierOfAct(a);
  const box = $("#actResult");
  box.className = "winner t-" + tier;
  box.innerHTML = `
    <div class="w-tier">${TIER_NAME[tier]} — trúng hoạt động</div>
    <h3>${escapeHtml(a.title)}</h3>
    <p>${escapeHtml(a.desc || "")}</p>
    <p class="w-price">Chi phí: ${escapeHtml(a.cost || "—")}${a.priceHint ? " · " + escapeHtml(a.priceHint) : ""}</p>`;
  // chuẩn bị hòm 2
  $("#openPlaceBtn").disabled = false;
  $("#placeHint").textContent = `Hòm 2 sẵn sàng cho: ${a.title}. Mở tiếp đi.`;
  const places = placesFor(a.id);
  idleReel($("#placeTrack"), places.length ? places : [{ name: "?", price: "" }],
    (p) => cellHTML(p.name, p.price || "", "common"));
  $("#placeResult").classList.add("hidden");
}

// ---------- Hòm 2: địa điểm ----------
const placeCell = (p, tier) => cellHTML(p.name, p.price, tier);

$("#openPlaceBtn").addEventListener("click", async () => {
  if (spinning || !currentAct) return;
  const places = placesFor(currentAct.id);
  if (!places.length) { toast("Kho trống. Qua tab Kho địa điểm để gom AI."); goTab("places"); return; }
  spinning = true;
  $("#openPlaceBtn").disabled = true;
  $("#placeResult").classList.add("hidden");
  const winner = places[Math.floor(Math.random() * places.length)];
  await spinReel($("#placeTrack"), places, placeCell, winner, tierOfPlace, 4200);
  showPlaceWinner(winner);
  winSound(tierOfPlace(winner));
  spinning = false;
  $("#openPlaceBtn").disabled = false;
});

function showPlaceWinner(p) {
  const tier = tierOfPlace(p);
  const q = p.name + " " + (p.address || "");
  const box = $("#placeResult");
  box.className = "winner t-" + tier;
  box.innerHTML = `
    <div class="w-tier">${TIER_NAME[tier]} — chốt địa điểm cho: ${escapeHtml(currentAct?.title || "")}</div>
    <h3>${escapeHtml(p.name)}</h3>
    <p>Địa chỉ: ${escapeHtml(p.address || "chưa rõ")}</p>
    ${p.price ? `<p class="w-price">Giá: ${escapeHtml(p.price)}</p>` : ""}
    ${p.note ? `<p>Ghi chú: ${escapeHtml(p.note)}</p>` : ""}
    <div class="w-links">
      <a class="map-btn" href="${mapsSearchUrl(q)}" target="_blank" rel="noopener">Mở Maps</a>
      <a class="map-btn secondary" href="${mapsDirUrl(q)}" target="_blank" rel="noopener">Chỉ đường</a>
      <a class="map-btn secondary" href="${googleSearchUrl(q)}" target="_blank" rel="noopener">Tìm review</a>
    </div>`;
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ---------- Tab kho địa điểm AI ----------
function refreshAiCount() {
  $("#aiTotalCount").textContent = aiActs.length + aiCount();
  const ac = $("#aiActCount");
  if (ac) ac.textContent = aiActs.length > 0 ? ` — kho có ${aiActs.length} hoạt động AI` : "";
}
function refreshAiActSelect() {
  const sel = $("#aiAct");
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = "";
  allActs().forEach(a => {
    const o = document.createElement("option");
    o.value = a.id;
    const isAi = a.id.startsWith("ai-act-");
    o.textContent = `${a.title}${isAi ? " [AI]" : ""} (${(aiPlaces[a.id] || []).length} chỗ)`;
    sel.appendChild(o);
  });
  if (cur && findActAny(cur)) sel.value = cur;
  else if (currentAct) sel.value = currentAct.id;
}
function renderAiList() {
  const actId = $("#aiAct")?.value;
  const list = $("#aiPlaceList");
  const title = $("#aiListTitle");
  if (!list) return;
  list.innerHTML = "";
  if (!actId) return;
  const a = findActAny(actId);
  const arr = aiPlaces[actId] || [];
  if (title) title.textContent = a ? `— ${a.title}: ${arr.length} chỗ AI` : "";
  if (!arr.length) {
    list.innerHTML = `<div class="empty-box">Chưa gom chỗ nào cho hoạt động này. Bấm Gom địa điểm bên trên.</div>`;
    return;
  }
  arr.forEach((p, i) => list.appendChild(aiPlaceRow(p, actId, i)));
}
function aiPlaceRow(p, actId, idx) {
  const div = document.createElement("div");
  div.className = "place-item ai";
  const q = p.name + " " + (p.address || "");
  div.innerHTML = `
    <div class="pi-body">
      <span class="src">AI</span>
      <b>${escapeHtml(p.name)}</b>
      <small>Địa chỉ: ${escapeHtml(p.address || "chưa rõ")}${p.price ? `<br>Giá: ${escapeHtml(p.price)}` : ""}${p.note ? `<br>Ghi chú: ${escapeHtml(p.note)}` : ""}</small>
      <div class="pi-links">
        <a href="${mapsSearchUrl(q)}" target="_blank" rel="noopener">Mở Maps</a>
        <a href="${mapsDirUrl(q)}" target="_blank" rel="noopener">Chỉ đường</a>
        <a href="${googleSearchUrl(q)}" target="_blank" rel="noopener">Google</a>
      </div>
    </div>`;
  const del = document.createElement("button");
  del.className = "mini-btn";
  del.style.cssText = "flex:0 0 auto;min-width:56px";
  del.textContent = "Xoá";
  del.title = "Xoá địa điểm sai này khỏi kho";
  del.addEventListener("click", () => {
    aiPlaces[actId] = (aiPlaces[actId] || []).filter((_, i) => i !== idx);
    if (!aiPlaces[actId].length) delete aiPlaces[actId];
    store.set("tg_aiPlaces", aiPlaces);
    refreshAiCount(); refreshAiActSelect(); renderAiList();
    toast("Đã xoá địa điểm khỏi kho.");
  });
  div.appendChild(del);
  return div;
}
$("#aiAct")?.addEventListener("change", renderAiList);

// key
const getKey = () => (store.get("tg_geminiKey", "") || "").trim();
const DEFAULT_MODEL = "gemini-2.0-flash";
const getModel = () => (store.get("tg_geminiModel", DEFAULT_MODEL) || DEFAULT_MODEL).trim() || DEFAULT_MODEL;
const FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-lite", "gemini-2.5-flash"];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const isOverloaded = (msg) => /overload|high demand|try again later|503|UNAVAILABLE|rate limit|429/i.test(msg || "");
const isDeadModel = (msg) => /no longer available|not found|does not exist|404|unsupported/i.test(msg || "");
$("#saveKeyBtn")?.addEventListener("click", () => {
  const k = $("#geminiKey").value.trim();
  const m = ($("#geminiModel").value || "").trim() || DEFAULT_MODEL;
  if (!k) { toast("Dán key vào ô trước đã."); return; }
  store.set("tg_geminiKey", k);
  store.set("tg_geminiModel", m);
  $("#geminiKey").value = "";
  setAiStatus(`Đã lưu key + model "${m}". Bấm Gom địa điểm.`);
});
$("#delKeyBtn")?.addEventListener("click", () => {
  store.del("tg_geminiKey");
  setAiStatus("Đã xoá key.");
});

function setAiStatus(msg) {
  const el = $("#aiStatus");
  if (el) el.textContent = msg;
}
function setAiProgress(done, total) {
  const wrap = $("#aiProgress"), bar = $("#aiBar");
  if (!wrap || !bar) return;
  wrap.classList.remove("hidden");
  bar.style.width = Math.min(100, Math.round(done / total * 100)) + "%";
}

async function callGeminiWithRetry(key, model, prompt, statusFn) {
  const tried = [model, ...FALLBACK_MODELS.filter(m => m !== model)];
  let lastErr = null;
  for (const m of tried) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return { text: await callGemini(key, m, prompt), model: m };
      } catch (err) {
        lastErr = err;
        if (isDeadModel(err.message)) { statusFn?.(`Model ${m} đã bị Google khai tử, đổi model khác...`); break; }
        if (!isOverloaded(err.message)) throw err;
        const wait = attempt * attempt * 4000 + Math.random() * 2000;
        statusFn?.(`Model ${m} đang nghẽn (lần ${attempt}/2). Đợi ${Math.round(wait / 1000)}s thử lại...`);
        await sleep(wait);
      }
    }
    statusFn?.(`Model ${m} vẫn chưa được, đổi sang model khác...`);
  }
  throw lastErr || new Error("AI đang nghẽn.");
}

async function callGemini(key, model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  if (!res.ok) {
    let msg = "HTTP " + res.status;
    try { const j = await res.json(); msg = j.error?.message || msg; } catch {}
    throw new Error(msg);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
  if (!text.trim()) throw new Error("AI trả về rỗng.");
  return text;
}

function parseAiPlaces(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const toOut = (arr) => (Array.isArray(arr) ? arr : []).map(o => sanitizePlace({
    name: String(o.name || "").trim().slice(0, 90),
    address: String(o.address || "").trim().slice(0, 130),
    price: String(o.price || "").trim().slice(0, 90),
    note: String(o.note || "").trim().slice(0, 150),
  })).filter(o => o.name.length > 2 && !isBadPlace(o)); // loại shop cho thuê / dịch vụ
  // thử parse JSON array
  const m = cleaned.match(/\[[\s\S]*\]/);
  if (m) {
    try {
      const out = toOut(JSON.parse(m[0]));
      if (out.length) return out;
    } catch {}
  }
  // fallback: tách dòng
  return cleaned.split("\n").map(l => l.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(l => l.length > 4).slice(0, 20)
    .map(name => ({ name: name.slice(0, 90), address: "Hà Nội", price: "", note: "AI gợi ý" }));
}

const VALID_WHO = ["mot-minh", "ban-be", "nguoi-yeu", "gia-dinh"];
const VALID_BUDGET = ["free", "re", "trungbinh", "cao"];
const VALID_VIBE = ["chill", "van-dong", "an-uong", "kham-pha", "van-hoa"];
const VALID_TIME = ["sang", "chieu", "toi", "cuoi-tuan"];
const VALID_TIER = ["common", "uncommon", "rare", "epic", "legend"];
// Hoạt động = LÀM GÌ (động từ chung chung). Cấm tên riêng / địa danh trong title.
// Chuẩn hoá không dấu rồi so, để bắt cả "Hồ Gươm" lẫn "ho guom".
const BAD_ACT_RE = /(\bo\s|\btai\s|ho guom|ho tay|hoan kiem|tay ho|dong da|cau giay|thanh xuan|hai ba trung|long bien|ha dong|hoang mai|soc son|dong anh|ba vi|son tay|tam dao|ninh binh|hai phong|ecopark|royal city|aeon|times city|vincom|dong do|ham lon|nui tram|trang an|phu tay ho|cho dem|pho co|pho di bo|lang co|chua |nha tho|bao tang|rap |san van dong|cong vien|\bthue\b|dat ve|mua ve|quan\s|shop|cua hang|nha hang|trung tam)/i;
const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const isBadActTitle = (t) => BAD_ACT_RE.test(norm(t));
// Địa điểm = Ở ĐÂU (tên riêng có thật). Cấm shop cho thuê / dịch vụ.
const BAD_PLACE_RE = /(cho thue|^thue\s|\bthue xe\b|rental|dich vu thue|cua hang|shop|dai ly|dat ve|booking|ban ve|cong ty du lich|tour tron goi)/i;
const isBadPlace = (p) => BAD_PLACE_RE.test(norm(p.name || ""));
// Giá chỉ được là tiền / vé / miễn phí. Nếu AI nhét tên hồ, phố, quận vào ô giá
// (vd price: "Hồ Trúc Bạch miễn phí") thì đẩy sang ghi chú, tránh hiểu nhầm
// là "địa điểm A lại có giá của địa điểm B".
const PRICE_LOOKS_LIKE_PLACE_RE = /(ho\s|ho\b|cv\b|cong vien|pho\s|duong\s|quan\s|phuong\s|xa\s|huyen\s|chua\s|den\s|bao tang|lang\s|cho\s|ben\s|cau\s|song\s|ha noi|mien phi.*(ho|cong vien|pho))/i;
const MONEY_RE = /(\dk|\dd|dong|free|mien phi|ve\b|gui xe|\b0d\b|\b0\s?d)/i;
function sanitizePlace(p) {
  const price = (p.price || "").trim();
  if (price && !MONEY_RE.test(norm(price))) {
    // price không có tí tiền nào -> chắc chắn AI nhét nhầm, đẩy sang note
    p.note = [p.note, price].filter(Boolean).join(" · ").slice(0, 150);
    p.price = "";
  } else if (price && PRICE_LOOKS_LIKE_PLACE_RE.test(norm(price)) && price.length > 24) {
    // vd "Hồ Trúc Bạch miễn phí" -> giữ chữ miễn phí, còn tên hồ đẩy sang note
    p.note = [p.note, price].filter(Boolean).join(" · ").slice(0, 150);
    p.price = /mien phi/i.test(norm(price)) ? "Miễn phí" : "";
  }
  return p;
}
const slugify = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || ("act-" + Date.now());

function parseAiActs(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const m = cleaned.match(/\[[\s\S]*\]/);
  if (!m) return [];
  try {
    const arr = JSON.parse(m[0]);
    if (!Array.isArray(arr)) return [];
    return arr.map(o => {
      const title = String(o.title || "").trim().slice(0, 60);
      if (title.length < 3) return null;
      if (isBadActTitle(title)) return null; // loại: chứa địa danh / tên riêng / thuê/mua vé
      const pick = (v, valid, fb) => valid.includes(v) ? v : fb;
      const arrPick = (v, valid, fb) => Array.isArray(v) && v.length ? [...new Set(v.filter(x => valid.includes(x)))].slice(0, 3) : [fb];
      return {
        title,
        desc: String(o.desc || "").trim().slice(0, 200),
        who: arrPick(o.who, VALID_WHO, "ban-be"),
        budget: pick(o.budget, VALID_BUDGET, "re"),
        vibe: pick(o.vibe, VALID_VIBE, "chill"),
        time: arrPick(o.time, VALID_TIME, "chieu"),
        cost: String(o.cost || "").trim().slice(0, 60) || "—",
        priceHint: String(o.priceHint || "").trim().slice(0, 120),
        query: String(o.query || (title + " Hà Nội")).trim().slice(0, 80),
        hot: !!o.hot,
        tier: VALID_TIER.includes(o.tier) ? o.tier : "uncommon",
      };
    }).filter(Boolean);
  } catch { return []; }
}

let actsRunning = false;
function setActStatus(msg) { const el = $("#actStatus"); if (el) el.textContent = msg; }
function setActProgress(done, total) {
  const wrap = $("#actProgress"), bar = $("#actBar");
  if (!wrap || !bar) return;
  wrap.classList.remove("hidden");
  bar.style.width = Math.min(100, Math.round(done / total * 100)) + "%";
}
$("#stopActsBtn")?.addEventListener("click", () => { actsRunning = false; });
$("#clearActsBtn")?.addEventListener("click", () => {
  aiActs = [];
  store.set("tg_aiActs", aiActs);
  $("#ideaCount").textContent = allActs().length;
  idleReel($("#actTrack"), allActs(), (a) => actCell(a, tierOfAct(a)));
  refreshAiCount(); refreshAiActSelect();
  setActStatus("Đã xoá toàn bộ hoạt động AI (kho địa điểm AI giữ nguyên).");
});

// Gom địa điểm cho 1 hoạt động, không cần bấm tay. Batch gọn để chạy nền hàng loạt.
// customPrompt: nếu người dùng tự viết prompt thì dùng nó (thay {{HOAT_DONG}} bằng tên hoạt động).
function buildPlacePrompt(act, zone, existing, customPrompt) {
  if (customPrompt && customPrompt.trim()) {
    const base = customPrompt.trim();
    const withAct = base.includes("{{HOAT_DONG}}")
      ? base.replaceAll("{{HOAT_DONG}}", `"${act.title}" — ${act.desc || ""}`)
      : `Cho hoạt động: "${act.title}" — ${act.desc || ""}.\n${base}`;
    return `${withAct}\n${existing ? `\nTránh lặp lại: ${existing}.` : ""}\nTrả về ĐÚNG JSON array, không giải thích:\n[{"name":"Tên địa điểm","address":"Địa chỉ, Hà Nội","price":"Giá tham khảo","note":"Ghi chú 1 dòng"}]`;
  }
  return `Cho hoạt động LÀM GÌ sau: "${act.title}" — ${act.desc || ""}.
Liệt kê 12 ĐỊA ĐIỂM Ở ĐÂU (tên riêng cụ thể, có thật, tìm được trên Google Maps) ở ${zone} để thực hiện hoạt động đó.
YÊU CẦU: mỗi chỗ là một ĐỊA ĐIỂM (công viên, hồ, quán, sân, bảo tàng, khu vui chơi...), KHÔNG phải shop cho thuê đồ, KHÔNG phải công ty tour, KHÔNG phải "dịch vụ thuê xe / đặt vé".
${existing ? `Tránh lặp: ${existing}.` : ""}
Trả về ĐÚNG JSON array, không giải thích:
[{"name":"Tên địa điểm","address":"Địa chỉ, Hà Nội","price":"Giá vé/giá vào (không phải giá thuê đồ)","note":"Ghi chú 1 dòng"}]`;
}
async function fetchPlacesForAct(key, model, act, count, statusFn, customPrompt) {
  if (!aiPlaces[act.id]) aiPlaces[act.id] = [];
  const seen = new Set(aiPlaces[act.id].map(p => p.name.toLowerCase()));
  const zones = ["nội thành Hà Nội", "ngoại thành Hà Nội", "vùng đi về trong ngày quanh Hà Nội"];
  let round = 0;
  while (aiPlaces[act.id].length < count && round < 3) {
    const zone = zones[round % zones.length];
    const existing = aiPlaces[act.id].slice(-20).map(p => p.name).join("; ");
    const prompt = buildPlacePrompt(act, zone, existing, customPrompt);
    const text = (await callGeminiWithRetry(key, model, prompt, statusFn)).text;
    parseAiPlaces(text).forEach(p => {
      const k = p.name.toLowerCase();
      if (!seen.has(k)) { seen.add(k); aiPlaces[act.id].push(p); }
    });
    round++;
  }
  store.set("tg_aiPlaces", aiPlaces);
  return aiPlaces[act.id].length;
}

$("#autoFillBtn")?.addEventListener("click", async () => {
  const key = getKey();
  if (!key) { setActStatus("Chưa có API key. Dán key ở mục B trước."); return; }
  const perAct = parseInt($("#autoPlaces")?.value || "10", 10);
  const targets = allActs().filter(a => (aiPlaces[a.id] || []).length < perAct);
  if (!targets.length) { setActStatus("Mọi hoạt động đã đủ địa điểm."); return; }
  actsRunning = true;
  $("#autoFillBtn").disabled = true;
  try {
    for (let i = 0; i < targets.length && actsRunning; i++) {
      const a = targets[i];
      setActStatus(`Tự động gom địa điểm ${i + 1}/${targets.length}: "${a.title}"...`);
      setActProgress(i, targets.length);
      await fetchPlacesForAct(key, getModel(), a, perAct, setActStatus, $("#customPrompt")?.value);
      refreshAiCount(); refreshAiActSelect(); renderAiList();
    }
    setActStatus(actsRunning ? `Xong. Đã gom cho ${targets.length} hoạt động.` : "Đã dừng giữa chừng, phần đã gom vẫn giữ.");
  } catch (err) {
    setActStatus("Lỗi gọi AI: " + err.message);
  } finally {
    actsRunning = false;
    $("#autoFillBtn").disabled = false;
    setActProgress(targets.length, targets.length);
  }
});

$("#fetchActsBtn")?.addEventListener("click", async () => {
  const key = getKey();
  if (!key) { setActStatus("Chưa có API key. Dán key ở mục B trước."); return; }
  const TARGET = 100;
  const have = () => aiActs.length;
  const seenTitles = new Set([...ACTIVITIES.map(a => a.title.toLowerCase()), ...aiActs.map(a => a.title.toLowerCase())]);
  const autoPerAct = parseInt($("#autoPlaces")?.value || "0", 10);
  actsRunning = true;
  $("#fetchActsBtn").disabled = true;
  $("#stopActsBtn").classList.remove("hidden");
  const vibes = ["thể thao lạ (bắn cung, leo núi, đua xe, võ thuật, dưới nước)", "trải nghiệm ngoài trời (trekking, camping, sông hồ)", "ăn uống - foodtour - cafe theo chủ đề", "văn hoá - nghệ thuật - workshop thủ công", "vui chơi trong nhà - game - show - xem phim", "khám phá - chợ - làng nghề - phố cổ quanh Hà Nội"];
  let round = 0;
  try {
    while (actsRunning && have() < TARGET && round < 10) {
      const vibe = vibes[round % vibes.length];
      const existing = aiActs.slice(-30).map(a => a.title).join("; ");
      setActStatus(`Đang gom hoạt động — đã có ${have()}/${TARGET} (đợt ${round + 1}, nhóm: ${vibe})...`);
      setActProgress(have(), TARGET);
      const prompt = `Liệt kê 20 VIỆC LÀM (LÀM GÌ, không phải ĐI ĐÂU) có thể thực hiện ở Hà Nội hoặc đi về trong ngày bằng xe máy (tập trung nhóm: ${vibe}).
QUY TẮC BẮT BUỘC:
- title là ĐỘNG TỪ / việc làm chung chung: ví dụ "Trượt patin", "Ngắm hoàng hôn", "Ăn buffet chay", "Học làm gốm", "Chèo thuyền kayak".
- CẤM ghi tên riêng, địa danh, tên quán, tên hồ, tên phố, tên mall vào title (sai ví dụ: "Chạy bộ Hồ Gươm", "Cafe Giảng", "Thuê xe Hồ Tây", "Mua vé CGV").
- CẤM các việc chỉ là "thuê / mua / đặt" (thuê xe, đặt vé, mua đồ) — đó không phải hoạt động, địa điểm sẽ lo phần đó.
Tránh trùng các hoạt động có sẵn: Chạy bộ, Đạp xe, Picnic, Cà phê, Foodtour, Xem phim rạp, Bảo tàng, Karaoke, Boardgame, Bi-a, Bowling, Bơi, Cầu lông, Pickleball, Padel, Yoga, Boxing, Leo tường, Trượt băng, Go-kart, Bắn cung, Bắn súng, Escape room, Cắm trại, Trekking, Phượt xe máy, Câu cá, Chợ đồ si, Workshop, SUP${existing ? `; và: ${existing}` : ""}.
Trả về ĐÚNG JSON array, không giải thích:
[{"title":"Tên VIỆC LÀM (không địa danh)","desc":"Mô tả 1-2 dòng","who":["mot-minh"|"ban-be"|"nguoi-yeu"|"gia-dinh"],"budget":"free"|"re"|"trungbinh"|"cao","vibe":"chill"|"van-dong"|"an-uong"|"kham-pha"|"van-hoa","time":["sang"|"chieu"|"toi"|"cuoi-tuan"],"cost":"Chi phí ước tính","priceHint":"Giá chi tiết","query":"Từ khóa tìm Google Maps","hot":true|false,"tier":"common"|"uncommon"|"rare"|"epic"|"legend"}]`;
      const text = (await callGeminiWithRetry(key, getModel(), prompt, setActStatus)).text;
      const batch = parseAiActs(text);
      let added = 0;
      for (const b of batch) {
        const k = b.title.toLowerCase();
        if (seenTitles.has(k)) continue;
        seenTitles.add(k);
        const id = "ai-act-" + slugify(b.title) + "-" + Date.now().toString(36) + added;
        aiActs.push({ id, ...b });
        added++;
      }
      store.set("tg_aiActs", aiActs);
      $("#ideaCount").textContent = allActs().length;
      idleReel($("#actTrack"), allActs(), (a) => actCell(a, tierOfAct(a)));
      refreshAiCount(); refreshAiActSelect();
      setActStatus(`Đợt ${round + 1}: AI trả ${batch.length} việc làm, thêm mới ${added}. Tổng ${have()}/${TARGET}.`);
      setActProgress(have(), TARGET);
      round++;
      if (added === 0 && round >= 3) break;
    }
    // Tự động gom địa điểm cho hoạt động mới nếu bật
    if (actsRunning && autoPerAct > 0 && aiActs.length) {
      const fresh = aiActs.filter(a => (aiPlaces[a.id] || []).length < autoPerAct);
      for (let i = 0; i < fresh.length && actsRunning; i++) {
        setActStatus(`Tự gom địa điểm ${i + 1}/${fresh.length}: "${fresh[i].title}" (mỗi cái ${autoPerAct} chỗ)...`);
        setActProgress(i, fresh.length);
        try { await fetchPlacesForAct(key, getModel(), fresh[i], autoPerAct, setActStatus, $("#customPrompt")?.value); }
        catch (e) { /* bỏ qua hoạt động lỗi, làm tiếp cái sau */ }
        refreshAiCount(); refreshAiActSelect(); renderAiList();
      }
    }
    if (!actsRunning) setActStatus(`Đã dừng. Kho có ${have()} hoạt động AI.`);
    else setActStatus(`Xong. Kho có ${have()} hoạt động AI${autoPerAct > 0 ? `, mỗi cái đã tự gom ~${autoPerAct} địa điểm` : ""}. Hòm 1 dùng luôn.`);
    toast("Gom hoạt động xong.");
  } catch (err) {
    if (isOverloaded(err.message)) setActStatus(`AI quá tải, đã tự thử lại mà chưa được. Giữ ${have()} hoạt động đã gom. Đợi vài phút bấm tiếp.`);
    else setActStatus("Lỗi gọi AI: " + err.message);
  } finally {
    actsRunning = false;
    $("#fetchActsBtn").disabled = false;
    $("#stopActsBtn").classList.add("hidden");
  }
});

let aiRunning = false;
$("#stopAiBtn")?.addEventListener("click", () => { aiRunning = false; });
$("#clearAiBtn")?.addEventListener("click", () => {
  const actId = $("#aiAct")?.value;
  if (!actId) return;
  delete aiPlaces[actId];
  store.set("tg_aiPlaces", aiPlaces);
  refreshAiCount(); refreshAiActSelect(); renderAiList();
  setAiStatus("Đã xoá kho của hoạt động này.");
});

$("#fetchAiBtn")?.addEventListener("click", async () => {
  const key = getKey();
  if (!key) { setAiStatus("Chưa có API key. Dán key vào ô bên trên (lấy free tại aistudio.google.com/apikey)."); return; }
  const actId = $("#aiAct")?.value;
  const target = parseInt($("#aiTarget")?.value || "50", 10);
  const act = findActAny(actId);
  if (!act) return;
  aiRunning = true;
  $("#fetchAiBtn").disabled = true;
  $("#stopAiBtn").classList.remove("hidden");
  if (!aiPlaces[actId]) aiPlaces[actId] = [];
  const have = () => aiPlaces[actId].length;
  const seen = new Set(aiPlaces[actId].map(p => p.name.toLowerCase()));
  // chia vùng để AI khỏi lặp: mỗi đợt lệch quận/khu vực
  const zones = ["quận Hoàn Kiếm - Hai Bà Trưng", "quận Đống Đa - Thanh Xuân - Cầu Giấy", "quận Tây Hồ - Long Biên - Gia Lâm", "quận Hà Đông - Hoàng Mai - Nam/Bắc Từ Liêm", "ngoại thành: Sóc Sơn - Đông Anh - Ba Vì - Sơn Tây", "ngoại thành xa: Tam Đảo - Ninh Bình - Hải Phòng"];
  let round = 0;
  try {
    while (aiRunning && have() < target && round < 8) {
      const zone = zones[round % zones.length];
      const existing = aiPlaces[actId].slice(-30).map(p => p.name).join("; ");
      setAiStatus(`Đang gom cho "${act.title}" — đã có ${have()}/${target} chỗ (đợt ${round + 1}, khu: ${zone})...`);
      setAiProgress(have(), target);
      const customPrompt = $("#customPrompt")?.value || "";
      const prompt = customPrompt.trim()
        ? buildPlacePrompt(act, zone, existing, customPrompt)
        : `Cho hoạt động LÀM GÌ sau: "${act.title}" — ${act.desc || ""}.
Liệt kê 20 ĐỊA ĐIỂM Ở ĐÂU (tên riêng cụ thể, có thật, tìm được trên Google Maps) ở Hà Nội và vùng đi về trong ngày (tập trung khu vực: ${zone}) để thực hiện hoạt động đó.
YÊU CẦU: mỗi chỗ là một ĐỊA ĐIỂM (công viên, hồ, quán, sân, bảo tàng, khu vui chơi...), KHÔNG phải shop cho thuê đồ, KHÔNG phải công ty tour, KHÔNG phải "dịch vụ thuê xe / đặt vé".
${existing ? `Tránh lặp lại: ${existing}.` : ""}
Mỗi chỗ có tên riêng + địa chỉ/quận cụ thể, ưu tiên chỗ có review tốt trên Google Maps.
Trả về ĐÚNG JSON array, không giải thích thêm:
[{"name":"Tên địa điểm","address":"Địa chỉ cụ thể, Hà Nội","price":"Giá vé/giá vào (không phải giá thuê đồ)","note":"Ghi chú 1 dòng"}]`;
      const text = (await callGeminiWithRetry(key, getModel(), prompt, (m) => {
        setAiStatus(`Đang gom cho "${act.title}" — đã có ${have()}/${target} chỗ.\n${m}`);
      })).text;
      const batch = parseAiPlaces(text);
      let added = 0;
      batch.forEach(p => {
        const k = p.name.toLowerCase();
        if (!seen.has(k)) { seen.add(k); aiPlaces[actId].push(p); added++; }
      });
      store.set("tg_aiPlaces", aiPlaces);
      refreshAiCount(); refreshAiActSelect(); renderAiList();
      setAiStatus(`Đợt ${round + 1}: AI trả ${batch.length} chỗ, thêm mới ${added}. Tổng ${have()}/${target}.`);
      setAiProgress(have(), target);
      round++;
      if (added === 0 && round >= 3) break;
    }
    if (!aiRunning) setAiStatus(`Đã dừng. Kho hiện có ${have()} chỗ cho "${act.title}".`);
    else if (have() >= target) setAiStatus(`Xong. Đủ ${have()} chỗ cho "${act.title}". Qua tab Mở hòm, hòm 2 sẽ quay trong kho này.`);
    else setAiStatus(`AI hết ý mới sau ${round} đợt. Được ${have()}/${target} chỗ. Bấm Gom tiếp để thử thêm.`);
    toast("Gom xong. Xem list bên dưới.");
  } catch (err) {
    if (isOverloaded(err.message)) {
      setAiStatus(`AI đang quá tải (Google báo high demand), đã tự thử lại nhiều model mà chưa được.\nKho hiện giữ ${have()} chỗ đã gom. Đợi 5-10 phút rồi bấm Gom tiếp — phần đã gom không mất.`);
    } else {
      setAiStatus("Lỗi gọi AI: " + err.message + "\nKiểm tra key / mạng rồi thử lại.");
    }
  } finally {
    aiRunning = false;
    $("#fetchAiBtn").disabled = false;
    $("#stopAiBtn").classList.add("hidden");
    setAiProgress(have(), target);
  }
});

// ---------- Toast + phím tắt ----------
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
    e.preventDefault();
    if (!spinning) $("#openActBtn").click();
  }
});

// ---------- Init ----------
(function init() {
  // Dọn kho AI cũ dính lỗi: hoạt động chứa địa danh / địa điểm là shop thuê đồ /
  // giá bị nhét tên địa điểm khác (vd price: "Hồ Trúc Bạch miễn phí")
  try {
    const beforeActs = aiActs.length;
    aiActs = aiActs.filter(a => !isBadActTitle(a.title));
    if (aiActs.length !== beforeActs) store.set("tg_aiActs", aiActs);
    let changed = false;
    Object.keys(aiPlaces).forEach(k => {
      const before = aiPlaces[k].length;
      aiPlaces[k] = aiPlaces[k].map(sanitizePlace).filter(p => !isBadPlace(p));
      if (aiPlaces[k].length !== before) changed = true;
    });
    if (changed) store.set("tg_aiPlaces", aiPlaces);
  } catch {}
  $("#ideaCount").textContent = allActs().length;
  refreshSoundBtn();
  idleReel($("#actTrack"), allActs(), (a) => actCell(a, tierOfAct(a)));
  idleReel($("#placeTrack"), [{ name: "Mở hòm 1 trước", price: "" }], (p) => cellHTML(p.name, "", "common"));
  const ms = $("#geminiModel");
  if (ms) ms.value = getModel();
  refreshAiActSelect();
  renderAiList();
  refreshAiCount();
  if (getKey()) setAiStatus("Đã lưu key. Chọn hoạt động rồi bấm Gom địa điểm.");
})();
