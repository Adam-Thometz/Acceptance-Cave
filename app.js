const AUDIO_BLOCKS = [
  document.getElementById("keys"),
  document.getElementById("synths"),
  document.getElementById("bass"),
  document.getElementById("drums")
];

const PLAY_PAUSE_BTN = document.getElementById("playPause");
const playIcon = '<i class="fa-solid fa-play" style="color: #ffffff;"></i>';
const pauseIcon = '<i class="fa-solid fa-pause" style="color: #ffffff;"></i>';

const SCALES = {
  keys: 3,
  synths: 3,
  bass: 1.5,
  drums: 10,
};

let animationIds = AUDIO_BLOCKS.reduce(function createIdsObj(accum, val) {
  accum[val.id] = null;
  return accum;
}, {});
let context = new AudioContext();
const sources = {};
let isPlaying = false;

function togglePlaying() {
  startContext();
  isPlaying = !isPlaying;
  if (isPlaying) {
    AUDIO_BLOCKS.forEach(function playTrack(block) {
      const id = block.id;
      const divToChange = block.children[0]
      const music = block.children[1]
      music.play();
      const analyser = sources[id].analyser;
      animationIds[id] = getAudioVolume(id, divToChange, analyser);
      PLAY_PAUSE_BTN.innerHTML = pauseIcon;
    });
  } else {
    AUDIO_BLOCKS.forEach(function pauseTrack(block) {
      block.children[1].pause();
      cancelAnimationFrame(animationIds[block.id]);
      PLAY_PAUSE_BTN.innerHTML = playIcon
    });
  }
}

async function startContext() {
  if (context.state == "suspended") await context.resume();
}

PLAY_PAUSE_BTN.addEventListener("click", togglePlaying)

function init() {
  context = new AudioContext();
  AUDIO_BLOCKS.forEach(function createMediaSource(block) {
    const id = block.id;
    const music = block.children[1];
    const analyser = context.createAnalyser();
    const source = context.createMediaElementSource(music);
    source.connect(analyser);
    analyser.connect(context.destination);
    sources[id] = {source, analyser};
  });
  PLAY_PAUSE_BTN.innerHTML = playIcon;
}

function getAudioVolume(id, divToChange, analyser) {
  const fbc_array = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(fbc_array)
  const average = fbc_array.reduce((accum, val) => accum + val, 0) / fbc_array.length
  divToChange.style.transform = `translate(-50%, -50%) scale(${average / SCALES[id]})`;
  return requestAnimationFrame(() => getAudioVolume(id, divToChange, analyser));
}

window.addEventListener("load", init);