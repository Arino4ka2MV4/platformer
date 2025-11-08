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
    this.sound = sound;
  }
  render(ctx, offsetX=0){
    if(this.collected) return;
    if(this.sprite.complete){
      ctx.drawImage(this.sprite, this.x - offsetX, this.y, this.w, this.h);
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
      if(this.sound) this.sound.play();
    }
  }
}

export class Enemy extends Entity {
  constructor(x,y,w,h,range=120,speed=1.1){
    super(x,y,w,h);
    this.baseX = x;
    this.range = range;
    this.speed = speed;
    this.dir = 1;
    this.color = '#ef476f';
  }
  update(dt){
    this.x += this.speed * this.dir * dt * 0.05;
    if(this.x > this.baseX+this.range) this.dir=-1;
    if(this.x < this.baseX-this.range) this.dir=1;
  }
  render(ctx, offsetX=0){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - offsetX, this.y, this.w, this.h);
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
    this.sprite = new Image();
    this.sprite.src = 'assets/images/player.png';
    this.jumpSound = jumpSound;
  }
  
  applyInput(input, dt){
    // ДВИЖЕНИЕ ВЛЕВО/ВПРАВО
    this.vx = 0;
    if(input.keys.left) {
      this.vx = -this.speed;
    }
    if(input.keys.right) {
      this.vx = this.speed;
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
    if(this.sprite.complete){
      ctx.drawImage(this.sprite, this.x - offsetX, this.y, this.w, this.h);
    } else {
      ctx.fillStyle = '#06d6a0';
      ctx.fillRect(this.x - offsetX, this.y, this.w, this.h);
    }
  }
}