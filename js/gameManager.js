const GameManager = {
  currentGame: null,
  app: null,
  
  init() {
    const container = document.getElementById('gameContainer');
    this.app = new PIXI.Application({ width:800, height:600, backgroundColor:0x1e1e1e });
    container.appendChild(this.app.view);
    BaseGame.ensureModals();
    this.showMainMenu();
  },
  
  showMainMenu() {
    this.stopGame();
    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('gameContainer').style.display = 'none';
    document.querySelector('.btn-back')?.remove();
  },
  
  startGame(gameType) {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    this.currentGame = gameType;
    
    switch(gameType) {
      case 'snake': SnakeGame.init(this.app); break;
      case 'click': ClickGame.init(this.app); break;
      case 'flappyBird': FlappyBird.init(this.app); break;
    }
    
    this.addBackButton();
  },
  
  stopGame() {
    if(this.currentGame === 'snake') SnakeGame.stop();
    if(this.currentGame === 'click') ClickGame.stop();
    if(this.currentGame === 'flappyBird') FlappyBird.stop();
    this.app.stage.removeChildren();
  },
  
  addBackButton() {
    const btn = document.createElement('button');
    btn.className = 'btn btn-back';
    btn.textContent = '← Main Menu';
    btn.onclick = () => this.showMainMenu();
    document.body.appendChild(btn);
  }
};