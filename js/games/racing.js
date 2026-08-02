/**
 * 赛车游戏 - 左右移动躲避障碍物
 * 宝宝用手指左右滑动控制赛车
 */
class RacingGame extends BaseGame {
  constructor() {
    super({
      id: 'racing',
      name: '赛车游戏',
      icon: '🏎️',
      description: '滑动让赛车躲避障碍',
      duration: 60,
    });
  }

  onStart() {
    this.car = {
      x: this.width / 2,
      y: this.height * 0.75,
      w: 40,
      h: 60,
    };
    this.obstacles = [];
    this.roadOffset = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 50;
    this.touchX = null;

    this._onTouchMove = (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.touches[0].clientX - rect.left) * (this.width / rect.width);
      this.car.x = Math.max(this.car.w / 2 + 20, Math.min(this.width - this.car.w / 2 - 20, x));
    };
    this._onMouseMove = (e) => {
      if (!this.isRunning) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.width / rect.width);
      this.car.x = Math.max(this.car.w / 2 + 20, Math.min(this.width - this.car.w / 2 - 20, x));
    };
    this._onKey = (e) => {
      if (e.key === 'ArrowLeft') this.car.x -= 15;
      if (e.key === 'ArrowRight') this.car.x += 15;
      this.car.x = Math.max(this.car.w / 2 + 20, Math.min(this.width - this.car.w / 2 - 20, this.car.x));
    };

    this.canvas.addEventListener('touchmove', this._onTouchMove, { passive: false });
    this.canvas.addEventListener('touchstart', this._onTouchMove, { passive: false });
    this.canvas.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('keydown', this._onKey);
  }

  onUpdate() {
    this.roadOffset = (this.roadOffset + 3) % 40;
    this.spawnTimer++;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this._spawnObstacle();
      // 逐渐加速
      if (this.spawnInterval > 20) this.spawnInterval -= 0.5;
    }

    // 移动障碍物
    for (const o of this.obstacles) {
      o.y += o.speed;
    }

    // 碰撞检测
    for (const o of this.obstacles) {
      if (
        Math.abs(this.car.x - o.x) < (this.car.w + o.w) / 2 - 8 &&
        Math.abs(this.car.y - o.y) < (this.car.h + o.h) / 2 - 8
      ) {
        this.endGame();
        return;
      }
    }

    // 移除通过的障碍物并加分
    const passed = this.obstacles.filter(o => o.y > this.height + 50 && !o.scored);
    for (const p of passed) {
      p.scored = true;
      this.addScore(1);
    }
    this.obstacles = this.obstacles.filter(o => o.y < this.height + 80);
  }

  _spawnObstacle() {
    const types = [
      { w: 35, h: 35, color: '#FF6B6B', shape: 'cone' },
      { w: 38, h: 30, color: '#FFE66D', shape: 'barrier' },
      { w: 32, h: 32, color: '#FF9F43', shape: 'rock' },
    ];
    const t = types[Math.floor(Math.random() * types.length)];
    this.obstacles.push({
      x: 55 + Math.random() * (this.width - 110),
      y: -40,
      w: t.w,
      h: t.h,
      color: t.color,
      shape: t.shape,
      speed: 2 + Math.random() * 2,
      scored: false,
    });
  }

  onDraw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 道路
    ctx.fillStyle = '#555';
    ctx.fillRect(20, 0, this.width - 40, this.height);

    // 道路标线
    ctx.fillStyle = '#FFE66D';
    for (let y = -this.roadOffset; y < this.height; y += 40) {
      ctx.fillRect(this.width / 2 - 2, y, 4, 20);
    }

    // 路边
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, 20, this.height);
    ctx.fillRect(this.width - 20, 0, 20, this.height);
    // 路边条纹
    for (let y = -this.roadOffset; y < this.height; y += 30) {
      ctx.fillStyle = y % 60 < 30 ? '#FF6B6B' : '#fff';
      ctx.fillRect(2, y, 16, 14);
      ctx.fillRect(this.width - 18, y, 16, 14);
    }

    // 障碍物
    for (const o of this.obstacles) {
      ctx.fillStyle = o.color;
      if (o.shape === 'cone') {
        ctx.beginPath();
        ctx.moveTo(o.x, o.y - o.h / 2);
        ctx.lineTo(o.x - o.w / 2, o.y + o.h / 2);
        ctx.lineTo(o.x + o.w / 2, o.y + o.h / 2);
        ctx.closePath();
        ctx.fill();
      } else if (o.shape === 'barrier') {
        ctx.fillRect(o.x - o.w / 2, o.y - o.h / 2, o.w, o.h);
        ctx.fillStyle = '#fff';
        ctx.fillRect(o.x - o.w / 2 + 4, o.y - o.h / 2 + 4, o.w / 3, o.h / 3);
        ctx.fillRect(o.x + o.w / 6, o.y - o.h / 2 + 4, o.w / 3, o.h / 3);
      } else {
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.arc(o.x - 3, o.y - 3, o.w / 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 赛车
    const c = this.car;
    ctx.fillStyle = '#4ECDC4';
    ctx.beginPath();
    ctx.roundRect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, 8);
    ctx.fill();

    // 车窗
    ctx.fillStyle = '#A8E6CF';
    ctx.fillRect(c.x - c.w * 0.25, c.y - c.h * 0.4, c.w * 0.5, c.h * 0.35);

    // 轮子
    ctx.fillStyle = '#333';
    ctx.fillRect(c.x - c.w / 2 - 3, c.y - c.h / 3, 6, 12);
    ctx.fillRect(c.x + c.w / 2 - 3, c.y - c.h / 3, 6, 12);
    ctx.fillRect(c.x - c.w / 2 - 3, c.y + c.h / 3 - 6, 6, 12);
    ctx.fillRect(c.x + c.w / 2 - 3, c.y + c.h / 3 - 6, 6, 12);
  }

  onStop() {
    this.canvas.removeEventListener('touchmove', this._onTouchMove);
    this.canvas.removeEventListener('touchstart', this._onTouchMove);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('keydown', this._onKey);
  }
}
