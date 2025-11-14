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
    
    // Загружаем фоновое изображение
    this.background = new Image();
    this.background.src = 'assets/images/background.png';
    this.background.onerror = () => {
      console.log("Background image failed to load, using fallback color");
    };
    
    // Создаем звуки
    this.jumpSound = new Audio('assets/sounds/jump.wav');
    this.coinSound = new Audio('assets/sounds/coin.wav');
    this.hitSound = new Audio('assets/sounds/hit.wav');
    
    // Система уровней
    this.currentLevel = 1;
    this.maxLevel = 3;
    this.gameMode = 'levels'; // 'levels' или 'infinite'
    this.wave = 1; // Для infinity режима
    
    this.gameState = 'menu';
    this.running = false;
    this.lastTime = 0;
    
    this.init();
  }

  init() {
    console.log("Game init called");
    this.loadLevel(this.currentLevel);
    this.gameState = 'menu';
    this.running = false;
  }

  loadLevel(level) {
    console.log("Loading level:", level, "Mode:", this.gameMode);
    
    this.platforms = [];
    this.coins = [];
    this.enemies = [];
    
    // Базовые платформы (земля)
    this.platforms.push(new Platform(0, 450, 900, 50));
    
    if (this.gameMode === 'levels') {
      this.loadPredefinedLevel(level);
    } else {
      this.loadInfiniteWave(level);
    }
    
    this.player = new Player(100, 300, this.jumpSound);
    this.score = 0;
    this.lives = 3;
    
    this.updateHUD();
    console.log("Level loaded successfully");
  }

  loadPredefinedLevel(level) {
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
  }

  loadInfiniteWave(wave) {
    this.wave = wave;
    
    // Генерация случайных платформ
    const platformCount = 4 + Math.floor(wave / 2);
    for (let i = 0; i < platformCount; i++) {
      const x = 100 + Math.random() * 600;
      const y = 200 + Math.random() * 200;
      const width = 60 + Math.random() * 80;
      this.platforms.push(new Platform(x, y, width, 20));
    }
    
    // Генерация монет
    const coinCount = 5 + wave;
    for (let i = 0; i < coinCount; i++) {
      const x = 50 + Math.random() * 800;
      const y = 100 + Math.random() * 300;
      this.coins.push(new Coin(x, y, this.coinSound));
    }
    
    // Генерация врагов с увеличивающейся сложностью
    const enemyCount = 2 + Math.floor(wave / 2);
    for (let i = 0; i < enemyCount; i++) {
      const x = 100 + Math.random() * 700;
      const range = 80 + Math.random() * 120;
      let speed = 1.5 + (wave * 0.3);
      let type = 'normal';
      
      // Каждые 5 волн добавляем новых типов врагов
      if (wave >= 5 && Math.random() > 0.7) {
        type = 'fast';
        speed *= 1.5;
      }
      if (wave >= 10 && Math.random() > 0.8) {
        type = 'big';
      }
      
      this.enemies.push(new Enemy(x, 410, 40, 40, range, speed, type));
    }
  }

  start() {
    console.log("Game start called, current state:", this.gameState);
    
    if (this.gameState === 'menu' || this.gameState === 'gameover' || this.gameState === 'win') {
      if (this.gameMode === 'infinite') {
        this.wave = 1;
      } else {
        this.currentLevel = 1;
      }
      this.loadLevel(this.gameMode === 'infinite' ? this.wave : this.currentLevel);
    }
    
    this.gameState = 'playing';
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
    
    console.log("Game started successfully!");
  }

  pause() {
    this.gameState = 'paused';
    this.running = false;
    console.log("Game paused");
  }

  resume() {
    this.gameState = 'playing';
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
    console.log("Game resumed");
  }

  setGameMode(mode) {
    this.gameMode = mode;
    console.log("Game mode set to:", mode);
    this.init();
  }

  gameLoop(currentTime = 0) {
    if (!this.running) {
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
    
    // Проверяем завершение уровня/волны
    this.checkCompletion();
    
    // Проверяем столкновения с врагами
    this.enemies.forEach(enemy => {
      if (this.player.intersects(enemy)) {
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
    // Очищаем canvas и рисуем фон
    if (this.background.complete) {
      this.ctx.drawImage(this.background, 0, 0, this.width, this.height);
    } else {
      this.ctx.fillStyle = '#87CEEB';
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
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
    this.ctx.fillText(`Режим: ${this.gameMode === 'infinite' ? 'INFINITY' : 'LEVELS'}`, this.width / 2, this.height / 2 - 20);
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
    if (this.gameMode === 'infinite') {
      this.ctx.fillText(`Достигнутая волна: ${this.wave}`, this.width / 2, this.height / 2 + 90);
    }
    this.ctx.fillText('Нажми RESTART чтобы играть снова', this.width / 2, this.height / 2 + 130);
  }

  renderWinScreen() {
    this.ctx.fillStyle = 'rgba(0, 100, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '36px Arial';
    this.ctx.textAlign = 'center';
    
    if (this.gameMode === 'infinite') {
      this.ctx.fillText('НОВАЯ ВОЛНА!', this.width / 2, this.height / 2 - 30);
      this.ctx.font = '24px Arial';
      this.ctx.fillText(`Волна ${this.wave} завершена!`, this.width / 2, this.height / 2 + 20);
      this.ctx.fillText(`Следующая волна: ${this.wave + 1}`, this.width / 2, this.height / 2 + 60);
      this.ctx.fillText('Готовьтесь к увеличенной сложности!', this.width / 2, this.height / 2 + 100);
    } else {
      this.ctx.fillText('YOU WIN!', this.width / 2, this.height / 2);
      this.ctx.font = '24px Arial';
      this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 50);
    }
  }

  updateHUD() {
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    const levelElement = document.getElementById('level');
    const highscoreElement = document.getElementById('highscore');
    const waveElement = document.getElementById('wave');

    if (scoreElement) scoreElement.textContent = `Score: ${this.score}`;
    if (livesElement) livesElement.textContent = `Lives: ${this.lives}`;
    
    if (this.gameMode === 'infinite') {
      if (levelElement) levelElement.textContent = `Wave: ${this.wave}`;
      if (waveElement) waveElement.style.display = 'inline';
    } else {
      if (levelElement) levelElement.textContent = `Level: ${this.currentLevel}`;
      if (waveElement) waveElement.style.display = 'none';
    }
    
    if (highscoreElement) {
      highscoreElement.textContent = `High: ${localStorage.getItem('highscore') || 0}`;
    }
  }

  checkCompletion() {
    const allCoinsCollected = this.coins.every(coin => coin.collected);
    if (allCoinsCollected) {
      if (this.gameMode === 'levels') {
        if (this.currentLevel < this.maxLevel) {
          this.currentLevel++;
          this.loadLevel(this.currentLevel);
        } else {
          this.winGame();
        }
      } else { // infinite mode
        this.wave++;
        this.loadLevel(this.wave);
        this.gameState = 'win';
        setTimeout(() => {
          if (this.gameState === 'win') {
            this.gameState = 'playing';
          }
        }, 3000);
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