/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

const Contour = __webpack_require__(17);
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const lfoVol = audioCtx.createGain();
const masterVol = audioCtx.createGain();
const distortion = audioCtx.createWaveShaper();
const distortionVol = audioCtx.createGain();
const reverb = audioCtx.createConvolver();
const reverbVol = audioCtx.createGain();
const splitter = audioCtx.createChannelSplitter();
const masterCompression = audioCtx.createDynamicsCompressor();
const dry = audioCtx.createGain();
const hpf = audioCtx.createBiquadFilter();
const lpf = audioCtx.createBiquadFilter();
const connectorGain = audioCtx.createGain();
const gainNode = audioCtx.createGain();
// const env = Contour(audioCtx);
// env.duration = 2;

hpf.type='highpass';
lpf.type='lowpass';

const keyboard = new QwertyHancock({
                 id: 'keyboard',
                 width: 600,
                 height: 150,
                 octaves: 2,
                 startNote: 'c3',
                 whiteNotesColour: 'white',
                 blackNotesColour: 'black',
                 hoverColour: '#f3e939',
            });


const attack = document.getElementById('attack');
const decay = document.getElementById('decay');
const initialGain = document.getElementById('init-gain');
const volume = document.getElementById('volume');
const lfoknob = document.getElementById('lfo');
const distortionknob = document.getElementById('distortion');
const distortionVolKnob = document.getElementById('distortionVol');
const reverbVolKnob = document.getElementById('reverb-vol');
const reverbButton = document.getElementById('reverb-button');
const lfoVolume = document.getElementById('lfo-volume');
const thresholdKnob = document.getElementById('threshold');
const kneeKnob = document.getElementById('knee');
const ratioKnob = document.getElementById('ratio');
const lpfFreq = document.getElementById('lpf-freq');
const hpfFreq = document.getElementById('hpf-freq');


const convolver = audioCtx.createConvolver();
const reverbBuffer = audioCtx.createBufferSource();
const getSound = new XMLHttpRequest();
getSound.open('GET', 'stalbans_a_mono.wav', true);
getSound.responseType="arraybuffer";
getSound.onload = function() {
  audioCtx.decodeAudioData(getSound.response, function(buffer){
    console.log(buffer);
    convolver.buffer = buffer;
  });
  getSound.send();
};

// document.addEventListener('keydown', function(e){
//   debugger
//   return null;
// });

// osc1
distortionVol.gain.value = 1;
const preDist = audioCtx.createGain();
const osc1wave = document.getElementById('osc1-waveform');
const osc1octave = document.getElementById('osc1-octave');
const postAttackGain = document.getElementById('osc1-gain');
postAttackGain.addEventListener('input', function() {
  preDist.gain.value = postAttackGain.value;
});
let distConnected = false;
connectOsc1();

gainNode.connect(audioCtx.destination);

function connectOsc1() {

  if (distConnected) {
    preDist.disconnect(distortion);
  }
  preDist.connect(gainNode);
  distConnected = false;
}

volume.addEventListener('input', function() {
  gainNode.gain.value = volume.value;
});
//end oscillator 1

//distortion node

const distortionCheck = document.getElementById('toggle-distortion');

distortionCheck.addEventListener('change', function() {

  if (distortionCheck.checked) {
    preDist.disconnect(gainNode);
    preDist.connect(distortion);
    distortion.connect(distortionVol);
    distortionVol.connect(gainNode);
    distConnected = true;
  } else {
    connectOsc1();
  }
});



var threshold = -27; // dB
var headroom = 21; // dB

function dBToLinear(db) {
    return Math.pow(10.0, 0.05 * db);
}

function e4(x, k)
{
    return 1.0 - Math.exp(-k * x);
}


function shape(x) {
    var linearThreshold = dBToLinear(threshold);
    var linearHeadroom = dBToLinear(headroom);

    var maximum = 1.05 * linearHeadroom * linearThreshold;
    var kk = (maximum - linearThreshold);

    var sign = x < 0 ? -1 : +1;
    var absx = Math.abs(x);

    var shapedInput = absx < linearThreshold ? absx : linearThreshold + kk * e4(absx - linearThreshold, 1.0 / kk);
    shapedInput *= sign;

    return shapedInput;
}

function generateColortouchCurve(curve) {
    var n = 65536;
    var n2 = n / 2;

    for (var i = 0; i < n2; ++i) {
        x = i / n2;
        x = shape(x);

        curve[n2 + i] = x;
        curve[n2 - i - 1] = -x;
    }

    return curve;
}


function generateMirrorCurve(curve) {
    var n = 65536;
    var n2 = n / 2;

    for (var i = 0; i < n2; ++i) {
        x = i / n2;
        x = shape(x);

        curve[n2 + i] = x;
        curve[n2 - i - 1] = x;
    }

    return curve;
}

const curve = new Float32Array(65536);
distortion.curve = generateColortouchCurve(curve);
distortion.oversample = '2x';
//end distortion node



const oscillators = {};
let isStop = true;
let intervalId;

const gainNodeTable = {};

const octaveTable = {
  "-2": .25,
  "-1": .5,
  "0": 1,
  "1": 2,
  "2": 4
};
lpf.connect(hpf);
hpf.connect(preDist);

lpfFreq.addEventListener('input', function() {
  lpf.frequency.value = lpfFreq.value;
});

hpfFreq.addEventListener('input', function() {
  hpf.frequency.value = hpfFreq.value;
});
// const osc2 = audioCtx.createOscillator();
// const pinkNoise = audioCtx.createOscillator();

const lfoOn = document.getElementById('toggle-lfo');

lfoVolume.addEventListener('input', function(){
  lfoOut.gain.value = lfoVolume.value;
});

// dry.addEventListener('input', function() {
//   dry.gain.value = dryKnob.value;
// });



lfoknob.addEventListener('input', function() {
  lfo.frequency.value = lfoknob.value;

});

const lfoTable = {};
const lfo = audioCtx.createOscillator();
const lfoOut = audioCtx.createGain();
lfo.connect(lfoVol.gain);
// lfo.frequency.value = lfoknob.value;
lfoVol.connect(lfoOut);
lfoOut.connect(lpf);
lfo.start();

function rampLfo(now, Osc, lfoGain){
  lfoGain.connect(lfoVol);
  lfoGain.gain.cancelScheduledValues(now);
  lfoGain.gain.setValueAtTime(lfoGain.gain.value, now);
  lfoGain.gain.linearRampToValueAtTime(1.0, (now + parseInt(attack.value)));
  Osc.connect(lfoGain);
  // lfoGain.connect(Osc.frequency);
  // Osc.connect(lfoVol);
}

let osc1Vol;
keyboard.keyDown = function(note, freq) {
  let now = audioCtx.currentTime;
  const osc1 = audioCtx.createOscillator();
  const oscFilter = audioCtx.createBiquadFilter();
  if (gainNodeTable[freq]) {
    osc1Vol = gainNodeTable[freq];
    osc1Vol.gain.cancelScheduledValues(now);
    osc1Vol.gain.setValueAtTime(osc1Vol.gain.value, now);
  } else {
    osc1Vol = audioCtx.createGain();
    osc1Vol.gain.setValueAtTime(0, now);
  }
  osc1.connect(osc1Vol);
  osc1.type = osc1wave.value;
  osc1.frequency.value = (freq * octaveTable[osc1octave.value]);
  oscillators[freq] = osc1;
  gainNodeTable[freq] = osc1Vol;
  osc1Vol.connect(lpf);
  osc1Vol.gain.linearRampToValueAtTime(1.0, (now + parseInt(attack.value)));
  osc1.start();
  if (lfoOn.checked) {
    // debugger
    const lfoGain = audioCtx.createGain();
    lfoTable[freq] = lfoGain;
    const lfoOsc = audioCtx.createOscillator();
    rampLfo(now, lfoOsc, lfoGain);
    oscillators[freq + 6000] = lfoOsc;
    lfoOsc.frequency.value = freq * octaveTable[osc1octave.value];
    lfoOsc.start(now);
  }
};

keyboard.keyUp = function(note, freq) {
    const now = audioCtx.currentTime;
    const gain = gainNodeTable[freq].gain.value;
    gainNodeTable[freq].gain.cancelScheduledValues(now);
    gainNodeTable[freq].gain.setValueAtTime(gain, now);
    gainNodeTable[freq].gain.exponentialRampToValueAtTime(0.0001, now + parseInt(decay.value));
    oscillators[freq].stop(now + parseInt(decay.value));
    if (oscillators[freq + 6000]) {
      oscillators[freq + 6000].stop(now + parseInt(decay.value));
    }
    if (lfoTable[freq]) {
      // debugger
      let lfoGain = lfoTable[freq];
      lfoGain.gain.cancelScheduledValues(now);
      lfoGain.gain.setValueAtTime(lfoGain.gain.value, now);
      lfoGain.gain.exponentialRampToValueAtTime(0.0001, now + parseInt(decay.value));
    }
};


/***/ }),

/***/ 17:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var Voltage = __webpack_require__(18)
var isNum = function (n) { return typeof n === 'number' }

var NUMS = ['duration', 't1', 't2', 't3', 't4', 'l1', 'l2', 'l3']
var DEFAULTS = {
  duration: Infinity, l1: 1, l2: 0.2, l3: 0.8,
  t1: 0.01, t2: 0.1, t3: 0, t4: 0.2
}

function rampFn (l) {
  return l ? 'linearRampToValueAtTime' : 'exponentialRampToValueAtTime'
}
function ramp (l, node, level, time) { node.gain[rampFn(l)](level, time) }

/**
 * Create an envelope generator.
 * @param {AudioContext} ac - the audio context
 * @param {Object} options - (Optional) the envelope options
 * @return {AudioNode} the envelope generator node
 */
function Contour (ac, options) {
  var env = ac.createGain()
  var opts = Contour.params(options, env)
  var isL = opts.ramp === 'linear'

  var tail = ac.createGain()
  tail.connect(env)
  var head = ac.createGain()
  head.connect(tail)
  var cv = Voltage(ac)
  cv.connect(head)

  env.start = function (time) {
    time = Math.max(time || 0, ac.currentTime)
    if (env.onstart) env.onstart(time)
    cv.start(time)
    head.gain.setValueAtTime(0, time)
    head.gain.setValueAtTime(0.01, time + 0.000001)
    ramp(isL, head, opts.l1, time + opts.t1)
    ramp(isL, head, opts.l2, time + opts.t1 + opts.t2)
    ramp(isL, head, opts.l3, time + opts.t1 + opts.t2 + opts.t3)
    if (isFinite(opts.duration)) env.stop(time + opts.duration)
  }

  env.stop = function (time) {
    time = Math.max(time || 0, ac.currentTime)
    tail.gain.cancelScheduledValues(time)
    tail.gain.setValueAtTime(env.gain.value, time)
    var endsAt = time + opts.t4
    ramp(isL, tail, 0.0001, endsAt)
    if (env.onended) {
      var s = Voltage(ac, 0)
      s.connect(ac.destination)
      s.onended = env.onended
      s.start(ac.currentTime)
      s.stop(endsAt)
    }
    return endsAt
  }
  return env
}

Contour.params = function (options, dest) {
  dest = dest || {}
  options = options || {}
  NUMS.forEach(function (name) {
    dest[name] = isNum(options[name]) ? options[name] : DEFAULTS[name]
  })
  if (isNum(options.attack)) dest.t1 = options.attack
  if (isNum(options.decay)) dest.t2 = options.decay
  if (isNum(options.sustain)) dest.l3 = options.sustain
  if (isNum(options.release)) dest.t4 = options.release
  dest.ramp = options.ramp === 'exponential' ? options.ramp : 'linear'
  return dest
}

module.exports = Contour


/***/ }),

/***/ 18:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (ac, value) {
  value = (value || value === 0) ? value : 1
  var buffer = ac.createBuffer(1, 2, ac.sampleRate)
  var data = buffer.getChannelData(0)
  data[0] = data[1] = value
  var source = ac.createBufferSource()
  source.buffer = buffer
  source.loop = true
  return source
}


/***/ })

/******/ });