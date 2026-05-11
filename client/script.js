const API_URL = '/api';
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const COMMON_CHORDS = [
    "C", "G", "Am", "F", "Dm", "Em",
    "D", "A", "E", "Bm", "F#m", "C#m",
    "G7", "C7", "F7", "D7", "A7", "E7", "B7",
    "Bb", "Eb", "Ab", "Db", "Gb", "Cm", "Gm", "Fm",
    "Cmaj7", "Gmaj7", "Fmaj7", "Am7", "Dm7", "Em7",
    "Asus4", "Dsus4", "Gsus4", "Edim", "Adim"
];

let state = {
    token: localStorage.getItem('token') === 'null' ? null : localStorage.getItem('token'),
    songs: [],
    theme: localStorage.getItem('theme') || 'dark',
    activeTab: 'library',
    authMode: 'login', // 'login' or 'register'
    transposeStep: 0,
    isAutoScrolling: false,
    currentSong: null,
    editingId: null
};

// --- Helper for Robust API Calls ---
async function safeFetch(url, options = {}) {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type");
    
    let data = null;
    if (contentType && contentType.includes("application/json")) {
        data = await res.json();
    }

    if (!res.ok) {
        // Use error from server if available, otherwise fallback
        const errorMsg = (data && (data.error || data.message)) || `Server error: ${res.status}`;
        throw new Error(errorMsg);
    }
    
    return data;
}


// --- Initializing ---
function init() {
    applyTheme();
    setupAuthListeners();
    setupTabListeners();
    setupModalListeners();
    setupThemeToggle();
    setupSidebarToggle();
    renderChordHelper();

    if (state.token) {
        showView('dashboard');
        fetchSongs();
    } else {
        showView('login');
    }

    lucide.createIcons();
}

// --- Theme Logic ---
function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');

    if (state.theme === 'dark') {
        themeIcon.setAttribute('data-lucide', 'sun');
        themeText.innerText = 'Light Mode';
    } else {
        themeIcon.setAttribute('data-lucide', 'moon');
        themeText.innerText = 'Dark Mode';
    }
    localStorage.setItem('theme', state.theme);
    lucide.createIcons();
}

function setupThemeToggle() {
    document.getElementById('theme-toggle').addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
    });
}

// --- View Navigation ---
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`${viewId}-screen`).classList.remove('hidden');
}

function showContent(tabId) {
    document.querySelectorAll('.content-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`content-${tabId}`).classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.target === tabId);
    });

    const titles = { library: 'My Library', discover: 'Discover', favorites: 'Favorites' };
    document.getElementById('page-title').innerText = titles[tabId];
}

// --- Sidebar Toggle ---
function setupSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggleBtn = document.getElementById('menu-toggle');

    const toggleSidebar = () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('hidden');
    };

    const closeSidebar = () => {
        sidebar.classList.remove('open');
        overlay.classList.add('hidden');
    };

    toggleBtn.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Close sidebar when clicking a nav button
    document.querySelectorAll('.sidebar .nav-btn').forEach(btn => {
        btn.addEventListener('click', closeSidebar);
    });
}

// --- Auth Logic ---
function setupAuthListeners() {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const authForm = document.getElementById('auth-form');
    const submitBtn = document.getElementById('auth-submit-btn');

    tabLogin.addEventListener('click', () => {
        state.authMode = 'login';
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        submitBtn.innerText = 'Sign In';
    });

    tabRegister.addEventListener('click', () => {
        state.authMode = 'register';
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        submitBtn.innerText = 'Create Account';
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('auth-error');

        try {
            const endpoint = state.authMode === 'login' ? '/auth/login' : '/auth/register';
            const data = await safeFetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            state.token = data.token;
            localStorage.setItem('token', data.token);
            showView('dashboard');
            fetchSongs();
            errorMsg.classList.add('hidden');
        } catch (err) {
            errorMsg.innerText = err.message;
            errorMsg.classList.remove('hidden');
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        state.token = null;
        localStorage.removeItem('token');
        showView('login');
    });
}

// --- Tab Listeners ---
function setupTabListeners() {
    document.querySelectorAll('.nav-btn[data-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            state.activeTab = btn.dataset.target;
            showContent(state.activeTab);
        });
    });
}

// --- Modal Listeners ---
function setupModalListeners() {
    const composeModal = document.getElementById('compose-modal');
    const practiceModal = document.getElementById('practice-modal');

    document.getElementById('open-compose-btn').addEventListener('click', () => {
        state.editingId = null;
        document.getElementById('compose-modal-title').innerText = 'Compose Masterpiece';
        document.getElementById('compose-form').reset();
        composeModal.classList.remove('hidden');
    });

    document.getElementById('close-compose-btn').addEventListener('click', () => {
        composeModal.classList.add('hidden');
    });

    document.getElementById('compose-backdrop').addEventListener('click', () => {
        composeModal.classList.add('hidden');
    });

    document.getElementById('close-practice-btn').addEventListener('click', () => {
        closePractice();
    });

    document.getElementById('practice-backdrop').addEventListener('click', () => {
        closePractice();
    });

    document.getElementById('compose-form').addEventListener('submit', saveSong);
}

// --- Song CRUD ---
async function fetchSongs() {
    try {
        const data = await safeFetch(`${API_URL}/songs`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        state.songs = data;
        renderSongs();
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

async function saveSong(e) {
    e.preventDefault();
    const title = document.getElementById('compose-title').value;
    const artist = document.getElementById('compose-artist').value;
    const content = document.getElementById('compose-content').value;

    try {
        const url = state.editingId ? `${API_URL}/songs/${state.editingId}` : `${API_URL}/songs`;
        const method = state.editingId ? 'PUT' : 'POST';

        await safeFetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ title, artist, content })
        });
        
        document.getElementById('compose-form').reset();
        document.getElementById('compose-modal').classList.add('hidden');
        state.editingId = null;
        fetchSongs();
    } catch (err) {
        console.error('Save error:', err);
    }
}

function editSong(song) {
    state.editingId = song._id;
    document.getElementById('compose-title').value = song.title;
    document.getElementById('compose-artist').value = song.artist;
    document.getElementById('compose-content').value = song.content;
    document.getElementById('compose-modal-title').innerText = 'Edit Masterpiece';
    document.getElementById('compose-modal').classList.remove('hidden');
}

async function deleteSong(id) {
    if (!confirm('Are you sure you want to delete this masterpiece?')) return;
    try {
        await safeFetch(`${API_URL}/songs/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        fetchSongs();
    } catch (err) {
        console.error('Delete error:', err);
    }
}

function renderSongs() {
    const grid = document.getElementById('song-grid');
    const template = document.getElementById('song-card-template');
    grid.innerHTML = '';

    document.getElementById('song-count').innerText = state.songs.length;

    state.songs.forEach(song => {
        const card = template.content.cloneNode(true).querySelector('.song-card');
        card.querySelector('.card-title').innerText = song.title;
        card.querySelector('.card-artist span').innerText = song.artist;
        card.querySelector('.card-preview pre').innerText = song.content;

        card.querySelector('.edit-btn').onclick = () => editSong(song);
        card.querySelector('.delete-btn').onclick = () => deleteSong(song._id);
        card.querySelector('.play-btn').onclick = () => openPractice(song);

        grid.appendChild(card);
    });
    lucide.createIcons();
}


function openPractice(song) {
    state.currentSong = song;
    state.transposeStep = 0;
    state.isAutoScrolling = false;

    document.getElementById('practice-title').innerText = song.title;
    document.getElementById('practice-artist').innerText = song.artist;
    document.getElementById('practice-modal').classList.remove('hidden');

    updatePracticeViewer();
    setupPracticeControls();
}

function closePractice() {
    document.getElementById('practice-modal').classList.add('hidden');
    stopAutoScroll();
}

function setupPracticeControls() {
    const scrollBtn = document.getElementById('auto-scroll-btn');
    const transposeVal = document.getElementById('transpose-val');

    scrollBtn.onclick = () => toggleAutoScroll();

    document.getElementById('transpose-up').onclick = () => {
        state.transposeStep++;
        updateTransposeUI();
    };

    document.getElementById('transpose-down').onclick = () => {
        state.transposeStep--;
        updateTransposeUI();
    };

    updateTransposeUI();
    updateScrollUI();
}

function updateTransposeUI() {
    const val = state.transposeStep;
    document.getElementById('transpose-val').innerText = val > 0 ? `+${val}` : val;
    updatePracticeViewer();
}

function updateScrollUI() {
    const btn = document.getElementById('auto-scroll-btn');
    const icon = document.getElementById('scroll-icon');
    btn.classList.toggle('active', state.isAutoScrolling);
    icon.setAttribute('data-lucide', state.isAutoScrolling ? 'pause' : 'play');
    lucide.createIcons();
}

function toggleAutoScroll() {
    state.isAutoScrolling = !state.isAutoScrolling;
    if (state.isAutoScrolling) {
        startAutoScroll();
    } else {
        stopAutoScroll();
    }
    updateScrollUI();
}

function startAutoScroll() {
    const container = document.getElementById('practice-scroll-container');
    const step = () => {
        if (!state.isAutoScrolling) return;
        container.scrollTop += 0.5;
        requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

function stopAutoScroll() {
    state.isAutoScrolling = false;
}


function transposeChord(chord, step) {
    const match = chord.match(/^([A-G][b#]?)(.*)$/);
    if (!match) return chord;

    let root = match[1];
    const suffix = match[2];

    const flatToSharp = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
    if (flatToSharp[root]) root = flatToSharp[root];

    const currentIndex = NOTES.indexOf(root);
    if (currentIndex === -1) return chord;

    let newIndex = (currentIndex + step) % 12;
    if (newIndex < 0) newIndex += 12;

    return NOTES[newIndex] + suffix;
}

function updatePracticeViewer() {
    const viewer = document.getElementById('practice-viewer');
    viewer.innerHTML = '';

    const lines = state.currentSong.content.split('\n');
    const linePattern = /(\[[^\]]+\])?([^\[]*)/g;

    lines.forEach(line => {
        let chordLine = "";
        let lyricLine = "";
        let currentPos = 0;

        let match;
        while ((match = linePattern.exec(line)) !== null) {
            if (match.index === linePattern.lastIndex) linePattern.lastIndex++;
            const [fullMatch, chord, text] = match;
            if (!fullMatch) continue;

            const paddingLen = Math.max(0, match.index - currentPos);
            const padding = " ".repeat(paddingLen);
            chordLine += padding;
            lyricLine += padding;

            if (chord) {
                let chordName = chord.slice(1, -1);
                if (state.transposeStep !== 0) {
                    chordName = transposeChord(chordName, state.transposeStep);
                }

                const chordLen = chordName.length;
                const textLen = text ? text.length : 0;

                chordLine += chordName;
                chordLine += " ".repeat(Math.max(0, textLen - chordLen));
                if (text) lyricLine += text;
                lyricLine += " ".repeat(Math.max(0, chordLen - textLen));
            } else {
                const textLen = text ? text.length : 0;
                chordLine += " ".repeat(textLen);
                if (text) lyricLine += text;
            }
            currentPos = match.index + fullMatch.length;
        }

        if (chordLine.trim()) {
            const cEl = document.createElement('div');
            cEl.className = 'chord-line';
            cEl.innerText = chordLine;
            viewer.appendChild(cEl);
        }

        const lEl = document.createElement('div');
        lEl.className = 'lyric-line';
        lEl.innerText = lyricLine || ' ';
        viewer.appendChild(lEl);
    });
}


function renderChordHelper() {
    const container = document.getElementById('chord-helper');
    const textarea = document.getElementById('compose-content');

    COMMON_CHORDS.forEach(chord => {
        const btn = document.createElement('button');
        btn.className = 'chord-btn';
        btn.type = 'button';
        btn.innerText = chord;
        btn.onclick = () => {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const chordTag = `[${chord}]`;
            textarea.value = text.substring(0, start) + chordTag + text.substring(end);
            textarea.focus();
            textarea.setSelectionRange(start + chordTag.length, start + chordTag.length);
        };
        container.appendChild(btn);
    });
}

// --- Start the App ---
window.addEventListener('DOMContentLoaded', init);
