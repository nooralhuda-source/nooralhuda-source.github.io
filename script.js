// ─── Noor al-Huda Script ───

// Hamburger Menu Toggle
const hamburger = document.querySelector('.hamburger');
const mainNav = document.getElementById('mainNav');

if (hamburger && mainNav) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    mainNav.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (mainNav.classList.contains('open') &&
        !mainNav.contains(e.target) &&
        !hamburger.contains(e.target)) {
      mainNav.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      mainNav.classList.remove('open');
    }
  });
}

// Dark Mode Toggle
const darkToggle = document.getElementById('darkModeToggle');
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme',
      document.body.classList.contains('dark') ? 'dark' : 'light');
  });
}

// Surah Filtering
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    document.querySelectorAll('.surah-card').forEach(card => {
      const name = card.querySelector('h3').textContent.toLowerCase();
      card.style.display = name.includes(query) ? 'block' : 'none';
    });
  });
}
const headerHTML = `
<header>
  <div class="brand">
    <h1><a href="index.html">Noor Al Huda</a></h1>
  </div>

  <button class="hamburger" aria-label="Open menu">☰</button>
</header>

<nav id="mainNav">
  <a href="quran.html">Quran</a>
  <a href="duas.html">Duas</a>
  <a href="hadiths-home.html">Hadiths</a>
  <a href="calendar.html">Calendar</a>
  <a href="salah.html">Salah</a>
  <a href="shiatube/index.html">ShiaTube</a>
  <a href="index.html">Home</a>
  <a href="settings.html">Settings</a>
</nav>
`;