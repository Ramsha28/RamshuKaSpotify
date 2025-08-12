console.log("Lets write javascript")
let currentSong = new Audio;
let songs;
let currfolder;
const albumFolders = ['cs', 'ncs', 'Old Bollywood', 'personal fav'];



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
  currfolder = folder; // e.g., "songs/Old Bollywood"
  const encodedFolder = encodeURIComponent(folder);
  let response = await fetch(`/${encodedFolder}/info.json`);
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
  currentSong.src = `/${encodedFolder}/` + track;
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
      let response = await fetch(`/songs/${encodedFolder}/info.json`);
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

          <img src="/songs/${encodedFolder}/cover.jpg" alt="${data.title} cover">
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
      songs = await getSongs(`songs/${card.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}



async function main() {



  //get list Of songs
    songs = await getSongs('songs/cs');
  playMusic(songs[0], true)


  //display all albums in the page
  displayAlbums()




  //attach an event listerner to play next and prev
  play.addEventListener("click", () => {

    if (currentSong.paused) {
      currentSong.play()
      play.src = "pause.svg"
    }
    else {
      currentSong.pause()
      play.src = "play.svg"

    }
  })


  //listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  })


  //add event listner to seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    document.querySelector(".circle").style.left = percent + "%"
    currentSong.currentTime = ((currentSong.duration) * percent) / 100
  })

  //add an event linsten for hambuerger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0
  })

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
  })


  //add and event listner to prev 

  previous.addEventListener("click", () => {
    console.log("Prev Clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

    console.log(songs, index)
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1])
    }

  })

  //add and event listner to next
  next.addEventListener("click", () => {
    console.log("Next Clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

    if ((index + 1) > length) {
      playMusic(songs[index + 1])
    }

  })

  //add an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100
  })

  //event to mute volume
  document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg")
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0
    }

    else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg")
      currentSong.volume = .10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10

    }
  })



}

main()
