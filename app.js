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
  keys: .5,
  synths: .5,
  bass: .25,
  drums: 1.5,
};

let animationIds = AUDIO_BLOCKS.reduce(function createIdsObj(accum, val) {
  accum[val.id] = null;
  return accum;
}, {});
let context = new AudioContext();
const sources = {};
let isPlaying = false;

function init() {
  context = new AudioContext();
  AUDIO_BLOCKS.forEach(function createMediaSource(block) {
    const id = block.id;
    const music = block.children[1];
    const analyser = context.createAnalyser();
    const source = context.createMediaElementSource(music);
    source.connect(analyser);
    analyser.connect(context.destination);
    sources[id] = analyser;
  });
  PLAY_PAUSE_BTN.innerHTML = playIcon;
}

async function startContext() {
  if (context.state == "suspended") await context.resume();
}

function playTrack(block) {
  startContext();
  const id = block.id;
  const divToChange = block.children[0];
  const music = block.children[1];
  music.play();
  const analyser = sources[id];
  animationIds[id] = getAudioVolume(id, divToChange, analyser);
  PLAY_PAUSE_BTN.innerHTML = pauseIcon;
}

function pauseTrack(block) {
  block.children[1].pause();
  cancelAnimationFrame(animationIds[block.id]);
  PLAY_PAUSE_BTN.innerHTML = playIcon;
}

function togglePlaying() {
  isPlaying = !isPlaying;
  AUDIO_BLOCKS.forEach(isPlaying ? playTrack : pauseTrack);
}

function getAudioVolume(id, divToChange, analyser) {
  const fbcArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(fbcArray);

  const average = fbcArray.reduce((accum, val) => accum + val, 0) / fbcArray.length;
  divToChange.style.transform = `translate(-50%, -50%) scale(${average / SCALES[id]})`;
  return requestAnimationFrame(() => getAudioVolume(id, divToChange, analyser));
}

PLAY_PAUSE_BTN.addEventListener("click", togglePlaying)
window.addEventListener("load", init);
