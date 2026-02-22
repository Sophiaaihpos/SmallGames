const ClickGame = Object.create(BaseGame);
Object.assign(ClickGame, {
    gameType: 'click',
    storageKey: 'clickGameHighscore',
    timeLeft: 60,
    timerText: null,
    timerInterval: null,
    spawnInterval: null,
    words: [],

    colors: {
        white: 0xffffff,
        yellow: 0xffff00,
        green: 0x00ff00,
        red: 0xff0000,
        blue: 0x0000ff,
        pink: 0xff69b4
    },

    colorNames: ['white', 'yellow', 'green', 'red', 'blue', 'pink'],

    init(app) {
        this.app = app;
        this.loadHighscore();
        this.ensureModals();
        this.showRulesScreen
    },

    showRulesScreen() {
        const modal = document.getElementById('difficulty-modal');
        if (!modal) return;

        modal.style.display = 'flex';
        modal.innerHTML = `
        <h1>Color Match</h1>
        <div style="color: white; font-size: 18px; max-width: 600px; text-align: left; margin-bottom: 40px;">
            <p>🎨 Click on words that match their color</p>
            <p>✅ If the word says "red" and is red, click it!</p>
            <p>❌ If the word says "red" but is blue, don't click it</p>
            <p>⏱️ You have 60 seconds to get as many correct as possible</p>
            <p>⚠️ One mistake and it's game over!</p>
        </div>
        <div class="button-group">
            <button class="btn" id="rules-continue-btn">Weiter</button>
        </div>
    `;

        document.getElementById('rules-continue-btn').onclick = () => {
            modal.style.display = 'none';
            this.startGame();
        };
    },

    startGame() {
        this.active = true;
        this.paused = false;
        this.score = 0;
        this.timeLeft = 60;
        this.words = [];

        this.app.stage.removeChildren();
        this.setupUI();

        this.timerText = new PIXI.Text('Zeit: 60s', { fill: 'white', fontSize: 24 });
        this.timerText.x = this.app.screen.width - 150;
        this.timerText.y = 10;
        this.app.stage.addChild(this.timerText);

        this.pauseBtn.onclick = () => this.togglePause();

        this.timerInterval = setInterval(() => {
            if (!this.active || this.paused) return;
            this.timeLeft--;
            this.timerText.text = 'Zeit: ' + this.timeLeft + 's';
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.showGameOver();
            }
        }, 1000);

        this.spawnInterval = setInterval(() => {
            if (!this.active || this.paused) return;
            if (this.words.length < 6) this.spawnThreeWords();
        }, 2000);

        this.ticker = () => this.update();
        this.app.ticker.add(this.ticker);
    },

    update() {
        if (!this.active || this.paused) return;
        this.words = this.words.filter(wordObj => {
            if (Date.now() - wordObj.createdAt > wordObj.timeout) {
                this.app.stage.removeChild(wordObj.text);
                return false;
            }
            return true;
        });
    },

    rectanglesOverlap(a, b) {
        return !(a.x + a.width < b.x || a.x > b.x + b.width || a.y + a.height < b.y || a.y > b.y + b.height);
    },

    findFreePosition(tempText) {
        for (let attempt = 0; attempt < 150; attempt++) {
            const x = Math.random() * (this.app.screen.width - tempText.width - 20) + 10;
            const y = Math.random() * (this.app.screen.height - tempText.height - 60) + 40;
            tempText.x = x;
            tempText.y = y;

            const newBounds = tempText.getBounds();
            let overlapping = this.words.some(wordObj => this.rectanglesOverlap(newBounds, wordObj.text.getBounds()));

            if (!overlapping) return { x, y };
        }
        return null;
    },

    spawnThreeWords() {
        const correctIndex = Math.floor(Math.random() * 3);
        const correctColorName = this.colorNames[Math.floor(Math.random() * this.colorNames.length)];

        for (let i = 0; i < 3; i++) {
            let colorName, displayColor, isCorrect;

            if (i === correctIndex) {
                colorName = correctColorName;
                displayColor = correctColorName;
                isCorrect = true;
            } else {
                colorName = this.colorNames[Math.floor(Math.random() * this.colorNames.length)];
                let differentColor = this.colorNames[Math.floor(Math.random() * this.colorNames.length)];
                while (differentColor === colorName) {
                    differentColor = this.colorNames[Math.floor(Math.random() * this.colorNames.length)];
                }
                displayColor = differentColor;
                isCorrect = false;
            }

            const style = { fill: this.colors[displayColor], fontSize: 32 };
            const tempText = new PIXI.Text(colorName, style);
            const position = this.findFreePosition(tempText);

            if (!position) {
                tempText.destroy();
                continue;
            }

            tempText.x = position.x;
            tempText.y = position.y;
            tempText.interactive = true;
            tempText.buttonMode = true;

            tempText.on('pointerdown', () => {
                if (!this.active || this.paused) return;
                if (isCorrect) {
                    this.score++;
                    this.scoreText.text = 'Score: ' + this.score;
                    this.app.stage.removeChild(tempText);
                    this.words = this.words.filter(w => w.text !== tempText);
                } else {
                    this.showGameOver();
                }
            });

            this.app.stage.addChild(tempText);
            this.words.push({ text: tempText, createdAt: Date.now(), timeout: isCorrect ? 3000 : 6000 });
        }
    },

    stop() {
        this.active = false;
        clearInterval(this.timerInterval);
        clearInterval(this.spawnInterval);
        if (this.ticker) this.app.ticker.remove(this.ticker);
        if (this.pauseBtn) this.pauseBtn.style.display = 'none';

        document.getElementById('pause-modal').style.display = 'none';
        document.getElementById('gameover-modal').style.display = 'none';

        this.words.forEach(w => {
            this.app.stage.removeChild(w.text);
            w.text.destroy();
        });
        this.words = [];
    }
});