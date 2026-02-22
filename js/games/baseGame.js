const BaseGame = {
    active: false,
    paused: false,
    app: null,
    score: 0,
    highscore: 0,
    scoreText: null,
    highscoreText: null,
    pauseBtn: null,
    ticker: null,
    storageKey: '',

    loadHighscore() {
        const saved = localStorage.getItem(this.storageKey);
        this.highscore = saved ? parseInt(saved) : 0;
    },

    saveHighscore() {
        if (this.score > this.highscore) {
            this.highscore = this.score;
            localStorage.setItem(this.storageKey, this.highscore);
        }
    },

    ensureModals() {
        if (!document.getElementById('pause-modal')) {
            const html = `
            <button class="btn" id="pause-btn">Pause</button>

            <div id="pause-modal">
                <h2>PAUSED</h2>
                <div class="button-group">
                    <button class="btn" id="resume-btn">Resume</button>
                    <button class="btn" id="pause-restart-btn">Restart</button>
                    <button class="btn" id="pause-menu-btn">Back to Menu</button>
                </div>
            </div>

            <div id="gameover-modal">
                <h2>GAME OVER</h2>
                <p id="final-score"></p>
                <p id="highscore-display"></p>
                <div class="button-group">
                    <button class="btn" id="gameover-btn">Restart</button>
                    <button class="btn" id="gameover-menu-btn">Back to Menu</button>
                </div>
            </div>
                        <div id="difficulty-modal" ></div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
        }
    },

    setupUI() {
        this.scoreText = new PIXI.Text('Score: 0', { fill: 'white', fontSize: 20 });
        this.scoreText.x = 10;
        this.scoreText.y = 10;
        this.app.stage.addChild(this.scoreText);

        this.highscoreText = new PIXI.Text('Highscore: ' + this.highscore, { fill: 'white', fontSize: 20 });
        this.highscoreText.x = 10;
        this.highscoreText.y = 40;
        this.app.stage.addChild(this.highscoreText);

        this.pauseBtn = document.getElementById('pause-btn');
        this.pauseBtn.style.display = 'block';
        this.pauseBtn.onclick = () => this.togglePause();
    },

    togglePause() {
        this.paused = !this.paused;
        this.pauseBtn.textContent = this.paused ? 'Resume' : 'Pause';

        const modal = document.getElementById('pause-modal');
        if (this.paused) {
            modal.style.display = 'flex';
            document.getElementById('resume-btn').onclick = () => this.togglePause();
            document.getElementById('pause-restart-btn').onclick = () => {
                modal.style.display = 'none';
                GameManager.stopGame();
                GameManager.startGame(this.gameType);
            };
            document.getElementById('pause-menu-btn').onclick = () => {
                modal.style.display = 'none';
                GameManager.stopGame();
                GameManager.showMainMenu();
            };
        } else {
            modal.style.display = 'none';
        }
    },

    showGameOver() {
        this.active = false;
        this.pauseBtn.style.display = 'none';
        this.saveHighscore();

        const modal = document.getElementById('gameover-modal');
        modal.style.display = 'flex';

        const highscoreEl = document.getElementById('highscore-display');
        highscoreEl.textContent = `Highscore: ${this.highscore} | Your Score: ${this.score}`;
        highscoreEl.style.color = 'white';

        document.getElementById('gameover-btn').onclick = () => {
            modal.style.display = 'none';
            GameManager.stopGame();
            GameManager.startGame(this.gameType);
        };

        document.getElementById('gameover-menu-btn').onclick = () => {
            modal.style.display = 'none';
            GameManager.stopGame();
            GameManager.showMainMenu();
        };
    },

    stop() {
        this.active = false;
        if (this.pauseBtn) this.pauseBtn.style.display = 'none';
        if (this.ticker) this.app.ticker.remove(this.ticker);
        
        document.getElementById('pause-modal').style.display = 'none';
        document.getElementById('gameover-modal').style.display = 'none';
    }
};