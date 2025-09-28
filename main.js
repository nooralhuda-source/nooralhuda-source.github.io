// main.js

const surahId = parseInt(new URLSearchParams(window.location.search).get("id") || "1", 10);

const ayahContainer = document.getElementById("ayahContainer");
const quranOnlyBtn = document.getElementById("quranOnlyBtn");
const darkModeBtn = document.getElementById("darkModeBtn");
const searchBox = document.getElementById("searchBox");
const translationOptions = document.getElementById("translationOptions");

// Active translations
let activeTranslations = ["en.haleem"];

// Render surah
async function renderSurah() {
  try {
    // Fetch surah metadata + Arabic text
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}`);
    const data = await res.json();
    const surah = data.data;

    // Fill metadata
    document.getElementById("surahName").textContent = `Surah ${surah.englishName} (${surah.name})`;
    document.getElementById("surahMeaning").textContent = `"${surah.englishNameTranslation}"`;
    document.getElementById("surahHistory").textContent =
      surah.revelationType === "Meccan" ? "Revealed in Mecca." : "Revealed in Medina.";

    // Mishary Alafasy audio
    document.getElementById("surahAudio").src =
      `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${String(surahId).padStart(3,"0")}.mp3`;

    // Fetch translations for all selected languages
    const translationData = {};
    for (let code of activeTranslations) {
      const tRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/${code}`);
      const tJson = await tRes.json();
      translationData[code] = tJson.data.ayahs;
    }

    // Render ayahs
    ayahContainer.innerHTML = "";
    let ayahs = surah.ayahs;

    if (surahId !== 9) {
      ayahs = [{ numberInSurah: 0, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" }, ...ayahs];
    }

    ayahs.forEach((a, i) => {
      const block = document.createElement("div");
      block.className = "ayah";
      block.innerHTML = `
        <div class="ayah-number">${surahId}:${a.numberInSurah}</div>
        <div class="arabic">${a.text}</div>
      `;

      // Add translations
      for (let code of activeTranslations) {
        const t = translationData[code]?.[i];
        if (t) {
          const div = document.createElement("div");
          div.className = "translation";
          div.textContent = t.text;
          block.appendChild(div);
        }
      }

      ayahContainer.appendChild(block);
    });
  } catch (err) {
    console.error(err);
    ayahContainer.innerHTML = "<p>Failed to load surah.</p>";
  }
}

// Qur’an-only toggle
quranOnlyBtn.addEventListener("click", () => {
  document.body.classList.toggle("quran-only");
  quranOnlyBtn.textContent = document.body.classList.contains("quran-only")
    ? "📖 Show Translations"
    : "📖 Qur’an Only";
});

// Dark mode toggle
darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  darkModeBtn.textContent = document.body.classList.contains("dark")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
});

// Translation checkboxes
translationOptions.addEventListener("change", () => {
  activeTranslations = Array.from(
    translationOptions.querySelectorAll("input[type=checkbox]:checked")
  ).map(cb => cb.value);
  renderSurah();
});

// Search filter
searchBox.addEventListener("input", () => {
  const term = searchBox.value.toLowerCase();
  document.querySelectorAll(".translation").forEach(div => {
    div.style.display = div.textContent.toLowerCase().includes(term) ? "" : "none";
  });
});

// Initial render
renderSurah();
