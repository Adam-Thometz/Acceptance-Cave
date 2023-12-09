const AUDIO_BLOCKS = [
  document.getElementById("keys"),
  document.getElementById("synths"),
  document.getElementById("bass"),
  document.getElementById("drums")
];

const PLAY_PAUSE_BTN = document.getElementById("playPause");
const playIcon = '<i class="fa-solid fa-play"></i>';
const pauseIcon = '<i class="fa-solid fa-pause"></i>';

const SCALES = {
  keys: .75,
  synths: .5,
  bass: .25,
  drums: 1.5,
};

let animationIds = AUDIO_BLOCKS.reduce(function createKeyForAnimationId(accum, val) {
  accum[val.id] = null;
  return accum;
}, {});
let context = new AudioContext();
const sources = {};
let isPlaying = false;

async function startContext() {
  if (context.state == "suspended") await context.resume();
}

function getVisual(el) {
  return el.children[0];
}

function getAudioTrack(el) {
  return el.children[1];
}

function playTrack(block) {
  startContext();
  const id = block.id;
  const visualToChange = getVisual(block);
  const music = getAudioTrack(block);
  music.play();
  const analyser = sources[id];
  animationIds[id] = getAudioVolume(id, visualToChange, analyser);
  PLAY_PAUSE_BTN.innerHTML = pauseIcon;
  block.addEventListener("click", toggleMute);
}

function pauseTrack(block) {
  getAudioTrack(block).pause();
  cancelAnimationFrame(animationIds[block.id]);
  PLAY_PAUSE_BTN.innerHTML = playIcon;
  block.removeEventListener("click", toggleMute);
}

function togglePlaying() {
  isPlaying = !isPlaying;
  AUDIO_BLOCKS.forEach(isPlaying ? playTrack : pauseTrack);
}

function toggleMute(e) {
  const track = getAudioTrack(e.target)
  track.muted = !track.muted;
}

function getAudioVolume(id, visualToChange, analyser) {
  const fbcArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(fbcArray);

  const average = fbcArray.reduce((accum, val) => accum + val, 0) / fbcArray.length;
  visualToChange.style.transform = `translate(-50%, -50%) scale(${average / SCALES[id]})`;
  return requestAnimationFrame(() => getAudioVolume(id, visualToChange, analyser));
}

(function init() {
  AUDIO_BLOCKS.forEach(function createMediaSource(block) {
    const id = block.id;
    const music = getAudioTrack(block);
    const analyser = context.createAnalyser();
    const source = context.createMediaElementSource(music);
    source.connect(analyser);
    analyser.connect(context.destination);
    sources[id] = analyser;
  });
  PLAY_PAUSE_BTN.innerHTML = playIcon;
  PLAY_PAUSE_BTN.addEventListener("click", togglePlaying);
})();
