import { Player, Platform, Coin, Enemy } from './Entities.js';
import InputHandler from './InputHandler.js';

export default class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.input = new InputHandler();
    this.gravity = 0.5;
    
    // Создаем звуки
    this.jumpSound = new Audio('assets/sounds/jump.wav');
    this.coinSound = new Audio('assets/sounds/coin.wav');
    this.hitSound = new Audio('assets/sounds/hit.wav');
    
    // Система уровней
    this.currentLevel = 1;
    this.maxLevel = 3;
    
    this.gameState = 'menu'; // menu, playing, paused, gameover, win
    this.running = false;
    
    this.init();
  }

  init() {
    this.loadLevel(this.currentLevel);
    this.gameState = 'menu';
    this.running = false;
  }

  loadLevel(level) {
    console.log("Loading level:", level);
    
    this.platforms = [];
    this.coins = [];
    this.enemies = [];
    
    // Базовые платформы
    this.platforms.push(new Platform(0, 450, 900, 50)); // земля
    
    if (level === 1) {
      this.platforms.push(
        new Platform(200, 350, 100, 20),
        new Platform(400, 250, 100, 20),
        new Platform(600, 350, 100, 20)
      );
      this.coins.push(
        new Coin(250, 320, this.coinSound),
        new Coin(450, 220, this.coinSound),
        new Coin(650, 320, this.coinSound)
      );
      this.enemies.push(new Enemy(300, 410, 40, 40, 200, 1.5));
      
    } else if (level === 2) {
      this.platforms.push(
        new Platform(150, 380, 80, 20),
        new Platform(300, 300, 80, 20),
        new Platform(450, 220, 80, 20),
        new Platform(600, 300, 80, 20),
        new Platform(750, 380, 80, 20)
      );
      this.coins.push(
        new Coin(180, 350, this.coinSound),
        new Coin(330, 270, this.coinSound),
        new Coin(480, 190, this.coinSound),
        new Coin(630, 270, this.coinSound),
        new Coin(780, 350, this.coinSound)
      );
      this.enemies.push(
        new Enemy(200, 410, 40, 40, 150, 2),
        new Enemy(500, 410, 40, 40, 150, 1.8)
      );
      
    } else if (level === 3) {
      this.platforms.push(
        new Platform(100, 400, 60, 20),
        new Platform(250, 350, 60, 20),
        new Platform(400, 300, 60, 20),
        new Platform(550, 250, 60, 20),
        new Platform(700, 300, 60, 20)
      );
      this.coins.push(
        new Coin(120, 370, this.coinSound),
        new Coin(270, 320, this.coinSound),
        new Coin(420, 270, this.coinSound),
        new Coin(570, 220, this.coinSound),
        new Coin(720, 270, this.coinSound)
      );
      this.enemies.push(
        new Enemy(150, 410, 40, 40, 100, 2.5),
        new Enemy(350, 410, 40, 40, 100, 2.2),
        new Enemy(650, 410, 40, 40, 100, 2.3)
      );
    }
    
    this.player = new Player(100, 300, this.jumpSound);
    this.score = 0;
    this.lives = 3;
    
    this.updateHUD();
    console.log("Level loaded successfully!");
  }

  start() {
    console.log("Game start called, current state:", this.gameState);
    
    if (this.gameState === 'menu' || this.gameState === 'gameover' || this.gameState === 'win') {
      this.currentLevel = 1;
      this.loadLevel(this.currentLevel);
    }
    
    this.gameState = 'playing';
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
    
    console.log("Game started!");
  }

  pause() {
    this.gameState = 'paused';
    this.running = false;
  }

  resume() {
    this.gameState = 'playing';
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  gameLoop(currentTime = 0) {
    if (!this.running) {
      console.log("Game loop stopped - not running");
      return;
    }
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  update(dt) {
    if (this.gameState !== 'playing') return;
    
    // Применяем управление
    this.player.applyInput(this.input, dt);
    
    // Обновляем врагов
    this.enemies.forEach(enemy => enemy.update(dt));
    
    // Применяем гравитацию
    this.player.update(dt, this.gravity);
    
    // Проверяем коллизии с платформами
    this.player.onGround = false;
    for (let platform of this.platforms) {
      if (this.player.intersects(platform)) {
        // Коллизия сверху (игрок падает на платформу)
        if (this.player.vy > 0 && this.player.y + this.player.h > platform.y && 
            this.player.y + this.player.h < platform.y + 25) {
          this.player.y = platform.y - this.player.h;
          this.player.vy = 0;
          this.player.onGround = true;
        }
      }
    }
    
    // Собираем монеты
    this.coins.forEach(coin => {
      if (!coin.collected && this.player.intersects(coin)) {
        coin.collect();
        this.score += 100;
        this.updateHUD();
      }
    });
    
    // Проверяем завершение уровня
    this.checkLevelCompletion();
    
    // Проверяем столкновения с врагами
    this.enemies.forEach(enemy => {
      if (this.player.intersects(enemy)) {
        // Проверяем, прыгнул ли игрок на врага
        if (this.player.vy > 0 && this.player.y + this.player.h > enemy.y && 
            this.player.y + this.player.h < enemy.y + 20) {
          // Убиваем врага
          enemy.y = 1000;
          this.player.vy = -8;
          this.score += 200;
          this.updateHUD();
        } else {
          this.lives--;
          this.updateHUD();
          if (this.lives <= 0) {
            this.gameOver();
          } else {
            // Респавн игрока
            this.player.x = 100;
            this.player.y = 300;
            this.player.vx = 0;
            this.player.vy = 0;
          }
        }
      }
    });
    
    // Проверяем выход за границы
    if (this.player.y > this.height) {
      this.lives--;
      this.updateHUD();
      this.player.x = 100;
      this.player.y = 300;
      this.player.vx = 0;
      this.player.vy = 0;
      
      if (this.lives <= 0) {
        this.gameOver();
      }
    }
  }

  render() {
    // Очищаем canvas
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Рендерим все объекты
    this.platforms.forEach(platform => platform.render(this.ctx));
    this.coins.forEach(coin => coin.render(this.ctx));
    this.enemies.forEach(enemy => enemy.render(this.ctx));
    this.player.render(this.ctx);
    
    // Отображаем текущее состояние игры
    if (this.gameState === 'menu') {
      this.renderMenu();
    } else if (this.gameState === 'paused') {
      this.renderPauseScreen();
    } else if (this.gameState === 'gameover') {
      this.renderGameOver();
    } else if (this.gameState === 'win') {
      this.renderWinScreen();
    }
  }

  renderMenu() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('CANVAS PLATFORMER', this.width / 2, this.height / 2 - 60);
    
    this.ctx.font = '20px Arial';
    this.ctx.fillText('УПРАВЛЕНИЕ:', this.width / 2, this.height / 2 - 20);
    this.ctx.fillText('A/D или ←/→ - Движение', this.width / 2, this.height / 2 + 10);
    this.ctx.fillText('SPACE или W или ↑ - Прыжок', this.width / 2, this.height / 2 + 40);
    this.ctx.fillText('Нажми ENTER или START чтобы начать', this.width / 2, this.height / 2 + 80);
  }

  renderPauseScreen() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('ПАУЗА', this.width / 2, this.height / 2);
  }

  renderGameOver() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2);
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 50);
    this.ctx.fillText('Нажми RESTART чтобы играть снова', this.width / 2, this.height / 2 + 100);
  }

  renderWinScreen() {
    this.ctx.fillStyle = 'rgba(0, 100, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('YOU WIN!', this.width / 2, this.height / 2);
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 50);
    this.ctx.fillText('Нажми RESTART чтобы играть снова', this.width / 2, this.height / 2 + 100);
  }

  updateHUD() {
    document.getElementById('score').textContent = `Score: ${this.score}`;
    document.getElementById('lives').textContent = `Lives: ${this.lives}`;
    document.getElementById('level').textContent = `Level: ${this.currentLevel}`;
    document.getElementById('highscore').textContent = `High: ${localStorage.getItem('highscore') || 0}`;
  }

  checkLevelCompletion() {
    const allCoinsCollected = this.coins.every(coin => coin.collected);
    if (allCoinsCollected) {
      if (this.currentLevel < this.maxLevel) {
        this.currentLevel++;
        this.loadLevel(this.currentLevel);
      } else {
        this.winGame();
      }
    }
  }

  winGame() {
    this.gameState = 'win';
    this.running = false;
    this.saveProgress();
  }

  gameOver() {
    this.gameState = 'gameover';
    this.running = false;
    this.saveProgress();
  }

  saveProgress() {
    const highscore = localStorage.getItem('highscore') || 0;
    if (this.score > highscore) {
      localStorage.setItem('highscore', this.score);
    }
  }
}