// --- INITIALIZATION ---
window.onload = () => {
    // Load liked songs from storage first
    loadLikedSongs();
    // Then render the initial full playlist
    renderPlaylist(songs);
    // Then update the UI based on liked songs
    updateLikeButtonsUI();
    updateProfileStats();
};

const music = new Audio('audio/1.mp3');

// --- DATA & STATE ---
const songs = [
    { id: '1', songName: `On My Way<br><div class="subtitle">Alan Walker</div>`, poster: "img/1.jpg" },
    { id: '2', songName: `Alan Walker-Fade<br><div class="subtitle">Alan Walker</div>`, poster: "img/2.jpg" },
    { id: '3', songName: `Cartoon - On & On<br><div class="subtitle">Daniel Levi</div>`, poster: "img/3.jpg" },
    { id: '4', songName: `Warriyo - Mortals<br><div class="subtitle">Mortals</div>`, poster: "img/4.jpg" },
    { id: '5', songName: `Ertugrul Gazi<br><div class="subtitle">Ertugrul</div>`, poster: "img/5.jpg" },
    { id: '6', songName: `Electronic Music<br><div class="subtitle">Electro</div>`, poster: "img/6.jpg" },
    { id: '7', songName: `Agar Tum Sath Ho<br><div class="subtitle">Tamashaa</div>`, poster: "img/7.jpg" },
    { id: '8', songName: `Suna Hai<br><div class="subtitle">Neha Kakker</div>`, poster: "img/8.jpg" },
    { id: '9', songName: `Dilber<br><div class="subtitle">Satyameva Jayate</div>`, poster: "img/9.jpg" },
    { id: '10', songName: `Duniya<br><div class="subtitle">Luka Chuppi</div>`, poster: "img/10.jpg" },
    { id: '11', songName: `Lagdi Lahore Di<br><div class="subtitle">Street Dancer</div>`, poster: "img/11.jpg" },
    { id: '12', songName: `Putt Jatt Da<br><div class="subtitle">Putt Jatt Da</div>`, poster: "img/12.jpg" },
    { id: '13', songName: `Baarishein<br><div class="subtitle">Atif Aslam</div>`, poster: "img/13.jpg" },
    { id: '14', songName: `Vaaste<br><div class="subtitle">Dhvani Bhanushali</div>`, poster: "img/14.jpg" },
    { id: '15', songName: `Lut Gaye<br><div class="subtitle">Jubin Nautiyal</div>`, poster: "img/15.jpg" },
    { id: '16', songName: `Tu Meri Zindagi Hai<br><div class="subtitle">Jubin Nautiyal</div>`, poster: "img/16.jpg" },
    { id: '17', songName: `Batao Yaad Hai Tumko<br><div class="subtitle">Rahat Fateh Ali Khan</div>`, poster: "img/17.jpg" },
    { id: '18', songName: `Mere Dhol Judaiyan<br><div class="subtitle">Ali Sethi Seha Gill</div>`, poster: "img/18.jpg" },
    { id: '19', songName: `Eh Munde Pagal Ne Saare<br><div class="subtitle">AP Dhillon</div>`, poster: "img/19.jpg" },
    { id: '20', songName: `Dunny 82k<br><div class="subtitle">AP Dhillon</div>`, poster: "img/20.jpg" }
];
let likedSongs = new Set();
let currentPlaylist = songs;
let index = 0;
let isShuffle = false;
let repeatMode = 0; // 0: no-repeat, 1: repeat-playlist, 2: repeat-one-song

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

// --- DYNAMIC CONTENT RENDERING ---
function renderPlaylist(playlist) {
    const songListContainer = document.querySelector('.menu_song .song-list-container');
    const popSongContainer = document.querySelector('.pop_song');
    
    songListContainer.innerHTML = '';
    popSongContainer.innerHTML = ''; // Clear both lists
    currentPlaylist = playlist; // Update current playlist

    if (playlist.length === 0) {
        songListContainer.innerHTML = '<li class="no-songs">You have no liked songs yet.</li>';
        return;
    }

    playlist.forEach((song, idx) => {
        const cleanSongName = song.songName.replace(/<[^>]*>?/gm, ' ');

        // Main Playlist Item
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

        // Popular Song Item (only if rendering all songs)
        if (playlist === songs) {
            const popLi = document.createElement('li');
            popLi.className = 'songitem';
            popLi.innerHTML = `
                <div class="img_play">
                    <img src="${song.poster}" alt="${cleanSongName}">
                    <i class="bi playlistplay bi-play-circle-fill" id="${song.id}"></i>
                </div>
                <h5>${song.songName}</h5>
            `;
            popSongContainer.appendChild(popLi);
        }
    });

    // Re-attach all event listeners for the new elements
    attachAllEventListeners();
    updateLikeButtonsUI();
}

// --- LIKED SONGS LOGIC ---
function loadLikedSongs() {
    const savedLikes = JSON.parse(localStorage.getItem('likedSongs')) || [];
    likedSongs = new Set(savedLikes);
}
function saveLikedSongs() {
    localStorage.setItem('likedSongs', JSON.stringify(Array.from(likedSongs)));
}
function toggleLike(songId) {
    if (likedSongs.has(songId)) {
        likedSongs.delete(songId);
    } else {
        likedSongs.add(songId);
    }
    saveLikedSongs();
    updateLikeButtonsUI();
    updateProfileStats();

    // If viewing liked songs and un-like a song, re-render the list
    if (document.querySelector('[data-playlist="liked"].active')) {
        const likedSongsArray = songs.filter(song => likedSongs.has(song.id));
        renderPlaylist(likedSongsArray);
    }
}
function updateLikeButtonsUI() {
    document.querySelectorAll('.like_icon').forEach(icon => {
        if (likedSongs.has(icon.dataset.id)) {
            icon.classList.add('liked');
            icon.classList.remove('bi-heart');
            icon.classList.add('bi-heart-fill');
        } else {
            icon.classList.remove('liked');
            icon.classList.remove('bi-heart-fill');
            icon.classList.add('bi-heart');
        }
    });
    // Sync master player like button
    const likeMaster = document.getElementById('like_master');
    if (likedSongs.has(String(index))) {
        likeMaster.classList.add('liked', 'bi-heart-fill');
        likeMaster.classList.remove('bi-heart');
    } else {
        likeMaster.classList.remove('liked', 'bi-heart-fill');
        likeMaster.classList.add('bi-heart');
    }
}

// --- CORE PLAYER LOGIC ---
function playSong(songId) {
    index = songId;
    const songData = songs.find(s => s.id == index);
    if (!songData) return;

    makeAllplays();
    music.src = `audio/${index}.mp3`;
    poster_master_play.src = songData.poster;
    title.innerHTML = songData.songName;
    music.play();
    
    wave.classList.add('active1');
    masterPlay.classList.remove('bi-play-fill');
    masterPlay.classList.add('bi-pause-fill');
    
    document.getElementById(index)?.classList.remove('bi-play-circle-fill');
    document.getElementById(index)?.classList.add('bi-pause-circle-fill');
    
    updateLikeButtonsUI();
    makeAllBackgrounds();
    Array.from(document.getElementsByClassName('songitem')).forEach(item => {
        const itemPlayButton = item.querySelector('.playlistplay');
        if (itemPlayButton && itemPlayButton.id == index) {
            item.style.background = "rgb(105,105,105,.1)";
        }
    });
}
function togglePlayPause() {
    if (!music.src || music.src.endsWith('/')) return; // Don't play if no song is loaded
    if (music.paused || music.currentTime <= 0) {
        music.play();
    } else {
        music.pause();
    }
}
music.onplay = () => {
    wave.classList.add('active1');
    masterPlay.classList.remove('bi-play-fill');
    masterPlay.classList.add('bi-pause-fill');
    document.getElementById(index)?.classList.remove('bi-play-circle-fill');
    document.getElementById(index)?.classList.add('bi-pause-circle-fill');
};
music.onpause = () => {
    wave.classList.remove('active1');
    masterPlay.classList.add('bi-play-fill');
    masterPlay.classList.remove('bi-pause-fill');
    document.getElementById(index)?.classList.add('bi-play-circle-fill');
    document.getElementById(index)?.classList.remove('bi-pause-circle-fill');
};

const makeAllplays = () => Array.from(document.getElementsByClassName('playlistplay')).forEach(el => el.classList.replace('bi-pause-circle-fill', 'bi-play-circle-fill'));
const makeAllBackgrounds = () => Array.from(document.getElementsByClassName('songitem')).forEach(el => el.style.background = 'rgba(105, 105, 105, 0)');

// --- PLAYER CONTROLS & UPDATES ---
music.addEventListener('timeupdate', () => {
    const { currentTime, duration } = music;
    if (duration) {
        let min_dur = Math.floor(duration / 60);
        let sec_dur = Math.floor(duration % 60);
        currentEnd.innerText = `${min_dur}:${String(sec_dur).padStart(2, '0')}`;
    }
    let min_curr = Math.floor(currentTime / 60);
    let sec_curr = Math.floor(currentTime % 60);
    currentStart.innerText = `${min_curr}:${String(sec_curr).padStart(2, '0')}`;

    const progressBar = (currentTime / duration) * 100;
    seek.value = isNaN(progressBar) ? 0 : progressBar;
    bar2.style.width = `${seek.value}%`;
    dot.style.left = `${seek.value}%`;
});

seek.addEventListener('change', () => {
    if (music.duration) music.currentTime = (seek.value * music.duration) / 100;
});

music.addEventListener('ended', () => {
    if (repeatMode === 2) { // Repeat one
        playSong(index);
    } else {
        next.click();
    }
});

next.addEventListener('click', () => {
    if (isShuffle) {
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * currentPlaylist.length);
        } while (currentPlaylist[nextIndex].id == index && currentPlaylist.length > 1);
        playSong(currentPlaylist[nextIndex].id);
        return;
    }

    const currentIndexInPlaylist = currentPlaylist.findIndex(song => song.id == index);
    if (currentIndexInPlaylist === currentPlaylist.length - 1) {
        if (repeatMode === 1) { // Repeat playlist
            playSong(currentPlaylist[0].id);
        }
    } else {
        playSong(currentPlaylist[currentIndexInPlaylist + 1].id);
    }
});

back.addEventListener('click', () => {
    const currentIndexInPlaylist = currentPlaylist.findIndex(song => song.id == index);
    if (currentIndexInPlaylist === 0) {
        playSong(currentPlaylist[currentPlaylist.length - 1].id);
    } else {
        playSong(currentPlaylist[currentIndexInPlaylist - 1].id);
    }
});

shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
});

repeatBtn.addEventListener('click', () => {
    repeatMode = (repeatMode + 1) % 3;
    repeatBtn.classList.toggle('active', repeatMode !== 0);
    repeatBtn.classList.toggle('repeat-one', repeatMode === 2);
    if (repeatMode === 0) repeatBtn.classList.replace('bi-repeat-1', 'bi-repeat');
    if (repeatMode === 1) repeatBtn.classList.replace('bi-repeat', 'bi-repeat');
    if (repeatMode === 2) repeatBtn.classList.replace('bi-repeat', 'bi-repeat-1');
});

// --- VOLUME ---
const vol = document.getElementById('vol');
vol.addEventListener('change', () => { music.volume = vol.value / 100; });

// --- SEARCH ---
const searchInput = document.querySelector('.search input');
const searchResults = document.querySelector('.search .search_results');
// ... (search functionality remains the same)

// --- PROFILE MODAL ---
const userProfileButton = document.getElementById('user_profile_button');
const profileModal = document.getElementById('profile_modal');
const closeModal = document.getElementById('close_modal');
function updateProfileStats() {
    document.getElementById('liked_songs_count').innerText = likedSongs.size;
}
userProfileButton.addEventListener('click', () => profileModal.classList.add('active'));
closeModal.addEventListener('click', () => profileModal.classList.remove('active'));

// --- MENU & PLAYLIST SWITCHING ---
document.querySelectorAll('.playlist h4').forEach(menuItem => {
    menuItem.addEventListener('click', (e) => {
        document.querySelector('.playlist h4.active').classList.remove('active');
        e.currentTarget.classList.add('active');
        
        const playlistType = e.currentTarget.dataset.playlist;
        if (playlistType === 'liked') {
            const likedSongsArray = songs.filter(song => likedSongs.has(song.id));
            renderPlaylist(likedSongsArray);
        } else {
            renderPlaylist(songs);
        }
    });
});

// --- ATTACH ALL DYNAMIC LISTENERS ---
function attachAllEventListeners() {
    // Playlist play/pause
    Array.from(document.getElementsByClassName('playlistplay')).forEach((e) => {
        e.addEventListener('click', (el) => {
            const clickedIndex = el.target.id;
            if (index != clickedIndex) playSong(clickedIndex);
            else togglePlayPause();
        });
    });
    // Like icons
    Array.from(document.getElementsByClassName('like_icon')).forEach((e) => {
        e.addEventListener('click', (el) => {
            toggleLike(el.target.dataset.id);
        });
    });
    // Master Like button
    document.getElementById('like_master').addEventListener('click', () => {
        if (index > 0) toggleLike(String(index));
    });
    // Mobile menu close
    Array.from(document.getElementsByClassName('songitem')).forEach(item => {
        item.addEventListener('click', closeMenu);
    });
}

// --- MOBILE MENU ---
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