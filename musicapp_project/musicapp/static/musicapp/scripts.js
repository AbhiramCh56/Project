document.addEventListener("DOMContentLoaded", () => {
  const audioPlayers = document.querySelectorAll(".audio-player");
  let currentIndex = 0;

  const prevBtn = document.getElementById("prevBtn");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const loopBtn = document.getElementById("loopBtn");
  const currentThumbnail = document.getElementById("current-thumbnail");
  const currentTitle = document.getElementById("current-title");
  const currentArtist = document.getElementById("current-artist");
  const volumeSlider = document.getElementById("volumeSlider");
  const songSlider = document.getElementById("songSlider");
  const songItems = document.querySelectorAll(".song-item");

  let isPlaying = false;
  let isLooping = false;
  let currentVolume = 1;

  function loadSong(index) {
    const song = audioPlayers[index];
    currentThumbnail.src = song
      .closest(".song-item")
      .querySelector(".song-thumbnail").src;
    currentTitle.textContent = song
      .closest(".song-item")
      .querySelector("h3").textContent;
    currentArtist.textContent = song
      .closest(".song-item")
      .querySelector("p").textContent;
    songSlider.max = song.duration;
    songSlider.value = song.currentTime;
    audioPlayers.forEach((player) => {
      player.pause();
      player.currentTime = 0;
    });
    song.volume = currentVolume;
    song.addEventListener("ended", onSongEnd);
  }

  function playSong() {
    isPlaying = true;
    audioPlayers[currentIndex].play();
    playPauseBtn.querySelector("i").classList.replace("fa-play", "fa-pause");
  }

  function pauseSong() {
    isPlaying = false;
    audioPlayers[currentIndex].pause();
    playPauseBtn.querySelector("i").classList.replace("fa-pause", "fa-play");
  }

  function prevSong() {
    audioPlayers[currentIndex].pause();
    currentIndex =
      (currentIndex - 1 + audioPlayers.length) % audioPlayers.length;
    loadSong(currentIndex);
    playSong();
  }

  function nextSong() {
    audioPlayers[currentIndex].pause();
    currentIndex = (currentIndex + 1) % audioPlayers.length;
    loadSong(currentIndex);
    playSong();
  }

  function selectSong(index) {
    if (currentIndex !== null && currentIndex !== index) {
      pauseSong();
    }
    currentIndex = index;
    loadSong(currentIndex);
    playSong();
  }

  function onSongEnd() {
    if (isLooping) {
      loadSong(currentIndex);
      playSong();
    } else {
      nextSong();
    }
  }

  function toggleLoop() {
    isLooping = !isLooping;
    loopBtn.classList.toggle("active", isLooping);
  }

  playPauseBtn.addEventListener("click", () => {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  });

  prevBtn.addEventListener("click", prevSong);
  nextBtn.addEventListener("click", nextSong);
  loopBtn.addEventListener("click", toggleLoop);

  volumeSlider.addEventListener("input", () => {
    if (currentIndex !== null) {
      currentVolume = volumeSlider.value;
      audioPlayers[currentIndex].volume = currentVolume;
    }
  });

  songSlider.addEventListener("input", () => {
    if (currentIndex !== null) {
      const seekTo = songSlider.value;
      audioPlayers[currentIndex].currentTime = seekTo;
    }
  });

  function updateSongSlider() {
    if (currentIndex !== null && isPlaying) {
      const currentTime = audioPlayers[currentIndex].currentTime;
      songSlider.value = currentTime;
      songSlider.max = audioPlayers[currentIndex].duration; // Ensure the slider max is up-to-date
    }
    requestAnimationFrame(updateSongSlider);
  }

  requestAnimationFrame(updateSongSlider);

  songItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      selectSong(index);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.code === "Space" &&
      document.activeElement.tagName !== "INPUT" &&
      document.activeElement.tagName !== "TEXTAREA"
    ) {
      event.preventDefault();
      playPauseBtn.click();
    }
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent parent click event from firing
      const songId = btn.getAttribute("data-song-id");
      fetch(`/delete/${songId}/`, { method: "GET" }).then((response) => {
        if (response.ok) {
          window.location.reload();
        }
      });
    });
  });

  loadSong(currentIndex);
});
