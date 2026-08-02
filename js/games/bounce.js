/**
 * 弹跳游戏 - 点击屏幕让小球跳到上方平台
 * 适合3岁宝宝，简单点击操作
 */
class BounceGame extends BaseGame {
  constructor() {
    super({
      id: 'bounce',
      name: '弹跳游戏',
      icon: '🏀',
      description: '点击让球跳起来',
      duration: 60,
    });
  }

  onStart() {
    this.ball = {
      x: this.width / 2,
      y: this.height * 0.7,
      radius: 18,
      vy: 0,
      color: '#FF6B6B',
    };
    this.platforms = [];
    this.gravity = 0.4;
    this.jumpForce = -9;
    this.scrollSpeed = 1.2;
    this.cameraY = 0;
    this.touchActive = false;

    // 生成初始平台
    for (let i = 0; i < 8; i++) {
      this._addPlatform(i * 90);
    }

    // 触摸事件
    this._onTouch = (e) => {
      e.preventDefault();
      if (!this.isRunning) return;
      this.ball.vy = this.jumpForce;
    };
    this.canvas.addEventListener('touchstart', this._onTouch, { passive: false });
    this.canvas.addEventListener('mousedown', this._onTouch);
  }

  _addPlatform(baseY) {
    const pw = 70 + Math.random() * 40;
    this.platforms.push({
      x: 30 + Math.random() * (this.width - pw - 60),
      y: this.height - baseY - Math.random() * 20,
      w: pw,
      h: 14,
      color: `hsl(${Math.random() * 60 + 180}, 70%, 55%)`,
      scored: false,
    });
  }

  onUpdate() {
    // 物理
    if (this.ball.vy < 8) {
      this.ball.vy += this.gravity;
    }
    this.ball.y += this.ball.vy;

    // 相机跟随
    if (this.ball.y < this.height * 0.35) {
      const diff = this.height * 0.35 - this.ball.y;
      this.ball.y += diff;
      this.cameraY += diff;

      // 移动平台
      this.platforms.forEach(p => { p.y += diff; });

      // 移除屏幕外平台，添加新平台
      this.platforms = this.platforms.filter(p => p.y < this.height + 50);
      while (this.platforms.length < 8) {
        const lastP = this.platforms[this.platforms.length - 1];
        this._addPlatform(-lastP.y + this.height - 80 - Math.random() * 40);
      }
    }

    // 边界检查
    if (this.ball.x - this.ball.radius < 0) {
      this.ball.x = this.ball.radius;
    }
    if (this.ball.x + this.ball.radius > this.width) {
      this.ball.x = this.width - this.ball.radius;
    }

    // 掉落死亡
    if (this.ball.y > this.height + 60) {
      this.endGame();
    }

    // 平台碰撞
    for (const p of this.platforms) {
      if (
        this.ball.vy > 0 &&
        this.ball.y + this.ball.radius > p.y &&
        this.ball.y + this.ball.radius < p.y + p.h + 15 &&
        this.ball.x > p.x - 5 &&
        this.ball.x < p.x + p.w + 5
      ) {
        this.ball.vy = this.jumpForce;
        if (!p.scored) {
          p.scored = true;
          this.addScore(1);
        }
      }
    }
  }

  onDraw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 平台
    for (const p of this.platforms) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      const r = 7;
      const x = p.x, y = p.y, w = p.w, h = p.h;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.fill();

      // 光泽
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(x + 4, y + 2, w - 8, 4);
    }

    // 球
    const b = this.ball;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();

    // 球的光泽
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(b.x - 4, b.y - 5, b.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // 球的表情
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(b.x - 5, b.y - 3, 4, 0, Math.PI * 2);
    ctx.arc(b.x + 5, b.y - 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(b.x - 4, b.y - 3, 2, 0, Math.PI * 2);
    ctx.arc(b.x + 6, b.y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    // 微笑
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(b.x, b.y + 1, 8, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  onStop() {
    this.canvas.removeEventListener('touchstart', this._onTouch);
    this.canvas.removeEventListener('mousedown', this._onTouch);
  }
}
