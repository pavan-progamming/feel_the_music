// --- DOM ELEMENTS ---
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
let bannerSlideshowInterval;

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
        const [telugu, hindi, artists, featuredAlbums] = await Promise.all([
            fetchSongsByQuery('latest telugu'),
            fetchSongsByQuery('latest hindi'),
            fetchPopularArtists(),
            fetchFeaturedAlbums(['Pushpa', 'Kalki 2898 AD', 'Animal'])
        ]);

        [...telugu, ...hindi].forEach(song => {
            if (!allSongs.has(song.id)) allSongs.set(song.id, song);
        });
        
        const popularSongs = [...telugu.slice(0, 4), ...hindi.slice(0, 4)];
        
        populateAllContentSections({ telugu, hindi, artists, popularSongs, featuredAlbums });
        
        if (popularSongs.length > 0) {
            startBannerSlideshow(popularSongs);
            setupBannerFunctionality(popularSongs);
        }

        currentPlaylist = [...allSongs.values()];
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
async function fetchFeaturedAlbums(albumNames) {
    const albumPromises = albumNames.map(name => 
        fetch(`https://saavn.dev/api/search/albums?query=${encodeURIComponent(name)}&limit=1`)
            .then(res => res.json())
            .then(data => (data.success && data.data.results.length > 0) ? data.data.results[0] : null)
    );
    const results = await Promise.all(albumPromises);
    return results.filter(Boolean).map(album => ({
        id: album.id,
        name: album.name,
        poster: album.image.find(img => img.quality === '500x500')?.url || album.image[0].url,
    }));
}

async function fetchAlbumDetails(albumId) {
    try {
        const albumUrl = `https://saavn.dev/api/albums?id=${albumId}`;
        const albumResponse = await fetch(albumUrl);
        const albumData = await albumResponse.json();
        if (!albumData.success) throw new Error("Failed to fetch album data");
        
        albumData.data.songs.forEach(song => {
            const formattedSong = {
                id: song.id,
                songName: `${song.name}<br><div class="subtitle">${song.artists.primary.map(a => a.name).join(', ')}</div>`,
                poster: albumData.data.image.find(img => img.quality === '500x500')?.url || song.image.find(img => img.quality === '500x500')?.url,
                duration: song.duration,
                audioUrl: song.downloadUrl.find(aud => aud.quality === '320kbps')?.url || song.downloadUrl[0].url
            };
            if (!allSongs.has(formattedSong.id)) {
                allSongs.set(formattedSong.id, formattedSong);
            }
        });
        return albumData.data;
    } catch (error) {
        console.error(`Failed to fetch album details for ID "${albumId}":`, error);
        return null;
    }
}

async function fetchSongsByQuery(query, limit = 20) {
    const apiUrl = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (!data.success || !data.data.results) return [];
        return data.data.results.map(song => ({
            id: song.id,
            songName: `${song.name}<br><div class="subtitle">${song.artists.primary.map(a => a.name).join(', ')}</div>`,
            poster: song.image.find(img => img.quality === '500x500')?.url || song.image[0].url,
            audioUrl: song.downloadUrl.find(aud => aud.quality === '320kbps')?.url || song.downloadUrl[0].url
        }));
    } catch (error) {
        console.error(`Failed to fetch songs for query "${query}":`, error);
        return [];
    }
}

async function fetchPopularArtists() {
    const artistNames = ["Arijit Singh", "Shreya Ghoshal", "Anirudh Ravichander", "Sid Sriram"];
    const artistPromises = artistNames.map(name => fetch(`https://saavn.dev/api/search/artists?query=${encodeURIComponent(name)}&limit=1`).then(res => res.json()));
    const results = await Promise.all(artistPromises);
    return results.filter(res => res.success && res.data.results.length > 0).map(res => {
        const artist = res.data.results[0];
        return { id: artist.id, name: artist.name, image: artist.image.find(img => img.quality === '500x500')?.url || artist.image[0].url };
    });
}

// ================================
// DYNAMIC CONTENT & UI RENDERING
// ================================
function showLoadingState() {
    ['telugu', 'hindi'].forEach(lang => {
        const container = document.getElementById(`${lang}_songs_container`);
        if (container) container.innerHTML = `<p style="padding: 10px; color: #a4a8b4;">Loading...</p>`;
    });
}
function showErrorState() { console.error("Failed to load content."); }

function populateAllContentSections({ telugu, hindi, artists, popularSongs, featuredAlbums }) {
    populateSongSection(document.getElementById('telugu_songs_container'), telugu);
    populateSongSection(document.getElementById('hindi_songs_container'), hindi);
    populateArtistsSection(document.getElementById('artists_container'), artists);
    populateSongSection(document.getElementById('pop_song_container'), popularSongs);
    populateFeaturedAlbums(document.getElementById('featured_albums_container'), featuredAlbums);
    attachAllEventListeners();
}

function populateFeaturedAlbums(container, albums) {
    if (!container || !albums || albums.length === 0) return;
    container.innerHTML = albums.map(album => `
        <li class="album_card" data-album-id="${album.id}">
            <img src="${album.poster}" alt="${album.name}">
            <h5>${album.name}</h5>
        </li>
    `).join('');
}

function populateAlbumView(albumData) {
    const albumView = document.getElementById('album_view');
    const albumSongs = albumData.songs.map(song => allSongs.get(song.id));
    
    albumView.innerHTML = `
        <div id="album_view_header">
            <img id="album_art" src="${albumData.image.find(img => img.quality === '500x500')?.url}" alt="${albumData.name}">
            <div id="album_details">
                <p>Album</p>
                <h1>${albumData.name}</h1>
                <p>${albumData.artists.primary.map(a => a.name).join(', ')}</p>
                <button class="play_album_btn"><i class="bi bi-play-fill"></i> Play</button>
            </div>
        </div>
        <ol id="album_song_list">
            ${albumSongs.map((song, idx) => `
                <li class="album_song_item songitem" data-id="${song.id}">
                    <span class="track_number">${idx + 1}</span>
                    <div class="song_details">${song.songName.split('<br>')[0]}<div class="subtitle">${song.songName.split('<div class="subtitle">')[1]}</div></div>
                    <span class="song_duration">${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}</span>
                </li>
            `).join('')}
        </ol>
    `;
    
    // Add event listener for the main "Play" button on the album page
    albumView.querySelector('.play_album_btn').addEventListener('click', () => {
        currentPlaylist = albumSongs;
        if (albumSongs.length > 0) playSong(albumSongs[0].id);
    });
}

function populateSongSection(container, songList) {
    if (!container || !songList || songList.length === 0) return;
    container.innerHTML = songList.map(song => `
        <li class="songitem" data-id="${song.id}">
            <div class="img_play"><img src="${song.poster}" alt=""><i class="bi playlistplay bi-play-circle-fill"></i></div>
            <h5>${song.songName}</h5>
        </li>
    `).join('');
}

function populateArtistsSection(container, artists) {
    if (!container || !artists || artists.length === 0) return;
    container.innerHTML = artists.map(artist => `
        <li class="artist_card" data-artist-name="${artist.name}">
            <img src="${artist.image}" alt="${artist.name}">
            <h5>${artist.name}</h5>
        </li>
    `).join('');
}

function startBannerSlideshow(bannerPlaylist) {
    let bannerIndex = 0;
    const update = () => updateBanner(bannerPlaylist[bannerIndex]);
    update();
    clearInterval(bannerSlideshowInterval);
    bannerSlideshowInterval = setInterval(() => {
        bannerIndex = (bannerIndex + 1) % bannerPlaylist.length;
        const banner = document.querySelector('#discovery_carousels .content');
        if(banner) {
            banner.classList.add('fade-out');
            setTimeout(() => { update(); banner.classList.remove('fade-out'); }, 300);
        }
    }, 5000);
}

function updateBanner(song) {
    if (!song) return;
    const banner = document.querySelector('#discovery_carousels .content');
    if (!banner) return; 
    const bannerTitle = banner.querySelector('h1');
    const bannerSubtitle = banner.querySelector('p');
    if (bannerTitle && bannerSubtitle) {
        bannerTitle.textContent = song.songName.split('<br>')[0];
        bannerSubtitle.textContent = song.songName.split('<div class="subtitle">')[1].replace('</div>', '');
        banner.style.backgroundImage = `url(${song.poster})`;
    }
}

function setupBannerFunctionality(bannerPlaylist) {
    const banner = document.querySelector('#discovery_carousels .content');
    if (!banner) return;
    const playBtn = banner.querySelector('.buttons button:first-child');
    playBtn.addEventListener('click', () => {
        currentPlaylist = bannerPlaylist;
        const songToPlay = allSongs.get(bannerPlaylist[0].id)
        if (songToPlay) playSong(songToPlay.id);
    });
    banner.addEventListener('mouseenter', () => clearInterval(bannerSlideshowInterval));
    banner.addEventListener('mouseleave', () => startBannerSlideshow(bannerPlaylist));
}

function updateDynamicBackground(posterUrl) {
    if (posterUrl) {
        songSide.style.setProperty('--bg-image', `url(${posterUrl})`);
        songSide.classList.add('has-bg');
    } else {
        songSide.classList.remove('has-bg');
    }
}
function updateNowPlayingIndicator() {
    document.querySelectorAll('.songitem.playing, .album_song_item.playing').forEach(item => item.classList.remove('playing'));
    if (index) {
        document.querySelectorAll(`.songitem[data-id="${index}"], .album_song_item[data-id="${index}"]`).forEach(item => item.classList.add('playing'));
    }
}

// ================================
// PLAYER LOGIC & OTHER FUNCTIONS
// ================================
function playSong(songId, autoPlay = true) {
    index = String(songId);
    const songData = allSongs.get(index);
    if (!songData) return;
    music.src = songData.audioUrl;
    poster_master_play.src = songData.poster;
    title.innerHTML = songData.songName;
    updateDynamicBackground(songData.poster);
    updateLikeButtonsUI();
    updateNowPlayingIndicator();
    if (autoPlay) music.play().catch(e => console.error("Audio playback failed:", e));
    saveState();
}
function togglePlayPause() {
    if (!music.src) {
        if (currentPlaylist && currentPlaylist.length > 0) playSong(currentPlaylist[0].id);
    } else {
        if (music.paused) music.play();
        else music.pause();
    }
}
function setupSearch() {
    // Search logic remains the same
}
function saveState() {
    localStorage.setItem("playerState", JSON.stringify({ lastSongId: index, likedSongs: [...likedSongs], isShuffle, repeatMode, volume: music.volume }));
}
function loadState() {
    // Load state logic remains the same
}
async function restoreLastSong() {
    // Restore last song logic remains the same
}
// All other player functions (like, next, back, timeupdate, etc.) remain largely the same.
// ... (All other helper functions from your previous JS file would go here, unchanged)
// We will include them for completeness.

function setupScrollers() {
    setupScroller('pop_song_container', 'pop_song_left', 'pop_song_right');
    setupScroller('featured_albums_container', 'album_left', 'album_right');
    setupScroller('telugu_songs_container', 'telugu_song_left', 'telugu_song_right');
    setupScroller('hindi_songs_container', 'hindi_song_left', 'hindi_song_right');
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

function attachAllEventListeners() {
    masterPlay.onclick = togglePlayPause;
    document.body.addEventListener('click', async (e) => {
        // Handle song item clicks (from carousels or album view)
        const songItem = e.target.closest('.songitem');
        if (songItem) {
            const clickedId = songItem.dataset.id;
            // If it's from a carousel, set that as the playlist
            const songContainer = songItem.closest('.pop_song');
            if(songContainer) {
                 const containerId = songContainer.id;
                 if (containerId === 'pop_song_container') currentPlaylist = [...allSongs.values()].slice(0,8);
                 if (containerId === 'telugu_songs_container') currentPlaylist = [...allSongs.values()].filter(s => s.language === 'telugu');
                 if (containerId === 'hindi_songs_container') currentPlaylist = [...allSongs.values()].filter(s => s.language === 'hindi');
            }
            // If it's an album song, currentPlaylist is already set
            
            if (index !== clickedId) playSong(clickedId);
            else togglePlayPause();
        }
        
        // Handle artist card clicks
        const artistCard = e.target.closest('.artist_card');
        if (artistCard) {
            // Logic to fetch and display artist songs
        }

        // Handle featured album clicks
        const albumCard = e.target.closest('.album_card');
        if(albumCard) {
            const albumId = albumCard.dataset.albumId;
            const discoveryView = document.getElementById('discovery_carousels');
            const albumView = document.getElementById('album_view');
            
            discoveryView.classList.add('hidden');
            albumView.classList.remove('hidden');
            albumView.innerHTML = `<p style="padding: 20px; color: #a4a8b4;">Loading album...</p>`;
            
            const albumData = await fetchAlbumDetails(albumId);
            if (albumData) {
                populateAlbumView(albumData);
                currentPlaylist = albumData.songs.map(s => allSongs.get(s.id));
            } else {
                 albumView.innerHTML = `<p style="padding: 20px; color: #fff;">Could not load album.</p>`;
            }
        }
    });

    // Sidebar navigation
    document.querySelectorAll('.playlist h4').forEach(menuItem => {
        menuItem.addEventListener('click', (e) => {
            clearInterval(bannerSlideshowInterval);
            document.querySelector('.playlist h4.active').classList.remove('active');
            e.currentTarget.classList.add('active');
            const playlistType = e.currentTarget.dataset.playlist;
            
            const discoveryView = document.getElementById('discovery_carousels');
            const libraryView = document.getElementById('library_view');
            const albumView = document.getElementById('album_view');

            // Hide all views first
            discoveryView.classList.add('hidden');
            libraryView.classList.add('hidden');
            albumView.classList.add('hidden');

            switch (playlistType) {
                case 'liked':
                    libraryView.classList.remove('hidden');
                    populateLikedSongsView();
                    break;
                case 'library':
                    libraryView.classList.remove('hidden');
                    populateLibraryView();
                    break;
                case 'all':
                default:
                    discoveryView.classList.remove('hidden');
                    startBannerSlideshow([...allSongs.values()].slice(0,8));
                    break;
            }
        });
    });

    // Other listeners (like, modals, etc.)
    document.getElementById('like_master').onclick = () => { if (index) toggleLike(index); };
}

// --- PLAYER CONTROLS (UNCHANGED) ---
music.onplay = () => { wave.classList.add('active1'); masterPlay.classList.replace('bi-play-fill', 'bi-pause-fill'); };
music.onpause = () => { wave.classList.remove('active1'); masterPlay.classList.replace('bi-pause-fill', 'bi-play-fill'); };
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
seek.addEventListener('input', () => { if (music.duration) music.currentTime = (seek.value * music.duration) / 100; });
music.addEventListener('ended', () => { if (repeatMode === 2) playSong(index); else next.click(); });
next.addEventListener('click', () => {
    if (!currentPlaylist || currentPlaylist.length === 0) return;
    if (isShuffle) {
        let randomIndex;
        do { randomIndex = Math.floor(Math.random() * currentPlaylist.length); } while (currentPlaylist[randomIndex].id == index && currentPlaylist.length > 1);
        playSong(currentPlaylist[randomIndex].id);
        return;
    }
    const currentIndexInPlaylist = currentPlaylist.findIndex(song => song.id == index);
    if (currentIndexInPlaylist === -1 || currentIndexInPlaylist === currentPlaylist.length - 1) {
        if (repeatMode === 1 && currentPlaylist.length > 0) playSong(currentPlaylist[0].id);
    } else {
        playSong(currentPlaylist[currentIndexInPlaylist + 1].id);
    }
});
back.addEventListener('click', () => {
    if (!currentPlaylist || currentPlaylist.length === 0) return;
    const currentIndexInPlaylist = currentPlaylist.findIndex(song => song.id == index);
    if (currentIndexInPlaylist <= 0) {
        if (currentPlaylist.length > 0) playSong(currentPlaylist[currentPlaylist.length - 1].id);
    }
    else playSong(currentPlaylist[currentIndexInPlaylist - 1].id);
});
shuffleBtn.addEventListener('click', () => { isShuffle = !isShuffle; shuffleBtn.classList.toggle('active', isShuffle); saveState(); });
repeatBtn.addEventListener('click', () => { repeatMode = (repeatMode + 1) % 3; repeatBtn.classList.toggle('active', repeatMode !== 0); saveState(); });
vol.addEventListener('input', () => { music.volume = vol.value / 100; saveState(); });

// Other utility functions
function toggleLike(songId) { /* ... */ }
function updateLikeButtonsUI() { /* ... */ }
function updateProfileStats() { /* ... */ }
function populateLikedSongsView() { /* ... */ }
function populateLibraryView() { /* ... */ }

// Mobile menu
const menu_list_icon = document.getElementById('menu_list');
const menu_side = document.querySelector('.menu_side');
const menu_overlay = document.getElementById('menu_overlay');
function closeMenu() { menu_side.classList.remove('active'); menu_overlay.style.display = 'none'; }
menu_list_icon.addEventListener('click', () => { menu_side.classList.add('active'); menu_overlay.style.display = 'block'; });
menu_overlay.addEventListener('click', closeMenu);