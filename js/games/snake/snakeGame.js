const SnakeGame = Object.create(BaseGame);
Object.assign(SnakeGame, {
    gameType: 'snake',
    storageKey: 'snakeGameHighscore',
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    counter: 0,
    difficulty: 'easy',
    baseSpeed: 8,
    moveSpeed: 8,

    init(app) {
        this.app = app;
        this.loadHighscore();
        this.ensureModals();
        this.showRulesScreen();
    },

     showRulesScreen() {
        const modal = document.getElementById('difficulty-modal');
        if (!modal) return;

        modal.style.display = 'flex';
        modal.innerHTML = `
            <h1>Snake </h1>
            <div style="color: white; font-size: 18px; max-width: 600px; text-align: left; margin-bottom: 40px;">
                <p>🐍 Controll the snake with the arrow keys</p>
                <p>🍎 Eat apples to gain points</p>
                <p>⚠️ Don't hit the walls or yourself</p>
                <p>⚡ In normal mode it gets faster!</p>
            </div>
            <div class="button-group">
                <button class="btn" id="rules-continue-btn">Weiter</button>
            </div>
        `;

        document.getElementById('rules-continue-btn').onclick = () => {
            this.showDifficultyScreen();
        };
    },

    createDifficultyModal() {
        const modal = document.createElement('div');
        modal.id = 'difficulty-modal';
        document.body.appendChild(modal);
        return modal;
    },

    showDifficultyScreen() {
        const modal = document.getElementById('difficulty-modal');
        modal.innerHTML = `
            <h1>Select Difficulty</h1>
            <div class="button-group">
                <button class="btn" id="easy-btn">Easy</button>
                <button class="btn" id="normal-btn">Normal</button>
            </div>
        `;
        document.getElementById('easy-btn').onclick = () => {
            modal.style.display = 'none';
            this.startGame('easy');
        };
        document.getElementById('normal-btn').onclick = () => {
            modal.style.display = 'none';
            this.startGame('normal');
        };
    },

    startGame(difficulty) {
        this.active = true;
        this.paused = false;
        this.difficulty = difficulty;
        this.baseSpeed = 8;
        this.moveSpeed = 8;
        this.snake = [{ x: 10, y: 10 }];
        this.dir = { x: 1, y: 0 };
        this.nextDir = { x: 1, y: 0 };
        this.score = 0;
        this.counter = 0;

        this.app.stage.removeChildren();

        this.gameContainer = new PIXI.Container();
        this.app.stage.addChild(this.gameContainer);
        this.setupUI();

        this.keyHandler = (e) => {
            if (e.key === 'ArrowUp' && this.dir.y === 0) this.nextDir = { x: 0, y: -1 };
            if (e.key === 'ArrowDown' && this.dir.y === 0) this.nextDir = { x: 0, y: 1 };
            if (e.key === 'ArrowLeft' && this.dir.x === 0) this.nextDir = { x: -1, y: 0 };
            if (e.key === 'ArrowRight' && this.dir.x === 0) this.nextDir = { x: 1, y: 0 };
        };
        document.addEventListener('keydown', this.keyHandler);

        this.ticker = () => this.update();
        this.app.ticker.add(this.ticker);
    },

    gameOver() {
        this.active = false;
        this.pauseBtn.style.display = 'none';

        this.saveHighscore();

        const modal = document.getElementById('gameover-modal');
        modal.style.display = 'flex';

        const percent = this.highscore > 0 ? ((this.score / this.highscore) * 100).toFixed(1) : 0;

        const highscoreEl = document.getElementById('highscore-display');
        highscoreEl.textContent = `Highscore: ${this.highscore} | Your Score: ${this.score}`;
        highscoreEl.style.color = 'white';
        
        document.getElementById('gameover-btn').onclick = () => {
            modal.style.display = 'none';
            GameManager.stopGame();
            GameManager.startGame('snake');
        };
    },

    update() {
        if (!this.active || this.paused) return;

        this.counter++;
        if (this.counter < this.moveSpeed) return;
        this.counter = 0;

        this.dir = this.nextDir;
        const head = this.snake[0];
        const newHead = { x: head.x + this.dir.x, y: head.y + this.dir.y };

        if (newHead.x < 0 || newHead.x >= 40 || newHead.y < 0 || newHead.y >= 30) {
            this.gameOver();
            return;
        }

        if (this.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(newHead);

        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += 10;
            this.scoreText.text = 'Score: ' + this.score;

            if (this.difficulty === 'normal' && this.score % 50 === 0) {
                this.moveSpeed = Math.max(3, this.moveSpeed - 1);
            }

            this.food = { x: Math.floor(Math.random() * 40), y: Math.floor(Math.random() * 30) };
        } else {
            this.snake.pop();
        }

        this.draw();
    },

    draw() {
        this.gameContainer.removeChildren();

        // Snake zeichnen
        this.snake.forEach((s, i) => {
            if (i === 0) {
                // Kopf mit Sprite und Rotation
                const headSprite = PIXI.Sprite.from('/HTML5Game/assets/snakeHead.png');
                headSprite.x = s.x * 20 + 10;
                headSprite.y = s.y * 20 + 10;
                headSprite.width = 30;
                headSprite.height = 30;
                headSprite.anchor.set(0.5, 0.5);

                // Rotation je nach Richtung
                if (this.dir.x === 1) headSprite.rotation = 0; // Rechts
                if (this.dir.x === -1) headSprite.rotation = Math.PI; // Links
                if (this.dir.y === -1) headSprite.rotation = -Math.PI / 2; // Oben
                if (this.dir.y === 1) headSprite.rotation = Math.PI / 2; // Unten

                this.gameContainer.addChild(headSprite);
            } else {
                // Body mit Grafik
                const g = new PIXI.Graphics();
                g.beginFill(0x00cc00);
                g.drawRect(s.x * 20, s.y * 20, 19, 19);
                g.endFill();
                this.gameContainer.addChild(g);
            }
        });

        // Food mit Sprite
        const foodSprite = PIXI.Sprite.from('/HTML5Game/assets/apple.png');
        foodSprite.x = this.food.x * 20;
        foodSprite.y = this.food.y * 20;
        foodSprite.width = 19;
        foodSprite.height = 19;
        this.gameContainer.addChild(foodSprite);

        this.app.stage.addChild(this.scoreText);
        this.app.stage.addChild(this.highscoreText);

    },
    stop() {
        this.active = false;
        if (this.pauseBtn) this.pauseBtn.style.display = 'none';
        if (this.ticker) this.app.ticker.remove(this.ticker);
        if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);

        document.getElementById('difficulty-modal').style.display = 'none';
        document.getElementById('pause-modal').style.display = 'none';
        document.getElementById('gameover-modal').style.display = 'none';
    }
});