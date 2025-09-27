class TypeMaster {
    constructor() {
        this.currentLevel = 1;
        this.timeLeft = 60;
        this.gameActive = false;
        this.timer = null;
        this.startTime = null;
        this.endTime = null;
        this.wordsCompleted = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        this.currentCharIndex = 0;
        this.currentText = '';
        this.userInput = '';
        this.errors = 0;
        this.bestAccuracy = parseInt(localStorage.getItem('bestAccuracy')) || 100;
        this.finalWpm = 0;
        this.finalAccuracy = 100;
        this.usedWords = new Set(); // Track words used in current game
        
        // Word lists for different difficulty levels
        this.wordLists = {
            1: { // Beginner - Simple 3-5 letter words
                words: ['cat', 'dog', 'run', 'jump', 'play', 'book', 'tree', 'blue', 'red', 'sun', 'moon', 'star', 'fish', 'bird', 'hand', 'foot', 'eye', 'ear', 'nose', 'hair', 'home', 'love', 'good', 'nice', 'happy', 'small', 'big', 'fast', 'slow', 'hot', 'cold', 'new', 'old', 'high', 'low', 'yes', 'no', 'up', 'down'],
                timeLimit: 60,
                description: 'Simple words, no time pressure'
            },
            2: { // Easy - 4-6 letter words
                words: ['house', 'water', 'green', 'black', 'white', 'brown', 'yellow', 'orange', 'purple', 'pink', 'table', 'chair', 'window', 'door', 'floor', 'ceiling', 'kitchen', 'bedroom', 'bathroom', 'garden', 'flower', 'grass', 'mountain', 'river', 'ocean', 'forest', 'desert', 'island', 'bridge', 'castle', 'palace', 'temple', 'church', 'school', 'hospital', 'library', 'museum', 'theater', 'restaurant', 'hotel'],
                timeLimit: 50,
                description: 'Common words, moderate pace'
            },
            3: { // Medium - 5-8 letter words
                words: ['computer', 'keyboard', 'monitor', 'internet', 'website', 'browser', 'software', 'hardware', 'program', 'function', 'variable', 'database', 'network', 'security', 'password', 'username', 'account', 'profile', 'setting', 'option', 'feature', 'version', 'update', 'download', 'upload', 'install', 'uninstall', 'restart', 'shutdown', 'backup', 'recovery', 'maintenance', 'troubleshoot', 'diagnostic', 'performance', 'optimization', 'configuration', 'customization', 'integration', 'compatibility'],
                timeLimit: 45,
                description: 'Technical terms, faster pace'
            },
            4: { // Hard - 6-10 letter words
                words: ['algorithm', 'architecture', 'authentication', 'authorization', 'cryptography', 'encryption', 'decryption', 'infrastructure', 'implementation', 'documentation', 'specification', 'requirement', 'development', 'deployment', 'maintenance', 'troubleshooting', 'optimization', 'configuration', 'customization', 'integration', 'compatibility', 'functionality', 'capability', 'reliability', 'scalability', 'availability', 'performance', 'efficiency', 'productivity', 'collaboration', 'communication', 'coordination', 'management', 'administration', 'supervision', 'monitoring', 'evaluation', 'assessment', 'analysis', 'synthesis'],
                timeLimit: 40,
                description: 'Complex technical terms, high speed'
            },
            5: { // Expert - 8+ letter words, complex sentences
                words: ['sophisticated', 'comprehensive', 'multidisciplinary', 'interdisciplinary', 'transdisciplinary', 'methodology', 'philosophy', 'psychology', 'sociology', 'anthropology', 'archaeology', 'geography', 'meteorology', 'astronomy', 'astrophysics', 'biochemistry', 'biotechnology', 'nanotechnology', 'microbiology', 'epidemiology', 'pharmacology', 'pathology', 'physiology', 'anatomy', 'neurology', 'cardiology', 'dermatology', 'ophthalmology', 'orthopedics', 'pediatrics', 'geriatrics', 'psychiatry', 'psychotherapy', 'psychoanalysis', 'psychopharmacology', 'neuropsychology', 'neuropharmacology', 'neurophysiology', 'neuroanatomy', 'neurobiology'],
                timeLimit: 35,
                description: 'Expert-level vocabulary, maximum speed'
            }
        };
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.elements = {
            level: document.getElementById('level'),
            timerDisplay: document.getElementById('timerDisplay'),
            wordsCompleted: document.getElementById('wordsCompleted'),
            progress: document.getElementById('progress'),
            timer: document.getElementById('timer'),
            targetText: document.getElementById('targetText'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            startBtn: document.getElementById('startBtn'),
            resetBtn: document.getElementById('resetBtn'),
            levelInfo: document.getElementById('levelInfo'),
            gameOverModal: document.getElementById('gameOverModal'),
            finalLevel: document.getElementById('finalLevel'),
            finalWpm: document.getElementById('finalWpm'),
            finalAccuracy: document.getElementById('finalAccuracy'),
            bestAccuracy: document.getElementById('bestAccuracy'),
            playAgainBtn: document.getElementById('playAgainBtn')
        };
    }
    
    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.resetBtn.addEventListener('click', () => this.resetGame());
        this.elements.playAgainBtn.addEventListener('click', () => this.playAgain());
        
        // Desktop keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Mobile keyboard support
        document.addEventListener('input', (e) => {
            if (e.target === this.mobileInput && this.gameActive) {
                const inputValue = e.target.value;
                if (inputValue.length > this.userInput.length) {
                    // New character typed
                    const newChar = inputValue[inputValue.length - 1];
                    this.handleInput(newChar);
                }
                // Reset the input value to prevent accumulation
                e.target.value = '';
            }
        });
        
        // Focus management for mobile
        this.elements.targetText.addEventListener('click', () => this.focusForMobile());
        
        // Prevent zoom on double tap for mobile
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    startGame() {
        this.gameActive = true;
        this.startTime = Date.now();
        this.elements.startBtn.disabled = true;
        
        this.generateText();
        this.startTimer();
        
        // Auto-focus for mobile devices
        this.focusForMobile();
    }
    
    resetGame() {
        this.gameActive = false;
        this.currentLevel = 1;
        this.timeLeft = 60;
        this.wordsCompleted = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        this.currentCharIndex = 0;
        this.currentText = '';
        this.userInput = '';
        this.errors = 0;
        this.finalWpm = 0;
        this.finalAccuracy = 100;
        this.usedWords.clear(); // Clear used words for new game
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.elements.startBtn.disabled = false;
        this.elements.targetText.innerHTML = 'Click "Start Game" to begin!';
        this.elements.gameOverModal.classList.remove('show');
        
        this.updateDisplay();
    }
    
    playAgain() {
        this.resetGame();
    }
    
    generateText() {
        const levelData = this.wordLists[this.currentLevel];
        const wordCount = Math.min(10 + this.currentLevel * 2, 20);
        const words = [];
        
        // Get available words (not yet used in this game)
        const availableWords = levelData.words.filter(word => !this.usedWords.has(word));
        
        for (let i = 0; i < wordCount; i++) {
            let selectedWord;
            
            if (availableWords.length > 0) {
                // Select from available words
                const randomIndex = Math.floor(Math.random() * availableWords.length);
                selectedWord = availableWords[randomIndex];
                // Remove selected word from available words
                availableWords.splice(randomIndex, 1);
            } else {
                // If no more unique words, allow repeats but prefer less used ones
                const wordUsage = {};
                this.usedWords.forEach(word => {
                    wordUsage[word] = (wordUsage[word] || 0) + 1;
                });
                
                // Find least used words
                let leastUsedCount = Math.min(...Object.values(wordUsage));
                const leastUsedWords = levelData.words.filter(word => 
                    (wordUsage[word] || 0) === leastUsedCount
                );
                
                selectedWord = leastUsedWords[Math.floor(Math.random() * leastUsedWords.length)];
            }
            
            words.push(selectedWord);
            this.usedWords.add(selectedWord);
        }
        
        this.currentText = words.join(' ');
        this.totalChars = this.currentText.length;
        this.currentCharIndex = 0;
        this.correctChars = 0;
        this.errors = 0;
        this.userInput = '';
        
        this.renderText();
        this.updateProgress();
    }
    
    renderText() {
        let html = '';
        for (let i = 0; i < this.currentText.length; i++) {
            let className = 'letter';
            const char = this.currentText[i];
            
            // Add space class for space characters
            if (char === ' ') {
                className += ' space';
            }
            
            if (i < this.currentCharIndex) {
                // Check if this character was typed correctly
                const userChar = this.userInput[i];
                const targetChar = this.currentText[i];
                if (userChar === targetChar) {
                    className += ' correct';
                } else {
                    className += ' incorrect';
                }
            } else if (i === this.currentCharIndex) {
                className += ' current';
            } else {
                className += ' pending';
            }
            
            // Handle space character display - make spaces empty
            const displayChar = char === ' ' ? '' : char;
            html += `<span class="${className}">${displayChar}</span>`;
        }
        
        this.elements.targetText.innerHTML = html;
    }
    
    startTimer() {
        this.timeLeft = this.wordLists[this.currentLevel].timeLimit;
        this.elements.timer.textContent = this.timeLeft;
        this.elements.timerDisplay.textContent = this.timeLeft + 's';
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.elements.timer.textContent = this.timeLeft;
            this.elements.timerDisplay.textContent = this.timeLeft + 's';
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    focusForMobile() {
        // Create a hidden input for mobile keyboard support
        if (!this.mobileInput) {
            this.mobileInput = document.createElement('input');
            this.mobileInput.style.position = 'absolute';
            this.mobileInput.style.left = '-9999px';
            this.mobileInput.style.opacity = '0';
            this.mobileInput.style.pointerEvents = 'none';
            this.mobileInput.autocomplete = 'off';
            this.mobileInput.autocorrect = 'off';
            this.mobileInput.autocapitalize = 'off';
            this.mobileInput.spellcheck = false;
            document.body.appendChild(this.mobileInput);
        }
        
        if (this.gameActive) {
            this.mobileInput.focus();
        }
    }
    
    handleKeyDown(e) {
        if (!this.gameActive) return;
        
        // Prevent default behavior for certain keys
        if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab') {
            e.preventDefault();
            return;
        }
        
        // Only handle printable characters
        if (e.key.length === 1) {
            e.preventDefault();
            this.handleInput(e.key);
        }
    }
    
    handleInput(key) {
        if (this.currentCharIndex >= this.currentText.length) {
            this.completeLevel();
            return;
        }
        
        const targetChar = this.currentText[this.currentCharIndex];
        const isCorrect = key === targetChar;
        
        if (isCorrect) {
            this.correctChars++;
        } else {
            this.errors++;
        }
        
        this.userInput += key;
        this.currentCharIndex++;
        
        this.renderText();
        this.updateProgress();
        
        // Check if level is complete
        if (this.currentCharIndex >= this.currentText.length) {
            setTimeout(() => this.completeLevel(), 100);
        }
    }
    
    completeLevel() {
        this.wordsCompleted++;
        this.currentLevel++;
        
        if (this.currentLevel > 5) {
            this.endGame();
            return;
        }
        
        // Clear timer and generate new text
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.generateText();
        this.startTimer();
        this.updateDisplay();
    }
    
    calculateFinalStats() {
        // Calculate final WPM
        if (this.startTime && this.endTime) {
            const elapsed = (this.endTime - this.startTime) / 1000 / 60; // minutes
            this.finalWpm = elapsed > 0 ? Math.round((this.correctChars / 5) / elapsed) : 0;
        }
        
        // Calculate final accuracy
        this.finalAccuracy = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;
        
        // Update best accuracy if current is better
        if (this.finalAccuracy > this.bestAccuracy) {
            this.bestAccuracy = this.finalAccuracy;
            localStorage.setItem('bestAccuracy', this.bestAccuracy.toString());
        }
    }
    
    updateDisplay() {
        this.elements.level.textContent = this.currentLevel;
        this.elements.wordsCompleted.textContent = this.wordsCompleted;
        
        // Calculate progress percentage
        const progress = this.totalChars > 0 ? Math.round((this.currentCharIndex / this.totalChars) * 100) : 0;
        this.elements.progress.textContent = progress + '%';
        
        // Update level info
        const levelData = this.wordLists[this.currentLevel];
        if (levelData) {
            this.elements.levelInfo.innerHTML = `
                <h3>Level ${this.currentLevel}: ${this.getLevelName(this.currentLevel)}</h3>
                <p>${levelData.description}</p>
                <p>Time limit: ${levelData.timeLimit} seconds</p>
            `;
        }
    }
    
    getLevelName(level) {
        const names = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
        return names[level - 1] || 'Master';
    }
    
    updateProgress() {
        const progress = Math.min((this.currentCharIndex / this.currentText.length) * 100, 100);
        
        this.elements.progressFill.style.width = progress + '%';
        this.elements.progressText.textContent = `Progress: ${Math.round(progress)}%`;
        
        // Update the progress display in header
        const overallProgress = this.totalChars > 0 ? Math.round((this.currentCharIndex / this.totalChars) * 100) : 0;
        this.elements.progress.textContent = overallProgress + '%';
    }
    
    endGame() {
        this.gameActive = false;
        this.endTime = Date.now();
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Calculate final stats
        this.calculateFinalStats();
        
        // Show game over modal
        this.elements.finalLevel.textContent = this.currentLevel;
        this.elements.finalWpm.textContent = this.finalWpm;
        this.elements.finalAccuracy.textContent = this.finalAccuracy + '%';
        this.elements.bestAccuracy.textContent = this.bestAccuracy + '%';
        
        console.log('Final stats:', {
            finalWpm: this.finalWpm,
            finalAccuracy: this.finalAccuracy,
            bestAccuracy: this.bestAccuracy
        });
        
        this.elements.gameOverModal.classList.add('show');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TypeMaster();
});