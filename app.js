const music = new Audio('audio/1.mp3');

// --- DATA: Array of all songs ---
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

// --- DYNAMICALLY CREATE POPULAR SONGS LIST ---
const pop_song_container = document.querySelector('.pop_song');
songs.forEach(song => {
    const li = document.createElement('li');
    li.className = 'songitem';
    li.innerHTML = `
        <div class="img_play">
            <img src="${song.poster}" alt="">
            <i class="bi playlistplay bi-play-circle-fill" id="${song.id}"></i>
        </div>
        <h5>${song.songName}</h5>
    `;
    pop_song_container.appendChild(li);
});


// --- MASTER PLAY BUTTON ---
let masterPlay = document.getElementById('masterPlay');
let wave = document.getElementById('wave');
let index = 0; // Keep track of the currently playing song index

// --- CONSOLIDATED PLAY/PAUSE LOGIC ---
function togglePlayPause() {
    if (music.paused || music.currentTime <= 0) {
        music.play();
        wave.classList.add('active1');
        masterPlay.classList.remove('bi-play-fill');
        masterPlay.classList.add('bi-pause-fill');
        // Sync the list icon to pause
        const currentSongIcon = document.getElementById(index);
        if (currentSongIcon) {
            currentSongIcon.classList.remove('bi-play-circle-fill');
            currentSongIcon.classList.add('bi-pause-circle-fill');
        }
    } else {
        music.pause();
        wave.classList.remove('active1');
        masterPlay.classList.add('bi-play-fill');
        masterPlay.classList.remove('bi-pause-fill');
        // Sync the list icon to play
        const currentSongIcon = document.getElementById(index);
        if (currentSongIcon) {
            currentSongIcon.classList.add('bi-play-circle-fill');
            currentSongIcon.classList.remove('bi-pause-circle-fill');
        }
    }
}

masterPlay.addEventListener('click', togglePlayPause);

// --- UI HELPER FUNCTIONS ---
const makeAllplays = () => {
    Array.from(document.getElementsByClassName('playlistplay')).forEach((el) => {
        el.classList.remove('bi-pause-circle-fill');
        el.classList.add('bi-play-circle-fill');
    })
};

const makeAllBackgrounds = () => {
    Array.from(document.getElementsByClassName('songitem')).forEach((el) => {
        el.style.background = 'rgba(105, 105, 105, 0)';
    })
};


// --- PLAY SONG LOGIC ---
let poster_master_play = document.getElementById('poster_master_play');
let download_music = document.getElementById('download_music');
let title = document.getElementById('title');

// IMPROVED PLAYLIST CLICK LOGIC
Array.from(document.getElementsByClassName('playlistplay')).forEach((e) => {
    e.addEventListener('click', (el) => {
        const clickedIndex = el.target.id;
        // If the clicked song is different from the current one
        if (index != clickedIndex) {
            playSong(clickedIndex);
        } else {
            // If the same song is clicked, just toggle play/pause
            togglePlayPause();
        }
    });
});

function playSong(songId) {
    index = songId;
    makeAllplays();
    
    music.src = `audio/${index}.mp3`;
    poster_master_play.src = `img/${index}.jpg`;
    music.play(); 
    
    wave.classList.add('active1');
    masterPlay.classList.remove('bi-play-fill');
    masterPlay.classList.add('bi-pause-fill');
    
    // Set the icon for the newly playing song
    document.getElementById(index).classList.remove('bi-play-circle-fill');
    document.getElementById(index).classList.add('bi-pause-circle-fill');
    
    download_music.href = `audio/${index}.mp3`;

    let songTitleData = songs.find((s) => s.id == index);
    if (songTitleData) {
        title.innerHTML = songTitleData.songName;
        const cleanSongName = songTitleData.songName.replace(/<[^>]*>?/gm, ' - ');
        download_music.setAttribute('download', cleanSongName);
    }

    makeAllBackgrounds();
    Array.from(document.getElementsByClassName('songitem')).forEach(item => {
        const itemPlayButton = item.querySelector('.playlistplay');
        if (itemPlayButton && itemPlayButton.id == index) {
            item.style.background = "rgb(105,105,105,.1)";
        }
    });
}


// --- SEEK BAR AND TIME UPDATE ---
let currentStart = document.getElementById('currentStart');
let currentEnd = document.getElementById('currentEnd');
let seek = document.getElementById('seek');
let bar2 = document.getElementById('bar2');
let dot = document.getElementsByClassName('dot')[0];

music.addEventListener('timeupdate', () => {
    let music_curr = music.currentTime;
    let music_dur = music.duration;

    if (music_dur) {
        let min1 = Math.floor(music_dur / 60);
        let sec1 = Math.floor(music_dur % 60);
        if (sec1 < 10) sec1 = `0${sec1}`;
        currentEnd.innerText = `${min1}:${sec1}`;
    }

    let min2 = Math.floor(music_curr / 60);
    let sec2 = Math.floor(music_curr % 60);
    if (sec2 < 10) sec2 = `0${sec2}`;
    currentStart.innerText = `${min2}:${sec2}`;

    let progressBar = parseInt((music_curr / music_dur) * 100);
    seek.value = isNaN(progressBar) ? 0 : progressBar;
    bar2.style.width = `${isNaN(progressBar) ? 0 : progressBar}%`;
    dot.style.left = `${isNaN(progressBar) ? 0 : progressBar}%`;
});

seek.addEventListener('change', () => {
    if (music.duration) {
        music.currentTime = seek.value * music.duration / 100;
    }
});

// Auto-play next song
music.addEventListener('ended', () => {
    document.getElementById('next').click();
});


// --- VOLUME CONTROL ---
let vol_icon = document.getElementById('vol_icon');
let vol = document.getElementById('vol');
let vol_bar = document.getElementsByClassName('vol_bar')[0];
let vol_dot = document.getElementById('vol_dot');

vol.addEventListener('change', () => {
    const vol_a = vol.value;
    
    if (vol_a == 0) {
        vol_icon.classList.remove('bi-volume-up-fill', 'bi-volume-down-fill');
        vol_icon.classList.add('bi-volume-off-fill');
    } else if (vol_a > 0 && vol_a <= 50) {
        vol_icon.classList.remove('bi-volume-up-fill', 'bi-volume-off-fill');
        vol_icon.classList.add('bi-volume-down-fill');
    } else {
        vol_icon.classList.remove('bi-volume-down-fill', 'bi-volume-off-fill');
        vol_icon.classList.add('bi-volume-up-fill');
    }

    vol_bar.style.width = `${vol_a}%`;
    vol_dot.style.left = `${vol_a}%`;
    music.volume = vol_a / 100;
});


// --- NEXT AND BACK BUTTONS ---
let back = document.getElementById("back");
let next = document.getElementById("next");

back.addEventListener('click', () => {
    index--;
    if (index < 1) {
        index = songs.length;
    }
    playSong(index);
});

next.addEventListener('click', () => {
    index++;
    if (index > songs.length) {
        index = 1;
    }
    playSong(index);
});


// --- SCROLL BUTTONS FOR POPULAR SONGS & ARTISTS ---
let pop_song_left = document.getElementById('pop_song_left');
let pop_song_right = document.getElementById('pop_song_right');
let pop_song = document.getElementsByClassName('pop_song')[0];

pop_song_right.addEventListener('click', () => pop_song.scrollLeft += 330);
pop_song_left.addEventListener('click', () => pop_song.scrollLeft -= 330);

let pop_art_left = document.getElementById('pop_art_left');
let pop_art_right = document.getElementById('pop_art_right');
let Artists_bx = document.getElementsByClassName('Artists_bx')[0];

pop_art_right.addEventListener('click', () => Artists_bx.scrollLeft += 330);
pop_art_left.addEventListener('click', () => Artists_bx.scrollLeft -= 330);


// --- SEARCH FUNCTIONALITY ---
let searchInput = document.querySelector('.search input');
let searchResults = document.querySelector('.search .search_results');

searchInput.addEventListener('keyup', () => {
    let input_value = searchInput.value.toUpperCase();
    
    if (input_value.length <= 0) {
        searchResults.style.opacity = '0';
        searchResults.style.visibility = 'hidden';
        return;
    }
    
    let results = songs.filter(song => {
        return song.songName.replace(/<br>|<div class="subtitle">|<\/div>/gi, ' ').toUpperCase().includes(input_value);
    });

    searchResults.innerHTML = '';
    if (results.length > 0) {
        results.forEach(result => {
            const { id, songName, poster } = result;
            let card = document.createElement('a');
            card.classList.add('card');
            card.href = `#${id}`;
            card.innerHTML = `
                <img src="${poster}" alt="">
                <div class="content">${songName}</div>
            `;
            card.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent hash jump
                playSong(id);
                searchInput.value = '';
                searchResults.style.opacity = '0';
                searchResults.style.visibility = 'hidden';
            });
            searchResults.appendChild(card);
        });
        searchResults.style.opacity = '1';
        searchResults.style.visibility = 'visible';
    } else {
        searchResults.innerHTML = '<div class="card"><div class="content">No results found</div></div>';
        searchResults.style.opacity = '1';
        searchResults.style.visibility = 'visible';
    }
});