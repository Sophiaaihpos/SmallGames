const FlappyBird = Object.create(BaseGame);
Object.assign(FlappyBird, {
    gameType: 'flappyBird',
    storageKey: 'flappyBirdHighscore',

    bird: { x: 100, y: 200, width: 40, height: 40, velocityY: 0, gravity: 0.6, jumpForce: -12 },
    pipes: [],
    gameWidth: 800,
    gameHeight: 600,
    pipeWidth: 60,
    pipeGap: 200,
    pipeSpacing: 250,
    pipeSpeed: 5,
    pipeCounter: 0,
    timerText: null,
    birdSprite: null,
    pipeContainer: null,

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
        <h1>Flappy Bird</h1>
        <div style="color: white; font-size: 18px; max-width: 600px; text-align: left; margin-bottom: 40px;">
            <p>🐦 Press SPACE to make the bird jump</p>
            <p>📍 Fly through the gaps between the pipes</p>
            <p>⚠️ Don't hit the pipes or the ground</p>
            <p>⬆️ The game gets harder as your score increases</p>
            <p>🎯 How high can you score?</p>
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
        this.pipes = [];
        this.pipeCounter = 0;
        this.bird = { x: 100, y: 200, width: 40, height: 40, velocityY: 0, gravity: 0.4, jumpForce: -8 };
        this.pipeSpacing = 180;
        this.pipeGap = 200;
        this.pipeSpeed = 3;

        this.app.stage.removeChildren();

        const background = PIXI.Sprite.from('/HTML5Game/assets/flappyBackground.png');
        background.width = this.gameWidth;
        background.height = this.gameHeight;
        this.app.stage.addChild(background);

        this.birdSprite = PIXI.Sprite.from('/HTML5Game/assets/bird.png');
        this.birdSprite.x = this.bird.x;
        this.birdSprite.y = this.bird.y;
        this.birdSprite.width = this.bird.width;
        this.birdSprite.height = this.bird.height;
        this.app.stage.addChild(this.birdSprite);

        this.pipeContainer = new PIXI.Container();
        this.app.stage.addChild(this.pipeContainer);

        this.setupUI();
        this.pauseBtn.onclick = () => this.togglePause();

        this.keyHandler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.bird.velocityY = this.bird.jumpForce;
            }
        };
        document.addEventListener('keydown', this.keyHandler);

        this.ticker = () => this.update();
        this.app.ticker.add(this.ticker);
    },

    update() {
        if (!this.active || this.paused) return;

        this.bird.velocityY += this.bird.gravity;
        this.bird.y += this.bird.velocityY;

        if (this.bird.y < 0 || this.bird.y + this.bird.height > this.gameHeight) {
            this.showGameOver();
            return;
        }

        if (this.score > 0 && this.score % 3 === 0) {
            this.pipeGap = Math.max(120, 200 - this.score * 2);
        }

        this.pipeCounter++;
        if (this.pipeCounter > this.pipeSpacing) {
            this.spawnPipe();
            this.pipeCounter = 0;
        }

        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].x -= this.pipeSpeed;

            if (!this.pipes[i].scored && this.pipes[i].x + this.pipeWidth < this.bird.x) {
                this.score++;
                this.scoreText.text = 'Score: ' + this.score;
                this.pipes[i].scored = true;
            }

            if (this.bird.x < this.pipes[i].x + this.pipeWidth && this.bird.x + this.bird.width > this.pipes[i].x) {
                if (this.bird.y < this.pipes[i].topHeight || this.bird.y + this.bird.height > this.pipes[i].bottomY) {
                    this.showGameOver();
                    return;
                }
            }

            if (this.pipes[i].x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
        }

        this.draw();
    },

    spawnPipe() {
        const minY = 50;
        const maxY = this.gameHeight - this.pipeGap - 50;
        const topPipeHeight = Math.random() * (maxY - minY) + minY;
        this.pipes.push({ x: this.gameWidth, topHeight: topPipeHeight, bottomY: topPipeHeight + this.pipeGap, scored: false });
    },

    draw() {
        this.birdSprite.x = this.bird.x;
        this.birdSprite.y = this.bird.y;

        this.pipeContainer.removeChildren();
        this.pipes.forEach(pipe => {
            const topPipe = new PIXI.Graphics();
            topPipe.beginFill(0x00aa00);
            topPipe.drawRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            topPipe.endFill();
            this.pipeContainer.addChild(topPipe);

            const bottomPipe = new PIXI.Graphics();
            bottomPipe.beginFill(0x00aa00);
            bottomPipe.drawRect(pipe.x, pipe.bottomY, this.pipeWidth, this.gameHeight - pipe.bottomY);
            bottomPipe.endFill();
            this.pipeContainer.addChild(bottomPipe);
        });
    },

    stop() {
        this.active = false;
        if (this.ticker) this.app.ticker.remove(this.ticker);
        if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
        if (this.pauseBtn) this.pauseBtn.style.display = 'none';

        document.getElementById('pause-modal').style.display = 'none';
        document.getElementById('gameover-modal').style.display = 'none';
    }
});