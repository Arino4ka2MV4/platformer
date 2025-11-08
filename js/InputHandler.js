export default class InputHandler {
  constructor(){
    this.keys = {
      left: false,
      right: false, 
      up: false
    };

    this.bindKeys();
  }

  bindKeys() {
    // Key down events
    document.addEventListener('keydown', (e) => {
      switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.keys.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.keys.right = true;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          if (e.code === 'Space') e.preventDefault(); // Предотвращаем прокрутку страницы
          this.keys.up = true;
          break;
      }
    });

    // Key up events  
    document.addEventListener('keyup', (e) => {
      switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.keys.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.keys.right = false;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          this.keys.up = false;
          break;
      }
    });

    // Предотвращаем действия браузера по умолчанию
    document.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });
  }

  reset() {
    this.keys.left = false;
    this.keys.right = false;
    this.keys.up = false;
  }
}