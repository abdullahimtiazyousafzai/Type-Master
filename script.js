class TypingTestGame {
    constructor() {
        this.currentLevel = 1;
        this.score = 0;
        this.wpm = 0;
        this.accuracy = 100;
        this.timeLeft = 60;
        this.gameActive = false;
        this.timer = null;
        this.startTime = null;
        this.wordsTyped = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        this.currentWordIndex = 0;
        this.currentText = '';
        this.userInput = '';
        
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
            score: document.getElementById('score'),
            wpm: document.getElementById('wpm'),
            accuracy: document.getElementById('accuracy'),
            timer: document.getElementById('timer'),
            targetText: document.getElementById('targetText'),
            userInput: document.getElementById('userInput'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            startBtn: document.getElementById('startBtn'),
            resetBtn: document.getElementById('resetBtn'),
            levelInfo: document.getElementById('levelInfo'),
            gameOverModal: document.getElementById('gameOverModal'),
            finalLevel: document.getElementById('finalLevel'),
            finalScore: document.getElementById('finalScore'),
            finalWpm: document.getElementById('finalWpm'),
            finalAccuracy: document.getElementById('finalAccuracy'),
            playAgainBtn: document.getElementById('playAgainBtn')
        };
    }
    
    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.resetBtn.addEventListener('click', () => this.resetGame());
        this.elements.playAgainBtn.addEventListener('click', () => this.playAgain());
        
        this.elements.userInput.addEventListener('input', (e) => this.handleInput(e));
        this.elements.userInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    startGame() {
        this.gameActive = true;
        this.startTime = Date.now();
        this.elements.startBtn.disabled = true;
        this.elements.userInput.focus();
        
        this.generateText();
        this.startTimer();
    }
    
    resetGame() {
        this.gameActive = false;
        this.currentLevel = 1;
        this.score = 0;
        this.wpm = 0;
        this.accuracy = 100;
        this.timeLeft = 60;
        this.wordsTyped = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        this.currentWordIndex = 0;
        this.currentText = '';
        this.userInput = '';
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.elements.startBtn.disabled = false;
        this.elements.userInput.textContent = '';
        this.elements.targetText.textContent = 'Click "Start Game" to begin!';
        this.elements.gameOverModal.classList.remove('show');
        
        this.updateDisplay();
    }
    
    playAgain() {
        this.resetGame();
    }
    
    generateText() {
        const levelData = this.wordLists[this.currentLevel];
        const wordCount = Math.min(10 + this.currentLevel * 2, 20); // More words per level
        const words = [];
        
        for (let i = 0; i < wordCount; i++) {
            const randomWord = levelData.words[Math.floor(Math.random() * levelData.words.length)];
            words.push(randomWord);
        }
        
        this.currentText = words.join(' ');
        this.elements.targetText.textContent = this.currentText;
        this.elements.userInput.textContent = '';
        this.userInput = '';
        this.currentWordIndex = 0;
        this.totalChars = this.currentText.length;
        this.correctChars = 0;
        
        this.updateProgress();
    }
    
    startTimer() {
        this.timeLeft = this.wordLists[this.currentLevel].timeLimit;
        this.elements.timer.textContent = this.timeLeft;
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.elements.timer.textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    handleInput(e) {
        if (!this.gameActive) return;
        
        this.userInput = e.target.textContent;
        this.checkProgress();
        this.calculateStats();
    }
    
    handleKeyDown(e) {
        if (!this.gameActive) return;
        
        // Prevent line breaks
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    }
    
    checkProgress() {
        const targetWords = this.currentText.split(' ');
        const userWords = this.userInput.split(' ').filter(word => word.length > 0);
        
        let correctChars = 0;
        let totalChars = 0;
        
        for (let i = 0; i < userWords.length; i++) {
            if (i < targetWords.length) {
                const targetWord = targetWords[i];
                const userWord = userWords[i];
                
                for (let j = 0; j < Math.min(targetWord.length, userWord.length); j++) {
                    totalChars++;
                    if (targetWord[j] === userWord[j]) {
                        correctChars++;
                    }
                }
                
                // Count remaining characters in target word
                if (targetWord.length > userWord.length) {
                    totalChars += targetWord.length - userWord.length;
                }
            }
        }
        
        this.correctChars = correctChars;
        this.wordsTyped = userWords.length;
        
        // Check if level is complete
        if (userWords.length >= targetWords.length) {
            this.completeLevel();
        }
        
        this.updateProgress();
    }
    
    completeLevel() {
        this.score += this.calculateLevelScore();
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
    
    calculateLevelScore() {
        const baseScore = 100;
        const timeBonus = Math.max(0, this.timeLeft * 2);
        const accuracyBonus = Math.floor((this.accuracy / 100) * 50);
        const levelMultiplier = this.currentLevel;
        
        return (baseScore + timeBonus + accuracyBonus) * levelMultiplier;
    }
    
    calculateStats() {
        if (this.startTime) {
            const elapsed = (Date.now() - this.startTime) / 1000 / 60; // minutes
            this.wpm = elapsed > 0 ? Math.round((this.wordsTyped / elapsed)) : 0;
        }
        
        this.accuracy = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.elements.level.textContent = this.currentLevel;
        this.elements.score.textContent = this.score;
        this.elements.wpm.textContent = this.wpm;
        this.elements.accuracy.textContent = this.accuracy + '%';
        
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
        const targetWords = this.currentText.split(' ');
        const userWords = this.userInput.split(' ').filter(word => word.length > 0);
        const progress = Math.min((userWords.length / targetWords.length) * 100, 100);
        
        this.elements.progressFill.style.width = progress + '%';
        this.elements.progressText.textContent = `${userWords.length} / ${targetWords.length} words`;
    }
    
    endGame() {
        this.gameActive = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Calculate final stats
        this.calculateStats();
        
        // Show game over modal
        this.elements.finalLevel.textContent = this.currentLevel;
        this.elements.finalScore.textContent = this.score;
        this.elements.finalWpm.textContent = this.wpm;
        this.elements.finalAccuracy.textContent = this.accuracy + '%';
        
        this.elements.gameOverModal.classList.add('show');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TypingTestGame();
});
