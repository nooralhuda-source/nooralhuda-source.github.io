const OPENAI_API_KEY = "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"; // ⚠️ TEMPORARY, REMOVE BEFORE PUBLIC
const searchBtn = document.getElementById("searchBtn");
const explainBtn = document.getElementById("explainBtn");
const queryInput = document.getElementById("query");
const limitInput = document.getElementById("limit");
const apiKeyInput = document.getElementById("apiKey");
const resultsDiv = document.getElementById("results");
const statusDiv = document.getElementById("status");

let HADITHS = [];
let lastResults = [];

/* ---------------- LOAD SHIA JSONS ---------------- */

async function loadHadiths() {
  statusDiv.textContent = "Loading hadiths…";

  for (let i = 1; i <= 38; i++) {
    try {
      const res = await fetch(`shia/${i}.json`);
      const data = await res.json();
      HADITHS.push(...data);
    } catch (e) {
      console.warn(`Failed to load shia/${i}.json`);
    }
  }

  statusDiv.textContent = `Loaded ${HADITHS.length} hadiths`;
}

loadHadiths();

/* ---------------- BASIC SCORING ---------------- */

function scoreHadith(h, words) {
  const text = ((h.englishText || "") + " " + (h.chapter || "")).toLowerCase();
  let score = 0;

  words.forEach(w => {
    if (text.includes(w)) score += 2;
  });

  // Penalise rijāl / narrator disputes
  if (text.includes("said about") || text.includes("narrator")) score -= 2;

  // Boost core doctrine terms
  if (text.includes("imam") || text.includes("allah") || text.includes("obligation"))
    score += 2;

  return score;
}

/* ---------------- SEARCH ---------------- */

searchBtn.onclick = () => {
  const query = queryInput.value.trim().toLowerCase();
  if (!query) return;

  const limit = parseInt(limitInput.value) || 8;
  const words = query.split(/\s+/);

  lastResults = HADITHS
    .map(h => ({ ...h, _score: scoreHadith(h, words) }))
    .filter(h => h._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);

  renderHadiths(lastResults);
};

/* ---------------- RENDER ---------------- */

function renderHadiths(list) {
  resultsDiv.innerHTML = "";

  if (!list.length) {
    resultsDiv.textContent = "No relevant hadiths found.";
    return;
  }

  list.forEach((h, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${i + 1}.</strong> ${h.englishText}</p>
      <p style="font-size:0.9em;color:gray;">
        ${h.book} | Vol ${h.volume || "-"} | Ch ${h.chapter || "-"} | Hadith ${h.id}
      </p>
      <hr>
    `;
    resultsDiv.appendChild(div);
  });
}

/* ---------------- AI EXPLANATION ---------------- */

explainBtn.onclick = async () => {
  if (!lastResults.length) {
    alert("Search first.");
    return;
  }

  const apiKey = apiKeyInput.value.trim() || OPENAI_API_KEY;

  statusDiv.textContent = "AI is analysing sources…";

  const context = lastResults.map(h =>
    `(${h.book}, h.${h.id}): ${h.englishText}`
  ).join("\n");

  const prompt = `
You are a Shia Islamic research assistant.
ONLY use the provided hadiths.
Do NOT invent sources.
Explain the topic academically and clearly.

HADITHS:
${context}

TASK:
1. Summarise the doctrine
2. Explain reasoning
3. Cite hadith numbers inline
`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    })
  });

  const data = await res.json();
  statusDiv.textContent = "";
  resultsDiv.innerHTML =
    `<h3>AI Explanation</h3><p>${data.choices[0].message.content}</p>`;
};
