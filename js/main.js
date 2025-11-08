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
  document.getElementById('startBtn').addEventListener('click', () => {
    console.log("Start button clicked");
    game.start();
  });

  document.getElementById('pauseBtn').addEventListener('click', () => {
    console.log("Pause button clicked");
    if (game.gameState === 'playing') {
      game.pause();
    } else if (game.gameState === 'paused') {
      game.resume();
    }
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    console.log("Restart button clicked");
    game.init();
    game.start();
  });

  console.log("Game initialized successfully!");
});