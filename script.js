console.log("Lets write javascript");

let currentSong = new Audio();
let songs;
let currfolder;
const albumFolders = ['cs', 'ncs', 'Old Bollywood', 'personal fav'];

const repoName = 'RamshuKaSpotify';
const repoPath = '/' + encodeURIComponent(repoName); // '/Ramshu%20Ka%20Spotify'

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currfolder = folder; // e.g., "cs"
  const encodedFolder = encodeURIComponent(folder);
  let response = await fetch(`${repoPath}/songs/${encodedFolder}/info.json`);
  if (!response.ok) throw new Error(`Failed to fetch info.json for folder: ${folder}`);

  let data = await response.json();

  songs = data.songs; // Array of song filenames

  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";

  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img class="invert" src="music.svg" alt="Music icon">
        <div class="info">
          <div>${decodeURIComponent(song)}</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="play.svg" alt="Play icon">
        </div>
      </li>`;
  }

  Array.from(songUL.getElementsByTagName("li")).forEach(li => {
    li.addEventListener("click", () => {
      playMusic(li.querySelector(".info div").innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  const encodedFolder = encodeURIComponent(currfolder);
  currentSong.src = `${repoPath}/songs/${encodedFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let cardContainer = document.querySelector(".cardContainer");
  cardContainer.innerHTML = ''; // Clear existing content

  for (const folder of albumFolders) {
    try {
      const encodedFolder = encodeURIComponent(folder);
      let response = await fetch(`${repoPath}/songs/${encodedFolder}/info.json`);
      if (!response.ok) throw new Error(`Failed to fetch info.json for folder: ${folder}`);

      let data = await response.json();

      cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <div class="play">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                stroke-linejoin="round" />
            </svg>
          </div>

          <img src="${repoPath}/songs/${encodedFolder}/cover.jpg" alt="${data.title} cover">
          <h2>${data.title}</h2>
          <p>${data.description}</p>
        </div>`;
    } catch (error) {
      console.error(error);
    }
  }

  // Add click listeners to cards
  Array.from(document.getElementsByClassName("card")).forEach(card => {
    card.addEventListener("click", async () => {
      console.log("Fetching songs from", card.dataset.folder);
      songs = await getSongs(card.dataset.folder);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  // Get list Of songs from first album 'cs'
  songs = await getSongs('cs');
  playMusic(songs[0], true);

  // Display all albums in the page
  displayAlbums();

  // Attach an event listener to play/pause button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  // Listen for time update event to update progress bar and time display
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add event listener to seekbar to seek song on click
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100;
  });

  // Hamburger menu open/close
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Previous button click
  previous.addEventListener("click", () => {
    console.log("Prev Clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    console.log(songs, index);
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Next button click
  next.addEventListener("click", () => {
    console.log("Next Clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Volume change listener
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  // Mute/unmute volume on icon click
  document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
