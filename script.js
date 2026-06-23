/* ==========================================================================
   AMBIENT PARTICLE CANVAS SYSTEM
   ========================================================================== */
const canvas = document.getElementById('ambient-particles');
const ctx = canvas.getContext('2d');

let particles = [];
let theme = 'argentina'; // Default theme

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height + canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedY = -(Math.random() * 1 + 0.4);
        this.speedX = Math.random() * 0.6 - 0.3;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = this.getColor();
    }

    getColor() {
        if (theme === 'argentina') {
            // Albiceleste: Sky blue, gold, white
            const colors = ['#74acdf', '#ffffff', '#f6b312', '#97c7f3'];
            return colors[Math.floor(Math.random() * colors.length)];
        } else {
            // Blaugrana: Deep blue, burgundy red, gold
            const colors = ['#004d98', '#a50044', '#edbb00', '#002f5c'];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;

        if (this.y < -10) {
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.shadowBlur = this.size * 2;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// Populate particles
const particleCount = 70;
for (let i = 0; i < particleCount; i++) {
    const p = new Particle();
    p.y = Math.random() * canvas.height;
    particles.push(p);
}

function updateThemeParticles() {
    particles.forEach(p => {
        p.color = p.getColor();
    });
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();


/* ==========================================================================
   CONFETTI VICTORY CELEBRATION SYSTEM
   ========================================================================== */
let confettiParticles = [];
let confettiActive = false;

class Confetti {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 3 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.color = this.getColor();
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
    }

    getColor() {
        const colors = theme === 'argentina' ? 
            ['#74acdf', '#ffffff', '#f6b312', '#ffd700'] : 
            ['#004d98', '#a50044', '#edbb00', '#ff0055'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

function triggerConfettiBurst() {
    confettiParticles = [];
    confettiActive = true;
    for (let i = 0; i < 120; i++) {
        confettiParticles.push(new Confetti());
    }
    
    // Animate confetti in particles loop temporarily
    let duration = 3000; // 3 seconds confetti duration
    const startTime = Date.now();
    
    function runConfetti() {
        if (!confettiActive) return;
        confettiParticles.forEach((c, index) => {
            c.update();
            c.draw();
            // remove if out of screen
            if (c.y > canvas.height) {
                confettiParticles.splice(index, 1);
            }
        });
        
        if (Date.now() - startTime < duration || confettiParticles.length > 0) {
            requestAnimationFrame(runConfetti);
        } else {
            confettiActive = false;
        }
    }
    runConfetti();
}


/* ==========================================================================
   WEB AUDIO STADIUM AUDIO SYNTHESIZER
   ========================================================================== */
let audioCtx = null;
let ambientNoiseSource = null;
let ambientGainNode = null;
let isAmbientPlaying = false;
let lfo = null;

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function createAmbientNoise() {
    if (!audioCtx) return;

    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Pink noise filter approximation for deep roar
    let b0 = 0.0, b1 = 0.0, b2 = 0.0, b3 = 0.0, b4 = 0.0, b5 = 0.0, b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
    }

    ambientNoiseSource = audioCtx.createBufferSource();
    ambientNoiseSource.buffer = noiseBuffer;
    ambientNoiseSource.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 1.0;

    ambientGainNode = audioCtx.createGain();
    const volSliderVal = parseFloat(document.getElementById('ambient-volume').value);
    ambientGainNode.gain.setValueAtTime(0, audioCtx.currentTime);

    lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.12; 
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.06;

    lfo.connect(lfoGain);
    lfoGain.connect(ambientGainNode.gain);

    ambientNoiseSource.connect(filter);
    filter.connect(ambientGainNode);
    ambientGainNode.connect(audioCtx.destination);

    ambientNoiseSource.start(0);
    lfo.start(0);

    ambientGainNode.gain.linearRampToValueAtTime(volSliderVal, audioCtx.currentTime + 1.5);
}

function toggleAmbientSound() {
    initAudio();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const btn = document.getElementById('btn-ambient-toggle');
    const panel = document.getElementById('sound-control-panel');

    if (!isAmbientPlaying) {
        createAmbientNoise();
        isAmbientPlaying = true;
        btn.querySelector('.sound-label').innerText = 'Atmosphere ON';
        panel.classList.add('active');
    } else {
        if (ambientGainNode) {
            const currentVol = ambientGainNode.gain.value;
            ambientGainNode.gain.setValueAtTime(currentVol, audioCtx.currentTime);
            ambientGainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
            
            setTimeout(() => {
                if (ambientNoiseSource) ambientNoiseSource.stop();
                if (lfo) lfo.stop();
                ambientNoiseSource = null;
                lfo = null;
            }, 600);
        }
        isAmbientPlaying = false;
        btn.querySelector('.sound-label').innerText = 'Stadium Noise';
        panel.classList.remove('active');
    }
}

function handleVolumeChange(e) {
    const volume = parseFloat(e.target.value);
    if (isAmbientPlaying && ambientGainNode) {
        ambientGainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    }
}

function playWhistle() {
    initAudio();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const now = audioCtx.currentTime;
    
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const whistleGain = audioCtx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.value = 2200;
    
    osc2.type = 'sine';
    osc2.frequency.value = 2240; 
    
    const flutter = audioCtx.createOscillator();
    flutter.frequency.value = 24; 
    
    const flutterGain = audioCtx.createGain();
    flutterGain.gain.value = 50; 
    
    flutter.connect(flutterGain);
    flutterGain.connect(osc1.frequency);
    flutterGain.connect(osc2.frequency);
    
    whistleGain.gain.setValueAtTime(0, now);
    whistleGain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    whistleGain.gain.exponentialRampToValueAtTime(0.00001, now + 0.45);
    
    osc1.connect(whistleGain);
    osc2.connect(whistleGain);
    whistleGain.connect(audioCtx.destination);
    
    flutter.start(now);
    osc1.start(now);
    osc2.start(now);
    
    flutter.stop(now + 0.45);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
}

function playCheer() {
    initAudio();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const now = audioCtx.currentTime;
    const sampleRate = audioCtx.sampleRate;
    const bufferSize = 2.5 * sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    const cheerFilter = audioCtx.createBiquadFilter();
    cheerFilter.type = 'bandpass';
    cheerFilter.frequency.setValueAtTime(350, now);
    cheerFilter.frequency.exponentialRampToValueAtTime(850, now + 0.4); 
    cheerFilter.frequency.exponentialRampToValueAtTime(500, now + 2.0); 
    cheerFilter.Q.value = 1.2;
    
    const cheerGain = audioCtx.createGain();
    cheerGain.gain.setValueAtTime(0, now);
    cheerGain.gain.linearRampToValueAtTime(0.18, now + 0.3); 
    cheerGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5); 
    
    noiseSource.connect(cheerFilter);
    cheerFilter.connect(cheerGain);
    cheerGain.connect(audioCtx.destination);
    
    noiseSource.start(now);
    noiseSource.stop(now + 2.5);
}

document.getElementById('btn-ambient-toggle').addEventListener('click', toggleAmbientSound);
document.getElementById('ambient-volume').addEventListener('input', handleVolumeChange);


/* ==========================================================================
   THEME MANAGER ENGINE
   ========================================================================== */
const themeBtnArg = document.getElementById('theme-btn-arg');
const themeBtnBar = document.getElementById('theme-btn-bar');
const heroTitle = document.getElementById('dynamic-hero-title');
const heroParallaxBg = document.querySelector('.hero-parallax-bg');

function applyTheme(targetTheme) {
    if (theme === targetTheme) return;
    
    theme = targetTheme;
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'argentina') {
        themeBtnArg.classList.add('active');
        themeBtnBar.classList.remove('active');
        
        heroTitle.style.opacity = '0';
        setTimeout(() => {
            heroTitle.innerHTML = `<span class="cinzel-gold">LIONEL</span> <span class="cinzel-outline">MESSI</span>`;
            heroTitle.style.opacity = '1';
        }, 300);
    } else {
        themeBtnBar.classList.add('active');
        themeBtnArg.classList.remove('active');
        
        heroTitle.style.opacity = '0';
        setTimeout(() => {
            heroTitle.innerHTML = `<span class="cinzel-gold">LEO</span> <span class="cinzel-outline">MESSI</span>`;
            heroTitle.style.opacity = '1';
        }, 300);
    }

    updateThemeParticles();
}

themeBtnArg.addEventListener('click', () => applyTheme('argentina'));
themeBtnBar.addEventListener('click', () => applyTheme('barcelona'));


/* ==========================================================================
   SCROLL PARALLAX SYSTEM
   ========================================================================== */
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Parallax on hero background
    if (heroParallaxBg) {
        heroParallaxBg.style.transform = `translateY(${scrollY * 0.35}px)`;
    }

    // Interactive scroll rotation on jersey sphere
    const sphere = document.querySelector('.jersey-sphere');
    if (sphere) {
        sphere.style.transform = `rotateY(${scrollY * 0.15}deg) rotateX(${scrollY * -0.05}deg)`;
    }
});


/* ==========================================================================
   SCROLL REVEAL & METRIC COUNTERS
   ========================================================================== */
const metricsSection = document.getElementById('metrics-bar');
let countersTriggered = false;

function startCounter(element, target) {
    let current = 0;
    const duration = 2000;
    const stepTime = Math.abs(Math.floor(duration / target));
    const minStep = 15;
    const actualStepTime = Math.max(stepTime, minStep);
    const increment = Math.max(1, Math.floor(target / (duration / actualStepTime)));

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.innerText = target;
            clearInterval(timer);
        } else {
            element.innerText = current;
        }
    }, actualStepTime);
}

const metricsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !countersTriggered) {
            const vals = entry.target.querySelectorAll('.metric-val');
            vals.forEach(val => {
                const targetNum = parseInt(val.getAttribute('data-target'));
                startCounter(val, targetNum);
            });
            countersTriggered = true;
        }
    });
}, { threshold: 0.3 });
metricsObserver.observe(metricsSection);

const scrollReveals = document.querySelectorAll('.scroll-reveal');
const timelineHarness = document.querySelector('.timeline-harness');
const timelineProgress = document.querySelector('.timeline-progress');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

scrollReveals.forEach(el => revealObserver.observe(el));

window.addEventListener('scroll', () => {
    if (!timelineHarness) return;
    const rect = timelineHarness.getBoundingClientRect();
    const timelineHeight = rect.height;
    
    const windowHeight = window.innerHeight;
    const startScrollY = rect.top + window.scrollY - windowHeight / 1.5;
    const currentScrollY = window.scrollY;
    
    let progress = ((currentScrollY - startScrollY) / timelineHeight) * 100;
    progress = Math.max(0, Math.min(100, progress));
    
    timelineProgress.style.height = `${progress}%`;
});


/* ==========================================================================
   STATS ENGINE DATA
   ========================================================================== */
const statsData = {
    all: {
        ratio: 0.78,
        goals: 838,
        assists: 374,
        hattricks: 57,
        freekicks: 65
    },
    barca: {
        ratio: 0.86,
        goals: 672,
        assists: 269,
        hattricks: 48,
        freekicks: 50
    },
    arg: {
        ratio: 0.58,
        goals: 109,
        assists: 57,
        hattricks: 9,
        freekicks: 11
    },
    other: {
        ratio: 0.55,
        goals: 57,
        assists: 48,
        hattricks: 0,
        freekicks: 4
    }
};

const statsFilters = document.querySelectorAll('.stats-filter-btn');

function updateStatsEngine(filterType) {
    const data = statsData[filterType];
    
    const ratioFill = document.getElementById('ratio-fill');
    const ratioVal = document.getElementById('ratio-val');
    
    ratioVal.innerText = data.ratio;
    
    const totalOffset = 251.2;
    const scaleRatio = Math.min(1.0, data.ratio);
    const strokeOffset = totalOffset * (1 - scaleRatio);
    ratioFill.style.strokeDashoffset = strokeOffset;

    document.getElementById('lbl-goals').innerText = data.goals;
    document.getElementById('lbl-assists').innerText = data.assists;
    document.getElementById('lbl-hattricks').innerText = data.hattricks;
    document.getElementById('lbl-freekicks').innerText = data.freekicks;

    document.getElementById('bar-goals').style.width = `${(data.goals / 900) * 100}%`;
    document.getElementById('bar-assists').style.width = `${(data.assists / 400) * 100}%`;
    document.getElementById('bar-hattricks').style.width = `${(data.hattricks / 60) * 100}%`;
    document.getElementById('bar-freekicks').style.width = `${(data.freekicks / 70) * 100}%`;
}

statsFilters.forEach(btn => {
    btn.addEventListener('click', (e) => {
        statsFilters.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const filterType = e.target.getAttribute('data-filter');
        updateStatsEngine(filterType);
    });
});

setTimeout(() => {
    updateStatsEngine('all');
}, 500);


/* ==========================================================================
   FAMOUS QUOTES SLIDER
   ========================================================================== */
const quoteSlides = document.querySelectorAll('.quote-slide');
const quoteDots = document.querySelectorAll('.quote-dot');
let currentQuoteIndex = 0;
let quoteTimer = null;

function showQuote(index) {
    quoteSlides.forEach(slide => slide.classList.remove('active'));
    quoteDots.forEach(dot => dot.classList.remove('active'));
    
    currentQuoteIndex = index;
    quoteSlides[currentQuoteIndex].classList.add('active');
    quoteDots[currentQuoteIndex].classList.add('active');
}

function nextQuote() {
    let nextIndex = currentQuoteIndex + 1;
    if (nextIndex >= quoteSlides.length) nextIndex = 0;
    showQuote(nextIndex);
}

function startQuoteRotation() {
    clearInterval(quoteTimer);
    quoteTimer = setInterval(nextQuote, 6000); // 6 seconds slide duration
}

quoteDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-slide'));
        showQuote(index);
        startQuoteRotation();
    });
});

startQuoteRotation();


/* ==========================================================================
   DOCUMENTARY MOMENTS MODAL SCREENER
   ========================================================================== */
const momentsData = [
    {
        title: "Solo Run vs Getafe",
        era: "Copa del Rey 2007",
        narrative: "Receiving the ball from Xavi in his own half, 19-year-old Lionel Messi sprinted 60 meters, leaving five defenders and the goalkeeper stranded in his wake. The world stood still as the legendary solo run of Diego Maradona was perfectly recreated.",
        videoUrl: "https://www.youtube.com/embed/5vmm-xCq4To?autoplay=1"
    },
    {
        title: "The 91 Goals Record",
        era: "Calendar Year 2012",
        narrative: "A peak year of absolute, mathematical dominance. Over 69 appearances for Barcelona and Argentina, Leo found the net 91 times. This broke Gerd Müller's 40-year-old calendar year record and set a goalscoring mark that may never be matched.",
        videoUrl: "https://www.youtube.com/embed/qK75d4y53zM?autoplay=1"
    },
    {
        title: "The Bernabéu Shirt Lift",
        era: "El Clásico 2017",
        narrative: "Bloodied, bruised, and carrying Barcelona on his back, Messi scored a 92nd-minute Clásico winner at the Santiago Bernabéu. In a display of quiet dominance, he removed his shirt and held it high to the silent Madrid crowd, marking his 500th goal.",
        videoUrl: "https://www.youtube.com/embed/14d0Y71nL5w?autoplay=1"
    },
    {
        title: "The Lusail Coronation",
        era: "World Cup Qatar 2022",
        narrative: "The final piece of his destiny. Scoring twice in the final and converting his penalty in the shootout, Messi carried Argentina past France in a spectacular match. The tournament Golden Ball winner was finally crowned champion of the world.",
        videoUrl: "https://www.youtube.com/embed/2_H5VjT2S7s?autoplay=1"
    }
];

const cinemaModal = document.getElementById('cinema-modal');
const btnCloseCinema = document.getElementById('btn-close-cinema');
const scTitle = document.getElementById('sc-title');
const scEra = document.getElementById('sc-era');
const scNarrative = document.getElementById('sc-narrative');
const screenerIframe = document.getElementById('screener-video-iframe');
const momentCards = document.querySelectorAll('.moment-card');

function openCinemaModal(index) {
    const data = momentsData[index];
    scTitle.innerText = data.title;
    scEra.innerText = data.era;
    scNarrative.innerText = data.narrative;
    
    // Set video iframe source to play
    screenerIframe.src = data.videoUrl;
    
    cinemaModal.classList.remove('hidden');
    
    // Audio feedbacks
    playCheer();
    playWhistle();
}

function closeCinemaModal() {
    cinemaModal.classList.add('hidden');
    // Stop video playback immediately
    screenerIframe.src = "";
}

momentCards.forEach(card => {
    card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-moment-index'));
        openCinemaModal(idx);
    });
});

btnCloseCinema.addEventListener('click', closeCinemaModal);


/* ==========================================================================
   GOAT QUIZ GAME LOOP
   ========================================================================== */
const quizQuestions = [
    {
        question: "Who assisted Lionel Messi's first official senior goal for FC Barcelona?",
        options: ["Deco", "Xavi Hernandez", "Ronaldinho", "Samuel Eto'o"],
        correct: 2
    },
    {
        question: "How many goals did Messi score in his record-breaking calendar year of 2012?",
        options: ["82 Goals", "91 Goals", "79 Goals", "95 Goals"],
        correct: 1
    },
    {
        question: "Which team did Argentina defeat in the final to win the 2021 Copa América, ending Messi's senior trophy drought?",
        options: ["Brazil", "Colombia", "Chile", "Uruguay"],
        correct: 0
    },
    {
        question: "Messi signed his first agreement with Barcelona on a paper napkin. Who was the sporting director?",
        options: ["Joan Laporta", "Charly Rexach", "Sandro Rosell", "Pep Guardiola"],
        correct: 1
    },
    {
        question: "Against which club did Messi score his legendary solo goal in 2007, echoing Diego Maradona's Goal of the Century?",
        options: ["Real Madrid", "Atletico Madrid", "Getafe CF", "Sevilla FC"],
        correct: 2
    },
    {
        question: "How many Ballon d'Or awards has Messi secured throughout his career?",
        options: ["5 Awards", "6 Awards", "7 Awards", "8 Awards"],
        correct: 3
    },
    {
        question: "In 2012, Messi became the first player to score five goals in a single UCL match. Who was the opponent?",
        options: ["Arsenal FC", "Bayer Leverkusen", "AC Milan", "Celtic FC"],
        correct: 1
    },
    {
        question: "At which Rosario youth club did Lionel Messi begin his football training as a child?",
        options: ["Rosario Central", "Newell's Old Boys", "Boca Juniors", "River Plate"],
        correct: 1
    },
    {
        question: "Who was the manager that famously converted Messi into the 'False Nine' role?",
        options: ["Frank Rijkaard", "Tito Vilanova", "Pep Guardiola", "Alejandro Sabella"],
        correct: 2
    },
    {
        question: "Which major accolade did Messi win twice (2014 & 2022) at the FIFA World Cups?",
        options: ["Golden Shoe", "Golden Ball", "Best Young Player", "Fair Play Award"],
        correct: 1
    }
];

let currentQuestionIndex = 0;
let score = 0;
let quizTimer = null;
let timeLeft = 15;

const startView = document.getElementById('quiz-start-view');
const activeView = document.getElementById('quiz-active-view');
const resultsView = document.getElementById('quiz-results-view');
const btnStartQuiz = document.getElementById('btn-start-quiz');
const btnRestartQuiz = document.getElementById('btn-restart-quiz');
const timerFill = document.getElementById('quiz-timer-fill');
const timerLbl = document.getElementById('quiz-timer-lbl');
const currentQNum = document.getElementById('current-q-num');
const qText = document.getElementById('quiz-question-elem');
const optionsBox = document.getElementById('quiz-options-box');
const feedbackBox = document.getElementById('quiz-feedback-box');
const whistleAlert = document.getElementById('whistle-alert');

function startQuiz() {
    playWhistle();
    startView.classList.add('hidden');
    activeView.classList.remove('hidden');
    resultsView.classList.add('hidden');
    
    currentQuestionIndex = 0;
    score = 0;
    
    loadQuestion();
}

function loadQuestion() {
    clearInterval(quizTimer);
    feedbackBox.classList.add('hidden');
    
    if (currentQuestionIndex >= quizQuestions.length) {
        finishQuiz();
        return;
    }
    
    const qData = quizQuestions[currentQuestionIndex];
    currentQNum.innerText = currentQuestionIndex + 1;
    qText.innerText = qData.question;
    
    optionsBox.innerHTML = '';
    qData.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.innerHTML = `<span>${opt}</span> <span class="opt-indicator"></span>`;
        btn.addEventListener('click', () => selectAnswer(index));
        optionsBox.appendChild(btn);
    });
    
    timeLeft = 15;
    timerLbl.innerText = `${timeLeft}s`;
    timerFill.style.width = '100%';
    
    quizTimer = setInterval(() => {
        timeLeft--;
        timerLbl.innerText = `${timeLeft}s`;
        timerFill.style.width = `${(timeLeft / 15) * 100}%`;
        
        if (timeLeft <= 0) {
            clearInterval(quizTimer);
            triggerTimeOut();
        }
    }, 1000);
}

function selectAnswer(selectedIndex) {
    clearInterval(quizTimer);
    
    const qData = quizQuestions[currentQuestionIndex];
    const optionBtns = optionsBox.querySelectorAll('.quiz-option-btn');
    
    optionBtns.forEach(btn => btn.disabled = true);
    
    if (selectedIndex === qData.correct) {
        score++;
        optionBtns[selectedIndex].classList.add('correct');
        optionBtns[selectedIndex].querySelector('.opt-indicator').innerText = '✔';
        
        feedbackBox.className = 'quiz-feedback-banner correct-banner';
        feedbackBox.querySelector('#feedback-icon').innerText = '🏆';
        feedbackBox.querySelector('#feedback-text').innerText = 'CORRECT ANSWER!';
        feedbackBox.classList.remove('hidden');
        
        playCheer();
        flashVisualAlert('green-glow');
        triggerConfettiBurst(); // Flashes confetti!
    } else {
        optionBtns[selectedIndex].classList.add('incorrect');
        optionBtns[selectedIndex].querySelector('.opt-indicator').innerText = '✘';
        optionBtns[qData.correct].classList.add('correct');
        
        feedbackBox.className = 'quiz-feedback-banner incorrect-banner';
        feedbackBox.querySelector('#feedback-icon').innerText = '🟥';
        feedbackBox.querySelector('#feedback-text').innerText = 'INCORRECT CHOICE';
        feedbackBox.classList.remove('hidden');
        
        playWhistle();
        flashVisualAlert('red-card');
    }
    
    currentQuestionIndex++;
    setTimeout(loadQuestion, 2000);
}

function triggerTimeOut() {
    const qData = quizQuestions[currentQuestionIndex];
    const optionBtns = optionsBox.querySelectorAll('.quiz-option-btn');
    
    optionBtns.forEach(btn => btn.disabled = true);
    optionBtns[qData.correct].classList.add('correct');
    
    feedbackBox.className = 'quiz-feedback-banner incorrect-banner';
    feedbackBox.querySelector('#feedback-icon').innerText = '⏰';
    feedbackBox.querySelector('#feedback-text').innerText = 'OUT OF TIME!';
    feedbackBox.classList.remove('hidden');
    
    playWhistle();
    flashVisualAlert('red-card');
    
    currentQuestionIndex++;
    setTimeout(loadQuestion, 2000);
}

function flashVisualAlert(className) {
    whistleAlert.className = `whistle-flash ${className}`;
    setTimeout(() => {
        whistleAlert.className = 'whistle-flash';
    }, 450);
}

function finishQuiz() {
    activeView.classList.add('hidden');
    resultsView.classList.remove('hidden');
    
    document.getElementById('results-score').innerText = score;
    
    let rankBadge = '';
    let rankDesc = '';
    
    if (score >= 9) {
        rankBadge = "World Champion GOAT";
        rankDesc = "Incredible! You possess complete, flawless knowledge of Leo Messi's career. You are a legendary aficionado.";
        playCheer();
        triggerConfettiBurst();
    } else if (score >= 7) {
        rankBadge = "Camp Nou Icon";
        rankDesc = "Fantastic! You are extremely knowledgeable about Messi's historic feats and standard records. Outstanding.";
        playCheer();
        triggerConfettiBurst();
    } else if (score >= 4) {
        rankBadge = "La Masia Graduate";
        rankDesc = "A solid performance. You know his key achievements but missed some historical details. Keep studying the GOAT.";
    } else {
        rankBadge = "Rosario Rookie";
        rankDesc = "A tough outing! You need to review Leo's matches, statistics, and career highlights. Give it another try!";
        playWhistle();
    }
    
    document.getElementById('results-badge').innerText = rankBadge;
    document.getElementById('results-summary').innerText = rankDesc;
}

btnStartQuiz.addEventListener('click', startQuiz);
btnRestartQuiz.addEventListener('click', startQuiz);
