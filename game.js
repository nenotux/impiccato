// Variabili globali
let gameMode = '';
let currentWord = '';
let guessedLetters = [];
let wrongGuesses = 0;
let consecutiveErrors = 0;
const maxWrongs = 8;
let gameActive = false;
let hintsGiven = 0;

// Lista parole per bambini - varie lunghezze (3-12 lettere)
const wordLists = {
    facile: [
        // Parole corte (3-4 lettere)
        'MAMMA', 'PAPA', 'CASA', 'SOLE', 'LUNA', 'MARE', 'CANE', 'GATTO',
        'PANE', 'MELA', 'PERA', 'NONNA', 'NONNO', 'ROSA', 'ORSO', 'LAGO',
        'NEVE', 'VOLO', 'BACIO', 'RISO', 'SALE', 'LUCE', 'VOCE', 'PACE',
        
        // Parole medie (5-6 lettere)
        'PALLA', 'LATTE', 'ACQUA', 'FIORE', 'CUORE', 'BIMBO', 'GIOCO',
        'PIZZA', 'PASTA', 'TORTA', 'GELATO', 'LIBRO', 'SCUOLA', 'AMICO',
        'FESTA', 'REGALO', 'ROSSO', 'VERDE', 'GIALLO', 'NERO', 'FUOCO',
        'ARIA', 'TERRA', 'CIELO', 'STELLA', 'NUVOLA', 'PIOGGIA', 'VENTO',
        'BOSCO', 'MONTE', 'FIUME', 'PONTE', 'STRADA', 'TRENO', 'AEREO',
        'BARCA', 'BICI', 'CAVALLO', 'MUCCA', 'PECORA', 'FARFALLA', 'UCCELLO',
        'PESCE', 'BALENA', 'DELFINO',
        
        // Parole più lunghe (7-10 lettere)
        'BAMBINO', 'BAMBINA', 'FRATELLO', 'SORELLA', 'FAMIGLIA', 'MACCHINA',
        'COMPUTER', 'CONIGLIO', 'TARTARUGA', 'FRIGORIFERO', 'BICICLETTA',
        'PRIMAVERA', 'AUTUNNO', 'INVERNO', 'ARCOBALENO', 'DINOSAURO',
        'COCCINELLA', 'GIRASOLE', 'MARGHERITA', 'CIOCCOLATO', 'CARAMELLA',
        'PALLONCINO', 'GIOCATTOLO', 'PASTICCINO', 'PANETTERIA', 'BIBLIOTECA',
        'RISTORANTE', 'OSPEDALE', 'MONTAGNA', 'CAMPAGNA', 'SPIAGGIA',
        'GIARDINO', 'QUADERNO', 'MATITA', 'DISEGNO', 'PITTURA',
        'MUSICA', 'CANZONE', 'CHITARRA', 'PIANOFORTE', 'TAMBURO',
        'CALCIO', 'PALLAVOLO', 'NUOTO', 'BALLO', 'CORSA',
        'ELEFANTE', 'GIRAFFA', 'LEONE', 'TIGRE', 'PINGUINO', 'CANGURO',
        'ASTRONAUTA', 'POMPIERE', 'DOTTORE', 'MAESTRO', 'POLIZIOTTO',
        
        // Parole molto lunghe (11-12 lettere)
        'SUPERMERCATO', 'TELEVISIONE', 'AUTOMOBILE', 'COMPLEANNO',
        'LAVASTOVIGLIE'
    ]
};

// Parti del corpo dell'impiccato
const hangmanParts = ['head', 'leftEye', 'rightEye', 'mouth', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];

// Suoni
let audioContext;
let sounds = { error: null, success: null, gameover: null, hint: null };

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        createSounds();
    } catch (e) {
        console.log('Web Audio API non supportata');
    }
}

function createSounds() {
    sounds.error = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    };
    
    sounds.success = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    };
    
    sounds.hint = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    };
    
    sounds.gameover = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    };
}

function playSound(soundName) {
    if (audioContext && sounds[soundName]) {
        try { sounds[soundName](); } catch (e) { console.log('Errore suono:', e); }
    }
}

function selectMode(mode) {
    gameMode = mode;
    if (!audioContext) initAudio();
    if (mode === 'single') {
        currentWord = getRandomWord();
        initGame();
    } else {
        showScreen('wordInput');
        document.getElementById('secretWord').focus();
    }
}

function getRandomWord() {
    // Nessun limite di lunghezza - tutte le parole disponibili
    const allWords = wordLists.facile;
    return allWords[Math.floor(Math.random() * allWords.length)];
}

function startGame() {
    const input = document.getElementById('secretWord').value.toUpperCase().trim();
    if (input.length < 2) { alert('La parola deve essere di almeno 2 lettere!'); return; }
    if (!/^[A-ZÀÈÉÌÒÙ]+$/.test(input)) { alert('La parola deve contenere solo lettere!'); return; }
    currentWord = input;
    initGame();
}

function initGame() {
    guessedLetters = [];
    wrongGuesses = 0;
    consecutiveErrors = 0;
    hintsGiven = 0;
    gameActive = true;
    document.getElementById('errors').textContent = '0';
    document.getElementById('hintMessage').classList.add('hidden');
    hideAllHangmanParts();
    showScreen('gameScreen');
    updateWordDisplay();
    createKeyboard();
    showEncouragementMessage('🎮 Iniziamo! Indovina la parola! 🌟');
}

function hideAllHangmanParts() {
    hangmanParts.forEach(part => {
        const element = document.getElementById(part);
        if (element) element.classList.add('hidden');
    });
}

function showHangmanPart(index) {
    if (index < hangmanParts.length) {
        const parts = hangmanParts.slice(0, Math.min(index + 1, hangmanParts.length));
        parts.forEach(part => {
            const element = document.getElementById(part);
            if (element) element.classList.remove('hidden');
        });
    }
}

function updateWordDisplay() {
    const display = document.getElementById('wordDisplay');
    display.innerHTML = '';
    for (let letter of currentWord) {
        const box = document.createElement('div');
        box.className = 'letter-box';
        if (letter === ' ') {
            box.style.border = 'none';
            box.style.width = '20px';
        } else if (guessedLetters.includes(letter)) {
            box.textContent = letter;
            box.classList.add('revealed');
        }
        display.appendChild(box);
    }
}

function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';
    
    // Layout tastiera italiana QWERTY - 3 righe
    const keyboardRows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
    
    keyboardRows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        for (let letter of row) {
            const key = document.createElement('button');
            key.className = 'key';
            key.textContent = letter;
            key.onclick = () => guessLetter(letter);
            rowDiv.appendChild(key);
        }
        keyboard.appendChild(rowDiv);
    });
}

function giveAutoHint() {
    const unguessedLetters = currentWord.split('').filter(letter => 
        letter !== ' ' && !guessedLetters.includes(letter)
    );
    if (unguessedLetters.length === 0) return;
    
    const lettersToReveal = Math.min(2, unguessedLetters.length);
    const revealedLetters = [];
    
    for (let i = 0; i < lettersToReveal; i++) {
        const randomIndex = Math.floor(Math.random() * unguessedLetters.length);
        const hintLetter = unguessedLetters.splice(randomIndex, 1)[0];
        guessedLetters.push(hintLetter);
        revealedLetters.push(hintLetter);
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            if (key.textContent === hintLetter) {
                key.classList.add('disabled', 'hint');
            }
        });
    }
    
    hintsGiven++;
    playSound('hint');
    const hintMsg = document.getElementById('hintMessage');
    hintMsg.textContent = `🌟 Ti aiuto! Ho rivelato: ${revealedLetters.join(', ')} 🌟`;
    hintMsg.classList.remove('hidden');
    hintMsg.classList.add('show-hint');
    setTimeout(() => {
        hintMsg.classList.remove('show-hint');
        setTimeout(() => { hintMsg.classList.add('hidden'); }, 300);
    }, 3000);
    updateWordDisplay();
    consecutiveErrors = 0;
    checkWin();
}

function showEncouragementMessage(message) {
    const hintMsg = document.getElementById('hintMessage');
    hintMsg.textContent = message;
    hintMsg.classList.remove('hidden');
    hintMsg.classList.add('show-hint');
    setTimeout(() => {
        hintMsg.classList.remove('show-hint');
        setTimeout(() => { hintMsg.classList.add('hidden'); }, 300);
    }, 2000);
}

function guessLetter(letter) {
    if (!gameActive || guessedLetters.includes(letter)) return;
    guessedLetters.push(letter);
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        if (key.textContent === letter) key.classList.add('disabled');
    });
    
    if (currentWord.includes(letter)) {
        playSound('success');
        consecutiveErrors = 0;
        keys.forEach(key => {
            if (key.textContent === letter) key.classList.add('correct');
        });
        const encouragements = [
            '🎉 Bravo! Continua così!',
            '⭐ Fantastico! Sei bravissimo!',
            '🌟 Ottimo! Vai avanti!',
            '💪 Grande! Ce la fai!',
            '🎈 Bene! Stai andando benissimo!'
        ];
        showEncouragementMessage(encouragements[Math.floor(Math.random() * encouragements.length)]);
        updateWordDisplay();
        checkWin();
    } else {
        playSound('error');
        consecutiveErrors++;
        keys.forEach(key => {
            if (key.textContent === letter) key.classList.add('wrong');
        });
        wrongGuesses++;
        document.getElementById('errors').textContent = wrongGuesses;
        if (consecutiveErrors >= 2) {
            setTimeout(() => giveAutoHint(), 800);
        }
        if (wrongGuesses === 1) showHangmanPart(3);
        else if (wrongGuesses === 2) showHangmanPart(4);
        else if (wrongGuesses === 3) showHangmanPart(5);
        else if (wrongGuesses === 4) showHangmanPart(6);
        else if (wrongGuesses === 5) showHangmanPart(7);
        else if (wrongGuesses === 6) showHangmanPart(8);
        else if (wrongGuesses >= 8) checkLose();
    }
}

function checkWin() {
    const allLettersGuessed = currentWord.split('').every(letter => 
        letter === ' ' || guessedLetters.includes(letter)
    );
    if (allLettersGuessed) {
        gameActive = false;
        setTimeout(() => showMessage('win'), 500);
    }
}

function checkLose() {
    gameActive = false;
    playSound('gameover');
    setTimeout(() => showMessage('lose'), 500);
}

function showMessage(type) {
    const message = document.getElementById('gameMessage');
    message.className = 'game-message ' + type;
    if (type === 'win') {
        message.innerHTML = `
            <h2>🎉 BRAVISSIMO! 🎉</h2>
            <p>Hai indovinato la parola!</p>
            <div class="revealed-word">${currentWord}</div>
            <p class="celebration">🌟⭐✨ Sei un campione! ✨⭐🌟</p>
            <button class="btn-primary" onclick="restartGame()">Gioca Ancora 🔄</button>
        `;
    } else {
        message.innerHTML = `
            <h2>😊 Quasi!</h2>
            <p>La parola era:</p>
            <div class="revealed-word">${currentWord}</div>
            <p>Riprova, sono sicuro che ci riuscirai! 💪</p>
            <button class="btn-primary" onclick="restartGame()">Gioca Ancora 🔄</button>
        `;
    }
    message.classList.remove('hidden');
}

function restartGame() {
    document.getElementById('gameMessage').classList.add('hidden');
    showScreen('modeSelection');
    gameMode = '';
    currentWord = '';
    document.getElementById('secretWord').value = '';
}

function backToMode() {
    showScreen('modeSelection');
    document.getElementById('secretWord').value = '';
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    const key = e.key.toUpperCase();
    const validKeys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (validKeys.includes(key) && !guessedLetters.includes(key)) {
        guessLetter(key);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const secretWordInput = document.getElementById('secretWord');
    if (secretWordInput) {
        secretWordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') startGame();
        });
    }
});

document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) event.preventDefault();
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) event.preventDefault();
    lastTouchEnd = now;
}, { passive: false });
