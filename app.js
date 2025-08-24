// --- INITIALIZATION ---
window.onload = () => {
    loadState();
    renderPlaylist(currentPlaylist); // Renders sidebar playlist
    populateAllContentSections();    // Renders all main content song carousels
    setupScrollers();                // Activates all arrow buttons
    setupSearch();                   // ** NEW: Activates the search bar **
    updateLikeButtonsUI();
    updateProfileStats();
    restoreLastSong();
};

// --- AUDIO ---
const music = new Audio();

// --- DATA & STATE ---
const songs = [
    // English Songs
    { id: '1', songName: `On My Way<br><div class="subtitle">Alan Walker</div>`, poster: "img/1.jpg", language: "english" },
    { id: '2', songName: `Alan Walker-Fade<br><div class="subtitle">Alan Walker</div>`, poster: "img/2.jpg", language: "english" },
    { id: '3', songName: `Cartoon - On & On<br><div class="subtitle">Daniel Levi</div>`, poster: "img/3.jpg", language: "english" },
    { id: '4', songName: `Warriyo - Mortals<br><div class="subtitle">Mortals</div>`, poster: "img/4.jpg", language: "english" },
    { id: '5', songName: `Ertugrul Gazi<br><div class="subtitle">Ertugrul</div>`, poster: "img/5.jpg", language: "english" },
    { id: '6', songName: `Electronic Music<br><div class="subtitle">Electro</div>`, poster: "img/6.jpg", language: "english" },
    // Hindi Songs
    { id: '7', songName: `Agar Tum Sath Ho<br><div class="subtitle">Tamashaa</div>`, poster: "img/7.jpg", language: "hindi" },
    { id: '8', songName: `Suna Hai<br><div class="subtitle">Neha Kakker</div>`, poster: "img/8.jpg", language: "hindi" },
    { id: '9', songName: `Dilber<br><div class="subtitle">Satyameva Jayate</div>`, poster: "img/9.jpg", language: "hindi" },
    { id: '10', songName: `Duniya<br><div class="subtitle">Luka Chuppi</div>`, poster: "img/10.jpg", language: "hindi" },
    { id: '11', songName: `Lagdi Lahore Di<br><div class="subtitle">Street Dancer</div>`, poster: "img/11.jpg", language: "hindi" },
    { id: '12', songName: `Putt Jatt Da<br><div class="subtitle">Putt Jatt Da</div>`, poster: "img/12.jpg", language: "hindi" },
    { id: '13', songName: `Baarishein<br><div class="subtitle">Atif Aslam</div>`, poster: "img/13.jpg", language: "hindi" },
    { id: '14', songName: `Vaaste<br><div class="subtitle">Dhvani Bhanushali</div>`, poster: "img/14.jpg", language: "hindi" },
    { id: '15', songName: `Lut Gaye<br><div class="subtitle">Jubin Nautiyal</div>`, poster: "img/15.jpg", language: "hindi" },
    { id: '16', songName: `Tu Meri Zindagi Hai<br><div class="subtitle">Jubin Nautiyal</div>`, poster: "img/16.jpg", language: "hindi" },
    { id: '17', songName: `Batao Yaad Hai Tumko<br><div class="subtitle">Rahat Fateh Ali Khan</div>`, poster: "img/17.jpg", language: "hindi" },
    { id: '18', songName: `Mere Dhol Judaiyan<br><div class="subtitle">Ali Sethi Seha Gill</div>`, poster: "img/18.jpg", language: "hindi" },
    { id: '19', songName: `Eh Munde Pagal Ne Saare<br><div class="subtitle">AP Dhillon</div>`, poster: "img/19.jpg", language: "hindi" },
    { id: '20', songName: `Dunny 82k<br><div class="subtitle">AP Dhillon</div>`, poster: "img/20.jpg", language: "hindi" },
    // Telugu Songs (New)
    { id: '21', songName: `Butta Bomma<br><div class="subtitle">Ala Vaikunthapurramuloo</div>`, poster: "img/1.jpg", language: "telugu" },
    { id: '22', songName: `Ramuloo Ramulaa<br><div class="subtitle">Ala Vaikunthapurramuloo</div>`, poster: "img/2.jpg", language: "telugu" },
    { id: '23', songName: `Samajavaragamana<br><div class="subtitle">Ala Vaikunthapurramuloo</div>`, poster: "img/3.jpg", language: "telugu" },
    { id: '24', songName: `Oo Antava<br><div class="subtitle">Pushpa</div>`, poster: "img/4.jpg", language: "telugu" },
    { id: '25', songName: `Naatu Naatu<br><div class="subtitle">RRR</div>`, poster: "img/5.jpg", language: "telugu" }
];

let likedSongs = new Set();
let currentPlaylist = songs;
let index = null; // will always hold a STRING (song.id)
let isShuffle = false;
let repeatMode = 0; // 0=none,1=all,2=one

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

// ================================
// LOCAL STORAGE STATE
// ================================
function saveState() {
    localStorage.setItem("playerState", JSON.stringify({
        index,
        likedSongs: [...likedSongs],
        isShuffle,
        repeatMode,
        volume: music.volume
    }));
}
function loadState() {
    try {
        const state = JSON.parse(localStorage.getItem("playerState"));
        if (!state) return;
        index = state.index ?? null;
        likedSongs = new Set(state.likedSongs || []);
        isShuffle = !!state.isShuffle;
        repeatMode = state.repeatMode || 0;
        music.volume = state.volume ?? 1;
        vol.value = music.volume * 100;
    } catch (e) {
        console.warn("Failed to load state", e);
    }
}
function restoreLastSong() {
    if (index) {
        playSong(index, false); // load last song but don’t auto play
    }
}

// ================================
// DYNAMIC CONTENT RENDERING
// ================================

// Renders the LEFT SIDEBAR playlist
function renderPlaylist(playlist) {
    const songListContainer = document.querySelector('.menu_song .song-list-container');
    songListContainer.innerHTML = '';
    currentPlaylist = playlist;

    if (playlist.length === 0) {
        songListContainer.innerHTML = '<li class="no-songs" style="padding: 20px;">You have no liked songs yet.</li>';
        return;
    }

    playlist.forEach((song, idx) => {
        const cleanSongName = song.songName.replace(/<[^>]*>?/gm, ' ');
        const mainLi = document.createElement('li');
        mainLi.className = 'songitem';
        mainLi.innerHTML = `
            <span>${String(idx + 1).padStart(2, '0')}</span>
            <img src="${song.poster}" alt="${cleanSongName}">
            <h5>${song.songName}</h5>
            <i class="bi bi-heart like_icon" data-id="${song.id}"></i>
            <i class="bi playlistplay bi-play-circle-fill" id="${song.id}"></i>
        `;
        songListContainer.appendChild(mainLi);
    });

    attachAllEventListeners();
    updateLikeButtonsUI();
}

// Populates a single song section (e.g., Telugu, Hindi) in the MAIN CONTENT area
function populateSongSection(container, songList) {
    if (!container) return;
    container.innerHTML = ''; 
    songList.forEach(song => {
        const cleanSongName = song.songName.replace(/<[^>]*>?/gm, ' ');
        const li = document.createElement('li');
        li.className = 'songitem';
        li.innerHTML = `
            <div class="img_play">
                <img src="${song.poster}" alt="${cleanSongName}">
                <i class="bi playlistplay bi-play-circle-fill" id="${song.id}"></i>
            </div>
            <h5>${song.songName}</h5>
        `;
        container.appendChild(li);
    });
}

// Populates all song carousels in the MAIN CONTENT area
function populateAllContentSections() {
    // 1. Popular Songs (all songs)
    populateSongSection(document.getElementById('pop_song_container'), songs);

    // 2. Telugu Songs
    const teluguSongs = songs.filter(s => s.language === 'telugu');
    populateSongSection(document.getElementById('telugu_songs_container'), teluguSongs);

    // 3. Hindi Songs
    const hindiSongs = songs.filter(s => s.language === 'hindi');
    populateSongSection(document.getElementById('hindi_songs_container'), hindiSongs);

    // 4. English Songs
    const englishSongs = songs.filter(s => s.language === 'english');
    populateSongSection(document.getElementById('english_songs_container'), englishSongs);
    
    // Re-attach listeners for all the newly created play buttons
    attachAllEventListeners();
}

// ================================
// SEARCH FUNCTIONALITY
// ================================

function setupSearch() {
    const searchInput = document.querySelector('.search input');
    const searchResultsContainer = document.querySelector('.search_results');

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();

        if (searchTerm.length === 0) {
            searchResultsContainer.style.visibility = 'hidden';
            searchResultsContainer.style.opacity = '0';
            return;
        }

        const filteredSongs = songs.filter(song => {
            // Clean the song name by removing HTML tags for accurate searching
            const cleanSongName = song.songName.replace(/<[^>]*>?/gm, ' ').toLowerCase();
            return cleanSongName.includes(searchTerm);
        });

        if (filteredSongs.length > 0) {
            const resultsHTML = filteredSongs.map(song => {
                const [title, subtitle] = song.songName.split('<br>');
                return `
                    <a href="#" class="card" data-id="${song.id}">
                        <img src="${song.poster}" alt="">
                        <div class="content">
                            ${title}
                            <div class="subtitle">${subtitle.replace(/<[^>]*>?/gm, '')}</div>
                        </div>
                    </a>
                `;
            }).join('');
            searchResultsContainer.innerHTML = resultsHTML;
        } else {
            searchResultsContainer.innerHTML = `<p style="padding: 10px; color: #fff;">No results found</p>`;
        }
        
        searchResultsContainer.style.visibility = 'visible';
        searchResultsContainer.style.opacity = '1';
    });

    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search')) {
            searchResultsContainer.style.visibility = 'hidden';
            searchResultsContainer.style.opacity = '0';
        }
    });

    // Handle clicking on a search result
    searchResultsContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (card) {
            e.preventDefault(); // Prevent the # from being added to the URL
            const songId = card.dataset.id;
            playSong(songId);
            // Clear input and hide results after selection
            searchInput.value = '';
            searchResultsContainer.style.visibility = 'hidden';
            searchResultsContainer.style.opacity = '0';
        }
    });
}


// ================================
// LIKE SONGS
// ================================
function toggleLike(songId) {
    if (likedSongs.has(songId)) likedSongs.delete(songId);
    else likedSongs.add(songId);

    saveState();
    updateLikeButtonsUI();
    updateProfileStats();

    // Refresh liked playlist if active
    if (document.querySelector('[data-playlist="liked"].active')) {
        renderPlaylist(songs.filter(song => likedSongs.has(song.id)));
    }
}
function updateLikeButtonsUI() {
    document.querySelectorAll('.like_icon').forEach(icon => {
        if (likedSongs.has(icon.dataset.id)) {
            icon.classList.add('liked', 'bi-heart-fill');
            icon.classList.remove('bi-heart');
        } else {
            icon.classList.remove('liked', 'bi-heart-fill');
            icon.classList.add('bi-heart');
        }
    });
    const likeMaster = document.getElementById('like_master');
    if (index && likedSongs.has(index)) {
        likeMaster.classList.add('liked', 'bi-heart-fill');
        likeMaster.classList.remove('bi-heart');
    } else {
        likeMaster.classList.remove('liked', 'bi-heart-fill');
        likeMaster.classList.add('bi-heart');
    }
}

// ================================
// PLAYER LOGIC
// ================================
function playSong(songId, autoPlay = true) {
    index = String(songId);
    const songData = songs.find(s => s.id === index);
    if (!songData) return;

    makeAllplays();
    music.src = `audio/${index}.mp3`;
    poster_master_play.src = songData.poster;
    title.innerHTML = songData.songName;

    if (autoPlay) music.play();

    updateLikeButtonsUI();
    makeAllBackgrounds();
    document.querySelectorAll('.songitem').forEach(item => {
        const itemPlayButton = item.querySelector('.playlistplay');
        if (itemPlayButton && itemPlayButton.id == index) {
            item.style.background = "rgb(105,105,105,.1)";
        }
    });

    saveState();
}
function togglePlayPause() {
    if (!index && currentPlaylist.length > 0) {
        playSong(currentPlaylist[0].id);
    } else {
        if (music.paused || music.currentTime <= 0) music.play();
        else music.pause();
    }
}

// ================================
// AUDIO EVENTS
// ================================
music.onplay = () => {
    wave.classList.add('active1');
    masterPlay.classList.replace('bi-play-fill', 'bi-pause-fill');
    document.querySelectorAll(`#${index}.playlistplay`).forEach(btn => btn.classList.replace('bi-play-circle-fill', 'bi-pause-circle-fill'));
};
music.onpause = () => {
    wave.classList.remove('active1');
    masterPlay.classList.replace('bi-pause-fill', 'bi-play-fill');
    document.querySelectorAll(`#${index}.playlistplay`).forEach(btn => btn.classList.replace('bi-pause-circle-fill', 'bi-play-circle-fill'));
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

// ================================
// CONTROLS
// ================================
next.addEventListener('click', () => {
    if (currentPlaylist.length === 0) return;
    if (isShuffle) {
        let nextIndex;
        do { nextIndex = Math.floor(Math.random() * currentPlaylist.length); } while (currentPlaylist[nextIndex].id == index && currentPlaylist.length > 1);
        playSong(currentPlaylist[nextIndex].id);
        return;
    }
    const currentIndexInPlaylist = currentPlaylist.findIndex(song => song.id == index);
    if (currentIndexInPlaylist === currentPlaylist.length - 1) {
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

// ================================
// UI & NAVIGATION
// ================================
function updateProfileStats() {
    document.getElementById('liked_songs_count').innerText = likedSongs.size;
}

// Function to setup a generic scroller
function setupScroller(containerId, leftBtnId, rightBtnId) {
    const container = document.getElementById(containerId);
    const leftBtn = document.getElementById(leftBtnId);
    const rightBtn = document.getElementById(rightBtnId);
    if (!container || !leftBtn || !rightBtn) return;

    leftBtn.addEventListener('click', () => container.scrollLeft -= 330);
    rightBtn.addEventListener('click', () => container.scrollLeft += 330);
}

// Setup all scrollers on the page
function setupScrollers() {
    setupScroller('pop_song_container', 'pop_song_left', 'pop_song_right');
    setupScroller('telugu_songs_container', 'telugu_song_left', 'telugu_song_right');
    setupScroller('hindi_songs_container', 'hindi_song_left', 'hindi_song_right');
    setupScroller('english_songs_container', 'english_song_left', 'english_song_right');
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
        if (playlistType === 'liked') renderPlaylist(songs.filter(song => likedSongs.has(song.id)));
        else renderPlaylist(songs);
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

// ================================
// EVENT ATTACH
// ================================
function attachAllEventListeners() {
    masterPlay.onclick = togglePlayPause;
    document.querySelectorAll('.playlistplay').forEach(btn => {
        btn.onclick = (el) => {
            const clickedIndex = el.target.id;
            if (index != clickedIndex) playSong(clickedIndex);
            else togglePlayPause();
        };
    });
    document.querySelectorAll('.like_icon').forEach(icon => {
        icon.onclick = (el) => toggleLike(el.target.dataset.id);
    });
    document.getElementById('like_master').onclick = () => {
        if (index) toggleLike(index);
    };
    document.querySelectorAll('.songitem').forEach(item => item.addEventListener('click', closeMenu));
}

// ================================
// HELPERS
// ================================
const makeAllplays = () => document.querySelectorAll('.playlistplay').forEach(el => el.classList.replace('bi-pause-circle-fill', 'bi-play-circle-fill'));
const makeAllBackgrounds = () => document.querySelectorAll('.songitem').forEach(el => el.style.background = 'rgba(105, 105, 105, 0)');