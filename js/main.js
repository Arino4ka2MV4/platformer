import Game from './Game.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  if(!canvas) { 
    console.error("Canvas not found!"); 
    return; 
  }

  console.log("Game initializing...");
  const game = new Game(canvas);

  // Запуск игры клавишей Enter
  document.addEventListener('keydown', (e) => {
    if(e.code === 'Enter') {
      console.log("Enter pressed - starting game");
      game.start();
    }
  });

  // Обработчики кнопок
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const modeSelect = document.getElementById('modeSelect');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      console.log("Start button clicked");
      game.start();
    });
  } else {
    console.error("Start button not found!");
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      console.log("Pause button clicked");
      if (game.gameState === 'playing') {
        game.pause();
      } else if (game.gameState === 'paused') {
        game.resume();
      }
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      console.log("Restart button clicked");
      game.init();
      game.start();
    });
  }

  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      const mode = e.target.value;
      console.log("Game mode changed to:", mode);
      game.setGameMode(mode);
    });
  }

  console.log("Game initialized successfully!");
});