// --- DOM ELEMENTS (No changes needed) ---
const masterPlay = document.getElementById('masterPlay');
const wave = document.getElementById('wave');
const poster_master_play = document.getElementById('poster_master_play');
const title = document.getElementById('title');
const currentStart = document.getElementById('currentStart');
const currentEnd = document.getElementById('currentEnd');
const seek = document.getElementById('seek');
const bar2 = document.getElementById('bar2');
const dot = document.getElementsByClassName('dot')[0];
const back = document.getElementById("back");
const next = document.getElementById("next");
const shuffleBtn = document.getElementById('shuffle');
const repeatBtn = document.getElementById('repeat');
const vol = document.getElementById('vol');
const songSide = document.querySelector('.song_side');

// --- AUDIO ---
const music = new Audio();

// --- DATA & STATE ---
let allSongs = new Map();
let currentPlaylist = [];
let index = null;
let isShuffle = false;
let repeatMode = 0;
let likedSongs = new Set();

// ================================
// INITIALIZATION
// ================================
window.onload = () => {
    loadState();
    initializeApp();
};

async function initializeApp() {
    showLoadingState();

    try {
        const [telugu, hindi, english, tamil, kannada, artists] = await Promise.all([
            fetchSongsByQuery('latest telugu'),
            fetchSongsByQuery('latest hindi'),
            fetchSongsByQuery('top english billboard'),
            fetchSongsByQuery('latest tamil'),
            fetchSongsByQuery('latest kannada'),
            fetchPopularArtists() // New function call
        ]);

        [...telugu, ...hindi, ...english, ...tamil, ...kannada].forEach(song => {
            if (!allSongs.has(song.id)) {
                allSongs.set(song.id, song);
            }
        });

        populateAllContentSections({ telugu, hindi, english, tamil, kannada, artists });

        currentPlaylist = [...allSongs.values()];
        renderPlaylist(currentPlaylist);

        setupScrollers();
        setupSearch();
        updateLikeButtonsUI();
        updateProfileStats();
        restoreLastSong();

    } catch (error) {
        console.error("Initialization failed:", error);
        showErrorState();
    }
}

// --- API FETCHING ---
async function fetchSongsByQuery(query, limit = 20) {
    const apiUrl = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        const data = await response.json();
        if (!data.success || !data.data.results) return [];
        return data.data.results.map(song => ({
            id: song.id,
            songName: `${song.name}<br><div class="subtitle">${song.artists.primary.map(a => a.name).join(', ')}</div>`,
            poster: song.image.find(img => img.quality === '500x500')?.url || song.image[0].url,
            language: song.language.toLowerCase(),
            audioUrl: song.downloadUrl.find(aud => aud.quality === '320kbps')?.url || song.downloadUrl[0].url
        }));
    } catch (error) {
        console.error(`Failed to fetch songs for query "${query}":`, error);
        return [];
    }
}

// --- NEW: Function to fetch popular artists ---
async function fetchPopularArtists() {
    // We search for a few popular artists since there's no "top artists" endpoint
    const artistNames = ["Arijit Singh", "Shreya Ghoshal", "Anirudh Ravichander", "Sid Sriram", "Badshah", "AP Dhillon"];
    const artistPromises = artistNames.map(name =>
        fetch(`https://saavn.dev/api/search/artists?query=${encodeURIComponent(name)}&limit=1`)
            .then(res => res.json())
    );

    try {
        const results = await Promise.all(artistPromises);
        const artists = results
            .filter(res => res.success && res.data.results.length > 0)
            .map(res => {
                const artist = res.data.results[0];
                return {
                    id: artist.id,
                    name: artist.name,
                    image: artist.image.find(img => img.quality === '500x500')?.url || artist.image[0].url
                };
            });
        return artists;
    } catch (error) {
        console.error("Failed to fetch artists:", error);
        return [];
    }
}

// ================================
// DYNAMIC CONTENT & UI RENDERING
// ================================
function showLoadingState() {
    const loadingHTML = '<p style="padding: 10px; color: #a4a8b4;">Loading...</p>';
    document.querySelector('.menu_song .song-list-container').innerHTML = `<li style="padding:20px;">Loading...</li>`;
    ['telugu', 'hindi', 'english', 'tamil', 'kannada'].forEach(lang => {
        const container = document.getElementById(`${lang}_songs_container`);
        if (container) container.innerHTML = loadingHTML;
    });
    const artistsContainer = document.getElementById('artists_container');
    if (artistsContainer) artistsContainer.innerHTML = loadingHTML;
}

function showErrorState() {
    document.querySelector('.menu_song .song-list-container').innerHTML = '<li style="padding:20px; color: #ff6b6b;">Failed to load. Please refresh.</li>';
}

function renderPlaylist(playlist, title = null) {
    const songListContainer = document.querySelector('.menu_song .song-list-container');
    // If a title is passed (like an artist name), display it
    if (title) {
        document.querySelector('.menu_side h1').innerText = title;
    } else {
        document.querySelector('.menu_side h1').innerText = "Feel_the_music";
    }

    songListContainer.innerHTML = '';
    currentPlaylist = playlist;

    if (playlist.length === 0) {
        songListContainer.innerHTML = '<li class="no-songs" style="padding: 20px;">No songs found.</li>';
        return;
    }

    playlist.forEach((song, idx) => {
        const mainLi = document.createElement('li');
        mainLi.className = 'songitem';
        mainLi.dataset.id = song.id;
        mainLi.innerHTML = `
            <span>${String(idx + 1).padStart(2, '0')}</span>
            <img src="${song.poster}" alt="">
            <h5>${song.songName}</h5>
            <i class="bi bi-heart like_icon" data-id="${song.id}"></i>
            <i class="bi playlistplay bi-play-circle-fill" id="${song.id}"></i>
        `;
        songListContainer.appendChild(mainLi);
    });

    attachAllEventListeners();
    updateLikeButtonsUI();
    updateNowPlayingIndicator();
}

function populateSongSection(container, songList) {
    if (!container || !songList || songList.length === 0) {
        if (container) container.innerHTML = `<p style="padding: 10px; color: #a4a8b4;">No songs found.</p>`;
        return;
    }
    container.innerHTML = '';
    songList.forEach(song => {
        const li = document.createElement('li');
        li.className = 'songitem';
        li.dataset.id = song.id;
        li.innerHTML = `
            <div class="img_play">
                <img src="${song.poster}" alt="">
                <i class="bi playlistplay bi-play-circle-fill" id="${song.id}"></i>
            </div>
            <h5>${song.songName}</h5>
        `;
        container.appendChild(li);
    });
}

// --- NEW: Function to render artist cards ---
function populateArtistsSection(container, artists) {
    if (!container || !artists || artists.length === 0) {
        if(container) container.innerHTML = `<p style="padding: 10px; color: #a4a8b4;">No artists found.</p>`;
        return;
    }
    container.innerHTML = '';
    artists.forEach(artist => {
        const li = document.createElement('li');
        // Add a specific class for event handling
        li.className = 'artist_card'; 
        li.dataset.artistName = artist.name;
        li.innerHTML = `
            <img src="${artist.image}" alt="${artist.name}">
            <h5>${artist.name}</h5>
        `;
        container.appendChild(li);
    });
}

function populateAllContentSections({ telugu, hindi, english, tamil, kannada, artists }) {
    populateSongSection(document.getElementById('telugu_songs_container'), telugu);
    populateSongSection(document.getElementById('hindi_songs_container'), hindi);
    populateSongSection(document.getElementById('english_songs_container'), english);
    populateSongSection(document.getElementById('tamil_songs_container'), tamil);
    populateSongSection(document.getElementById('kannada_songs_container'), kannada);
    populateArtistsSection(document.getElementById('artists_container'), artists);

    const popularSongs = [...telugu.slice(0, 4), ...hindi.slice(0, 4), ...english.slice(0, 4), ...tamil.slice(0, 4)];
    populateSongSection(document.getElementById('pop_song_container'), popularSongs);

    attachAllEventListeners();
}

function updateDynamicBackground(posterUrl) {
    const bgElement = document.querySelector('.song_side::before');
    if (posterUrl) {
        songSide.style.setProperty('--bg-image', `url(${posterUrl})`);
        bgElement.style.opacity = '1';
    } else {
        bgElement.style.opacity = '0';
    }
}

function updateNowPlayingIndicator() {
    document.querySelectorAll('.songitem.playing').forEach(item => item.classList.remove('playing'));
    if (index) {
        document.querySelectorAll(`.songitem[data-id="${index}"]`).forEach(item => item.classList.add('playing'));
    }
}


// ================================
// PLAYER LOGIC
// ================================
function playSong(songId, autoPlay = true) {
    index = String(songId);
    const songData = allSongs.get(index);
    if (!songData) {
        console.error(`Song with ID ${index} not found!`);
        return;
    }

    music.src = songData.audioUrl;
    poster_master_play.src = songData.poster;
    title.innerHTML = songData.songName;
    
    updateDynamicBackground(songData.poster);
    updateLikeButtonsUI();
    updateNowPlayingIndicator();
    makeAllplays();

    if (autoPlay) {
        music.play().catch(e => console.error("Audio playback failed:", e));
    }

    saveState();
}

// ... The rest of the JS file remains the same ...
// togglePlayPause, setupSearch, State Management, Likes, Audio Events, Controls, UI & Navigation, etc.
// I will include the full, final code below for easy copy-pasting.

function togglePlayPause() {
    if (!music.src) {
        if (currentPlaylist.length > 0) playSong(currentPlaylist[0].id);
    } else {
        if (music.paused) music.play();
        else music.pause();
    }
}

function setupSearch() {
    const searchInput = document.querySelector('.search input');
    const searchResultsContainer = document.querySelector('.search_results');
    let searchTimeout;

    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm.length < 2) {
            searchResultsContainer.style.visibility = 'hidden';
            return;
        }
        searchTimeout = setTimeout(async () => {
            const searchResults = await fetchSongsByQuery(searchTerm, 10);
            searchResults.forEach(song => {
                if (!allSongs.has(song.id)) allSongs.set(song.id, song);
            });
            if (searchResults.length > 0) {
                searchResultsContainer.innerHTML = searchResults.map(song => `
                    <a href="#" class="card" data-id="${song.id}">
                        <img src="${song.poster}" alt="">
                        <div class="content">
                            ${song.songName.split('<br>')[0]}
                            <div class="subtitle">${song.songName.split('<div class="subtitle">')[1].replace('</div>', '')}</div>
                        </div>
                    </a>`).join('');
            } else {
                searchResultsContainer.innerHTML = `<p style="padding: 10px; color: #fff;">No results found</p>`;
            }
            searchResultsContainer.style.visibility = 'visible';
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search')) searchResultsContainer.style.visibility = 'hidden';
    });

    searchResultsContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (card) {
            e.preventDefault();
            playSong(card.dataset.id);
            searchInput.value = '';
            searchResultsContainer.style.visibility = 'hidden';
        }
    });
}

function saveState() {
    localStorage.setItem("playerState", JSON.stringify({
        lastSongId: index, likedSongs: [...likedSongs], isShuffle, repeatMode, volume: music.volume
    }));
}

function loadState() {
    try {
        const state = JSON.parse(localStorage.getItem("playerState"));
        if (!state) return;
        likedSongs = new Set(state.likedSongs || []);
        isShuffle = !!state.isShuffle;
        repeatMode = state.repeatMode || 0;
        music.volume = state.volume ?? 1;
        vol.value = music.volume * 100;
    } catch (e) { console.warn("Failed to load state", e); }
}

async function restoreLastSong() {
    const state = JSON.parse(localStorage.getItem("playerState"));
    if (state && state.lastSongId) {
        let lastSongData = allSongs.get(state.lastSongId);
        if (!lastSongData) {
            const songDetails = await fetchSongsByQuery(state.lastSongId, 1);
            if (songDetails.length > 0) {
                lastSongData = songDetails[0];
                allSongs.set(lastSongData.id, lastSongData);
            }
        }
        if (lastSongData) playSong(lastSongData.id, false);
    }
}

function toggleLike(songId) {
    if (likedSongs.has(songId)) likedSongs.delete(songId);
    else likedSongs.add(songId);
    saveState();
    updateLikeButtonsUI();
    updateProfileStats();
    if (document.querySelector('[data-playlist="liked"].active')) {
        const likedSongsList = [...allSongs.values()].filter(song => likedSongs.has(song.id));
        renderPlaylist(likedSongsList);
    }
}

function updateLikeButtonsUI() {
    document.querySelectorAll('.like_icon').forEach(icon => {
        icon.classList.toggle('liked', likedSongs.has(icon.dataset.id));
        icon.classList.toggle('bi-heart-fill', likedSongs.has(icon.dataset.id));
        icon.classList.toggle('bi-heart', !likedSongs.has(icon.dataset.id));
    });
    const likeMaster = document.getElementById('like_master');
    if (index) {
        likeMaster.classList.toggle('liked', likedSongs.has(index));
        likeMaster.classList.toggle('bi-heart-fill', likedSongs.has(index));
        likeMaster.classList.toggle('bi-heart', !likedSongs.has(index));
    }
}

music.onplay = () => {
    wave.classList.add('active1');
    masterPlay.classList.replace('bi-play-fill', 'bi-pause-fill');
    document.querySelectorAll(`.playlistplay#${index}`).forEach(btn => btn.classList.replace('bi-play-circle-fill', 'bi-pause-circle-fill'));
};
music.onpause = () => {
    wave.classList.remove('active1');
    masterPlay.classList.replace('bi-pause-fill', 'bi-play-fill');
    document.querySelectorAll(`.playlistplay#${index}`).forEach(btn => btn.classList.replace('bi-pause-circle-fill', 'bi-play-circle-fill'));
};
music.addEventListener('timeupdate', () => {
    const { currentTime, duration } = music;
    if (duration) {
        currentEnd.innerText = `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`;
    }
    currentStart.innerText = `${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, '0')}`;
    const progressBar = (currentTime / duration) * 100;
    seek.value = isNaN(progressBar) ? 0 : progressBar;
    bar2.style.width = `${seek.value}%`;
    dot.style.left = `${seek.value}%`;
});
seek.addEventListener('change', () => { if (music.duration) music.currentTime = (seek.value * music.duration) / 100; });
music.addEventListener('ended', () => {
    if (repeatMode === 2) playSong(index);
    else next.click();
});

next.addEventListener('click', () => {
    if (currentPlaylist.length === 0) return;
    if (isShuffle) {
        let randomIndex;
        do { randomIndex = Math.floor(Math.random() * currentPlaylist.length); } while (currentPlaylist[randomIndex].id == index && currentPlaylist.length > 1);
        playSong(currentPlaylist[randomIndex].id);
        return;
    }
    const currentIndexInPlaylist = currentPlaylist.findIndex(song => song.id == index);
    if (currentIndexInPlaylist === -1 || currentIndexInPlaylist === currentPlaylist.length - 1) {
        if (repeatMode === 1) playSong(currentPlaylist[0].id);
    } else {
        playSong(currentPlaylist[currentIndexInPlaylist + 1].id);
    }
});
back.addEventListener('click', () => {
    if (currentPlaylist.length === 0) return;
    const currentIndexInPlaylist = currentPlaylist.findIndex(song => song.id == index);
    if (currentIndexInPlaylist <= 0) playSong(currentPlaylist[currentPlaylist.length - 1].id);
    else playSong(currentPlaylist[currentIndexInPlaylist - 1].id);
});
shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
    saveState();
});
repeatBtn.addEventListener('click', () => {
    repeatMode = (repeatMode + 1) % 3;
    repeatBtn.classList.toggle('active', repeatMode !== 0);
    repeatBtn.classList.toggle('repeat-one', repeatMode === 2);
    repeatBtn.classList.remove('bi-repeat', 'bi-repeat-1');
    repeatBtn.classList.add(repeatMode === 2 ? 'bi-repeat-1' : 'bi-repeat');
    saveState();
});
vol.addEventListener('change', () => {
    music.volume = vol.value / 100;
    saveState();
});

function updateProfileStats() {
    document.getElementById('liked_songs_count').innerText = likedSongs.size;
}

function setupScrollers() {
    setupScroller('pop_song_container', 'pop_song_left', 'pop_song_right');
    setupScroller('telugu_songs_container', 'telugu_song_left', 'telugu_song_right');
    setupScroller('hindi_songs_container', 'hindi_song_left', 'hindi_song_right');
    setupScroller('english_songs_container', 'english_song_left', 'english_song_right');
    // Add new scrollers
    setupScroller('tamil_songs_container', 'tamil_song_left', 'tamil_song_right');
    setupScroller('kannada_songs_container', 'kannada_song_left', 'kannada_song_right');
    setupScroller('artists_container', 'pop_artist_left', 'pop_artist_right');
}

function setupScroller(containerId, leftBtnId, rightBtnId) {
    const container = document.getElementById(containerId);
    const leftBtn = document.getElementById(leftBtnId);
    const rightBtn = document.getElementById(rightBtnId);
    if (!container || !leftBtn || !rightBtn) return;
    leftBtn.addEventListener('click', () => container.scrollLeft -= 330);
    rightBtn.addEventListener('click', () => container.scrollLeft += 330);
}

const userProfileButton = document.getElementById('user_profile_button');
const profileModal = document.getElementById('profile_modal');
const closeModal = document.getElementById('close_modal');
userProfileButton.addEventListener('click', () => profileModal.classList.add('active'));
closeModal.addEventListener('click', () => profileModal.classList.remove('active'));

document.querySelectorAll('.playlist h4').forEach(menuItem => {
    menuItem.addEventListener('click', (e) => {
        document.querySelector('.playlist h4.active').classList.remove('active');
        e.currentTarget.classList.add('active');
        const playlistType = e.currentTarget.dataset.playlist;
        if (playlistType === 'liked') {
            const likedSongsList = [...allSongs.values()].filter(song => likedSongs.has(song.id));
            renderPlaylist(likedSongsList, "Liked Songs");
        } else {
            renderPlaylist([...allSongs.values()]); // Pass null to reset title
        }
    });
});

const menu_list_icon = document.getElementById('menu_list');
const menu_side = document.querySelector('.menu_side');
const menu_overlay = document.getElementById('menu_overlay');
function closeMenu() {
    menu_side.classList.remove('active');
    menu_overlay.style.display = 'none';
}
menu_list_icon.addEventListener('click', () => {
    menu_side.classList.add('active');
    menu_overlay.style.display = 'block';
});
menu_overlay.addEventListener('click', closeMenu);

function attachAllEventListeners() {
    masterPlay.onclick = togglePlayPause;
    document.body.addEventListener('click', async (e) => {
        if (e.target.classList.contains('playlistplay')) {
            const clickedId = e.target.id;
            if (index !== clickedId) playSong(clickedId);
            else togglePlayPause();
        }
        if (e.target.classList.contains('like_icon')) {
            toggleLike(e.target.dataset.id);
        }
        // --- NEW: Handle artist card clicks ---
        const artistCard = e.target.closest('.artist_card');
        if (artistCard) {
            const artistName = artistCard.dataset.artistName;
            document.querySelector('.playlist h4.active')?.classList.remove('active');
            renderPlaylist([], `Loading ${artistName}...`); // Show loading state
            const artistSongs = await fetchSongsByQuery(artistName);
            artistSongs.forEach(song => {
                if(!allSongs.has(song.id)) allSongs.set(song.id, song)
            });
            renderPlaylist(artistSongs, `${artistName}'s Top Songs`);
            // Optionally play the first song
            if (artistSongs.length > 0) playSong(artistSongs[0].id);
        }
    });

    document.getElementById('like_master').onclick = () => {
        if (index) toggleLike(index);
    };

    document.querySelectorAll('.songitem').forEach(item => item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('playlistplay') && !e.target.classList.contains('like_icon')) {
            if (window.innerWidth <= 930) closeMenu();
        }
    }));
}

const makeAllplays = () => document.querySelectorAll('.playlistplay').forEach(el => el.classList.replace('bi-pause-circle-fill', 'bi-play-circle-fill'));