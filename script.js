import * as THREE from "three";

// ======================================================
// DEAR FAVOUR — COMPLETE ROMANTIC EXPERIENCE
// ======================================================

const canvas = document.getElementById("particleCanvas");
const beginButton = document.getElementById("beginExperience");
const openingScreen = document.getElementById("opening-screen");
const particleMessage = document.getElementById("particleMessage");
const messageScreen = document.getElementById("message-screen");
const soundToggle = document.getElementById("soundToggle");

if (!canvas) {
    throw new Error("particleCanvas was not found in index.html");
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

// ======================================================
// THREE.JS SCENE
// ======================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05020c);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 45;

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// ======================================================
// PARTICLE HEART
// ======================================================

const PARTICLE_COUNT = 15000;

const heartGeometry = new THREE.BufferGeometry();

const positions = new Float32Array(PARTICLE_COUNT * 3);
const originalPositions = new Float32Array(PARTICLE_COUNT * 3);
const velocities = new Float32Array(PARTICLE_COUNT * 3);
const colors = new Float32Array(PARTICLE_COUNT * 3);

function createHeartPoint() {
    const t = Math.random() * Math.PI * 2;

    const x = 16 * Math.pow(Math.sin(t), 3);

    const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);

    const fill = Math.sqrt(Math.random());

    return {
        x: x * fill * 0.85,
        y: y * fill * 0.85,
        z: random(-5, 5) * fill
    };
}

for (let i = 0; i < PARTICLE_COUNT; i++) {
    const index = i * 3;
    const point = createHeartPoint();

    positions[index] = random(-35, 35);
    positions[index + 1] = random(-35, 35);
    positions[index + 2] = random(-20, 20);

    originalPositions[index] = point.x;
    originalPositions[index + 1] = point.y;
    originalPositions[index + 2] = point.z;

    colors[index] = random(0.85, 1);
    colors[index + 1] = random(0.18, 0.48);
    colors[index + 2] = random(0.38, 0.78);
}

heartGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
);

heartGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colors, 3)
);

const heartMaterial = new THREE.PointsMaterial({
    size: 0.13,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
});

const heart = new THREE.Points(heartGeometry, heartMaterial);

heart.scale.set(0.85, 0.85, 0.85);
scene.add(heart);

// ======================================================
// BACKGROUND STARS
// ======================================================

const STAR_COUNT = 2200;

const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(STAR_COUNT * 3);

for (let i = 0; i < STAR_COUNT; i++) {
    const index = i * 3;

    starPositions[index] = random(-100, 100);
    starPositions[index + 1] = random(-100, 100);
    starPositions[index + 2] = random(-80, 20);
}

starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(starPositions, 3)
);

const starMaterial = new THREE.PointsMaterial({
    color: 0xffb3d1,
    size: 0.12,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// ======================================================
// LIGHTING
// ======================================================

const glowLight = new THREE.PointLight(0xff397d, 5, 80);
glowLight.position.set(0, 0, 12);
scene.add(glowLight);

// ======================================================
// ROMANTIC PIANO SOUNDTRACK
// ======================================================

let audioContext = null;
let masterGain = null;
let audioStarted = false;
let soundEnabled = true;
let musicTimer = null;
let activeAudioNodes = [];

const pianoMelody = [
    [261.63, 329.63, 392.00],
    [293.66, 349.23, 440.00],
    [246.94, 329.63, 392.00],
    [261.63, 329.63, 392.00]
];

let chordIndex = 0;

function playPianoNote(frequency, start, duration, volume) {
    if (!audioContext || !masterGain || !soundEnabled) return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    filter.type = "lowpass";
    filter.frequency.value = 1800;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
        volume,
        start + 0.08
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        start + duration
    );

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    oscillator.start(start);
    oscillator.stop(start + duration + 0.1);

    activeAudioNodes.push(oscillator);

    oscillator.onended = () => {
        activeAudioNodes = activeAudioNodes.filter(
            node => node !== oscillator
        );
    };
}

function playPianoChord() {
    if (!audioContext || !soundEnabled) return;

    const now = audioContext.currentTime;
    const chord = pianoMelody[chordIndex];

    chordIndex = (chordIndex + 1) % pianoMelody.length;

    // Soft chord notes
    chord.forEach((frequency, index) => {
        playPianoNote(
            frequency,
            now + index * 0.12,
            3.8,
            0.045
        );
    });

    // Gentle melody
    const melody = [
        chord[2] * 2,
        chord[1] * 2,
        chord[0] * 2,
        chord[1] * 2
    ];

    melody.forEach((frequency, index) => {
        playPianoNote(
            frequency,
            now + 0.8 + index * 0.75,
            2.2,
            0.018
        );
    });

    // Warm bass
    playPianoNote(
        chord[0] / 2,
        now,
        4.5,
        0.035
    );
}

function startAudio() {
    if (audioStarted) {
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
        return;
    }

    const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
        console.warn("Web Audio is not supported.");
        return;
    }

    audioContext = new AudioContextClass();

    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.65;

    const compressor = audioContext.createDynamicsCompressor();

    compressor.threshold.value = -24;
    compressor.knee.value = 20;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.02;
    compressor.release.value = 0.3;

    masterGain.connect(compressor);
    compressor.connect(audioContext.destination);

    audioStarted = true;

    audioContext.resume();

    playPianoChord();

    musicTimer = setInterval(() => {
        if (soundEnabled) {
            playPianoChord();
        }
    }, 5000);
}

// ======================================================
// SOUND BUTTON
// ======================================================

function updateSoundButton() {
    if (!soundToggle) return;

    soundToggle.textContent = soundEnabled ? "♫" : "♪";
}

if (soundToggle) {
    soundToggle.addEventListener("click", () => {
        soundEnabled = !soundEnabled;

        if (soundEnabled) {
            startAudio();

            if (masterGain) {
                masterGain.gain.setTargetAtTime(
                    0.65,
                    audioContext.currentTime,
                    0.5
                );
            }
        } else if (masterGain) {
            masterGain.gain.setTargetAtTime(
                0,
                audioContext.currentTime,
                0.5
            );
        }

        updateSoundButton();
    });
}

// ======================================================
// HEART EXPLOSION
// ======================================================

let experienceStarted = false;
let explosionActive = false;

function explodeHeart() {
    explosionActive = true;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const index = i * 3;

        const x = positions[index];
        const y = positions[index + 1];
        const z = positions[index + 2];

        const length = Math.sqrt(
            x * x + y * y + z * z
        ) || 1;

        velocities[index] =
            (x / length) * random(0.12, 0.45);

        velocities[index + 1] =
            (y / length) * random(0.12, 0.45);

        velocities[index + 2] =
            (z / length) * random(0.12, 0.45);
    }
}

function reformHeart() {
    explosionActive = false;
}

// ======================================================
// UPDATE PARTICLES
// ======================================================

function updateParticles(time) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const index = i * 3;

        if (explosionActive) {
            positions[index] += velocities[index];
            positions[index + 1] += velocities[index + 1];
            positions[index + 2] += velocities[index + 2];

            velocities[index] *= 0.985;
            velocities[index + 1] *= 0.985;
            velocities[index + 2] *= 0.985;
        } else {
            const pulse = 1 + Math.sin(time * 2.2) * 0.035;

            positions[index] +=
                (originalPositions[index] * pulse -
                    positions[index]) * 0.035;

            positions[index + 1] +=
                (originalPositions[index + 1] * pulse -
                    positions[index + 1]) * 0.035;

            positions[index + 2] +=
                (originalPositions[index + 2] -
                    positions[index + 2]) * 0.035;
        }
    }

    heartGeometry.attributes.position.needsUpdate = true;
}

// ======================================================
// FINAL ROMANTIC ENDING
// ======================================================

function showFinalEnding() {
    if (document.getElementById("final-ending")) return;

    const ending = document.createElement("div");

    ending.id = "final-ending";

    ending.innerHTML = `
        <div class="ending-hearts"></div>

        <div class="ending-content">

            <div class="ending-heart">♥</div>

            <p class="ending-small">
                AND ONE MORE THING...
            </p>

            <h1>
                You are special,<br>
                Favour.
            </h1>

            <p class="ending-message">
                No matter where life takes us,
                I hope you always remember how
                wonderful you are.
            </p>

            <p class="ending-signature">
                You deserve all the beautiful things in life.
            </p>

            <button id="playAgain">
                PLAY AGAIN ↗
            </button>

        </div>
    `;

    document.body.appendChild(ending);

    const style = document.createElement("style");

    style.textContent = `
        #final-ending {
            position: fixed;
            inset: 0;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background:
                radial-gradient(
                    ellipse at center,
                    #351027 0%,
                    #160817 45%,
                    #05020c 100%
                );
            opacity: 0;
            transition: opacity 2s ease;
        }

        #final-ending.show {
            opacity: 1;
        }

        .ending-content {
            position: relative;
            z-index: 3;
            width: min(90%, 650px);
            text-align: center;
            padding: 35px 20px;
            animation: endingReveal 2s ease forwards;
        }

        .ending-heart {
            color: #ff5b9c;
            font-size: 65px;
            margin-bottom: 25px;
            text-shadow:
                0 0 15px #ff3d8d,
                0 0 45px #ff3d8d;
            animation: heartBeat 1.5s infinite;
        }

        .ending-small {
            color: #ffb4d0;
            letter-spacing: 6px;
            font-size: 11px;
            margin-bottom: 25px;
        }

        .ending-content h1 {
            color: #fff0f6;
            font-family: Georgia, serif;
            font-size: clamp(42px, 8vw, 76px);
            font-weight: normal;
            line-height: 1.15;
            text-shadow: 0 0 30px rgba(255, 91, 156, .5);
            margin-bottom: 25px;
        }

        .ending-message {
            color: #f4dce8;
            font-family: Georgia, serif;
            font-size: clamp(16px, 3vw, 21px);
            line-height: 1.9;
            max-width: 480px;
            margin: 0 auto 20px;
        }

        .ending-signature {
            color: #ff9fc2;
            font-size: 13px;
            letter-spacing: 1px;
            margin-bottom: 40px;
        }

        #playAgain {
            padding: 16px 38px;
            border: 1px solid rgba(255, 170, 205, .7);
            border-radius: 50px;
            background: rgba(255, 80, 145, .12);
            color: white;
            letter-spacing: 3px;
            font-size: 11px;
            cursor: pointer;
            transition: .35s ease;
        }

        #playAgain:hover {
            background: #ff5b9c;
            box-shadow: 0 0 35px #ff5b9c;
            transform: translateY(-4px);
        }

        .floating-heart {
            position: absolute;
            bottom: -50px;
            color: #ff6fae;
            pointer-events: none;
            opacity: 0;
            animation: floatUp linear forwards;
            text-shadow: 0 0 15px #ff3d8d;
        }

        @keyframes floatUp {
            0% {
                transform: translateY(0) rotate(0deg) scale(.5);
                opacity: 0;
            }

            15% {
                opacity: .8;
            }

            85% {
                opacity: .6;
            }

            100% {
                transform: translateY(-110vh) rotate(360deg) scale(1.3);
                opacity: 0;
            }
        }

        @keyframes heartBeat {
            0%, 100% { transform: scale(1); }
            15% { transform: scale(1.2); }
            30% { transform: scale(1); }
            45% { transform: scale(1.12); }
        }

        @keyframes endingReveal {
            from {
                transform: translateY(35px);
                opacity: 0;
            }

            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        @media (max-width: 600px) {
            .ending-content {
                padding: 20px;
            }

            .ending-small {
                letter-spacing: 3px;
            }
        }
    `;

    document.head.appendChild(style);

    requestAnimationFrame(() => {
        ending.classList.add("show");
    });

    const heartContainer = ending.querySelector(".ending-hearts");

    const heartInterval = setInterval(() => {
        if (!document.body.contains(ending)) {
            clearInterval(heartInterval);
            return;
        }

        const floatingHeart = document.createElement("span");

        floatingHeart.className = "floating-heart";

        floatingHeart.textContent =
            Math.random() > 0.5 ? "♥" : "♡";

        floatingHeart.style.left = random(0, 100) + "%";
        floatingHeart.style.fontSize = random(12, 32) + "px";
        floatingHeart.style.animationDuration = random(5, 10) + "s";

        heartContainer.appendChild(floatingHeart);

        setTimeout(() => floatingHeart.remove(), 10000);

    }, 250);

    document.getElementById("playAgain").addEventListener("click", () => {
        location.reload();
    });
}

// ======================================================
// START EXPERIENCE
// ======================================================

function startExperience() {
    if (experienceStarted) return;

    experienceStarted = true;

    startAudio();

    if (openingScreen) {
        openingScreen.classList.add("hidden");
    }

    heartMaterial.opacity = 0;
    heart.scale.set(0.1, 0.1, 0.1);

    const fadeStart = performance.now();

    function revealHeart(now) {
        const progress = Math.min(
            (now - fadeStart) / 2200,
            1
        );

        heartMaterial.opacity = progress;

        const scale = 0.1 + progress * 0.75;

        heart.scale.set(scale, scale, scale);

        if (progress < 1) {
            requestAnimationFrame(revealHeart);
        }
    }

    requestAnimationFrame(revealHeart);

    setTimeout(explodeHeart, 4500);
    setTimeout(reformHeart, 6500);

    setTimeout(() => {
        if (particleMessage) {
            particleMessage.classList.add("visible");
        }
    }, 7800);

    setTimeout(() => {
        if (messageScreen) {
            messageScreen.classList.add("visible");
        }

        setTimeout(() => {
            if (messageScreen) {
                messageScreen.style.transition = "opacity 2s ease";
                messageScreen.style.opacity = "0";
            }

            setTimeout(showFinalEnding, 2200);

        }, 12000);

    }, 10500);
}

if (beginButton) {
    beginButton.addEventListener("click", startExperience);
} else {
    console.error("Cannot find #beginExperience");
}

// ======================================================
// ANIMATION LOOP
// ======================================================

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsed = clock.elapsedTime;

    if (experienceStarted) {
        heart.rotation.y += delta * 0.12;

        heart.rotation.x =
            Math.sin(elapsed * 0.35) * 0.08;
    }

    stars.rotation.y += delta * 0.006;
    stars.rotation.x += delta * 0.002;

    glowLight.intensity =
        4.5 + Math.sin(elapsed * 1.5) * 1.2;

    updateParticles(elapsed);

    renderer.render(scene, camera);
}

animate();

// ======================================================
// RESPONSIVE RESIZE
// ======================================================

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );
});

updateSoundButton();

console.log("DEAR FAVOUR — EXPERIENCE READY");