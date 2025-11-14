export class Entity {
  constructor(x, y, w, h){
    this.x = x; this.y = y; this.w = w; this.h = h;
  }
  intersects(other){
    return !(this.x + this.w < other.x || this.x > other.x + other.w ||
             this.y + this.h < other.y || this.y > other.y + other.h);
  }
}

export class Platform extends Entity {
  constructor(x, y, w, h, color='#6b7280'){
    super(x,y,w,h);
    this.color = color;
  }
  render(ctx, offsetX=0){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - offsetX, this.y, this.w, this.h);
  }
}

export class Coin extends Entity {
  constructor(x,y,sound){
    super(x,y,18,18);
    this.collected = false;
    this.sprite = new Image();
    this.sprite.src = 'assets/images/coin.png';
    this.sprite.onerror = () => {
      console.log("Coin image failed to load");
    };
    this.sound = sound;
    // Добавляем анимацию
    this.animationFrame = 0;
    this.animationSpeed = 0.1;
  }
  render(ctx, offsetX=0){
    if(this.collected) return;
    
    // Анимация вращения
    this.animationFrame += this.animationSpeed;
    const scale = 1 + Math.sin(this.animationFrame) * 0.1;
    
    if(this.sprite.complete && this.sprite.width > 0){
      ctx.save();
      ctx.translate(this.x + 9 - offsetX, this.y + 9);
      ctx.scale(scale, scale);
      ctx.drawImage(this.sprite, -9, -9, this.w, this.h);
      ctx.restore();
    } else {
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(this.x+9-offsetX,this.y+9,8,0,Math.PI*2);
      ctx.fill();
    }
  }
  collect() {
    if(!this.collected){
      this.collected=true;
      if(this.sound) {
        this.sound.currentTime = 0;
        this.sound.play().catch(e => console.log("Audio error:", e));
      }
    }
  }
}

export class Enemy extends Entity {
  constructor(x,y,w,h,range=120,speed=1.1, type='normal'){
    super(x,y,w,h);
    this.baseX = x;
    this.range = range;
    this.speed = speed;
    this.dir = 1;
    this.type = type;
    
    // Загружаем спрайт врага
    this.sprite = new Image();
    this.sprite.src = 'assets/images/enemy.png';
    this.sprite.onerror = () => {
      console.log("Enemy image failed to load");
    };
    
    // Анимация
    this.animationFrame = 0;
    this.animationSpeed = 0.05;
  }
  
  update(dt){
    this.x += this.speed * this.dir * dt * 0.05;
    if(this.x > this.baseX+this.range) this.dir=-1;
    if(this.x < this.baseX-this.range) this.dir=1;
    
    // Обновляем анимацию
    this.animationFrame += this.animationSpeed;
  }
  
  render(ctx, offsetX=0){
    // Анимация ходьбы
    const walkOffset = Math.sin(this.animationFrame) * 2;
    
    if(this.sprite.complete && this.sprite.width > 0){
      // Отзеркаливаем спрайт при изменении направления
      ctx.save();
      if(this.dir === -1) {
        ctx.translate(this.x - offsetX + this.w, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(this.sprite, 0, walkOffset, this.w, this.h);
      } else {
        ctx.drawImage(this.sprite, this.x - offsetX, this.y + walkOffset, this.w, this.h);
      }
      ctx.restore();
    } else {
      // Fallback - цветной прямоугольник
      ctx.fillStyle = this.type === 'fast' ? '#ff6b6b' : 
                     this.type === 'big' ? '#4ecdc4' : '#ef476f';
      ctx.fillRect(this.x - offsetX, this.y, this.w, this.h);
    }
  }
}

export class Player extends Entity {
  constructor(x, y, jumpSound){
    super(x,y,48,48);
    this.vx = 0; 
    this.vy = 0; 
    this.speed = 5;
    this.jumpPower = 12;
    this.onGround = false; 
    this.lives = 3;
    
    // Загружаем спрайт игрока
    this.sprite = new Image();
    this.sprite.src = 'assets/images/player.png';
    this.sprite.onerror = () => {
      console.log("Player image failed to load");
    };
    
    this.jumpSound = jumpSound;
    this.facingDirection = 1; // 1 для правого, -1 для левого
  }
  
  applyInput(input, dt){
    // ДВИЖЕНИЕ ВЛЕВО/ВПРАВО
    this.vx = 0;
    if(input.keys.left) {
      this.vx = -this.speed;
      this.facingDirection = -1;
    }
    if(input.keys.right) {
      this.vx = this.speed;
      this.facingDirection = 1;
    }
    
    // ПРЫЖОК - ТОЛЬКО ЕСЛИ НА ЗЕМЛЕ
    if(input.keys.up && this.onGround){
      this.vy = -this.jumpPower;
      this.onGround = false;
      if(this.jumpSound) {
        this.jumpSound.currentTime = 0;
        this.jumpSound.play().catch(e => console.log("Audio error:", e));
      }
    }
  }
  
  update(dt, gravity){
    // ПРИМЕНЯЕМ ГРАВИТАЦИЮ
    this.vy += gravity;
    
    // ОБНОВЛЯЕМ ПОЗИЦИЮ
    this.x += this.vx * (dt / 16);
    this.y += this.vy * (dt / 16);
  }
  
  render(ctx, offsetX=0){
    if(this.sprite.complete && this.sprite.width > 0){
      // Отзеркаливаем спрайт при движении влево
      ctx.save();
      if(this.facingDirection === -1) {
        ctx.translate(this.x - offsetX + this.w, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(this.sprite, 0, 0, this.w, this.h);
      } else {
        ctx.drawImage(this.sprite, this.x - offsetX, this.y, this.w, this.h);
      }
      ctx.restore();
    } else {
      ctx.fillStyle = '#06d6a0';
      ctx.fillRect(this.x - offsetX, this.y, this.w, this.h);
    }
  }
}