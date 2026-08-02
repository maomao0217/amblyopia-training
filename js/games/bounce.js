/**
 * 弹跳游戏 - 点击屏幕让小球跳到上方平台
 */
class BounceGame extends BaseGame {
  constructor() {
    super({ id: 'bounce', name: '弹跳游戏', icon: '🏀', description: '点击让球跳起来', duration: 60 });
  }

  onStart() {
    this.ball = { x: this.width / 2, y: this.height * 0.7, radius: 20, vy: 0, color: '#FF6B6B' };
    this.platforms = [];
    this.gravity = 0.4;
    this.jumpForce = -9;
    this.cameraY = 0;

    for (let i = 0; i < 8; i++) {
      this._addPlatform(i * 90);
    }

    this.bindTouch('touchstart', () => {
      if (this.isRunning) this.ball.vy = this.jumpForce;
    });
    this.bindInput('mousedown', () => {
      if (this.isRunning) this.ball.vy = this.jumpForce;
    });
  }

  _addPlatform(baseY) {
    const pw = 70 + Math.random() * 40;
    this.platforms.push({
      x: 30 + Math.random() * (this.width - pw - 60),
      y: this.height - baseY - Math.random() * 20,
      w: pw, h: 14,
      color: `hsl(${Math.random() * 60 + 180}, 70%, 55%)`,
      scored: false,
    });
  }

  onUpdate() {
    if (this.ball.vy < 8) this.ball.vy += this.gravity;
    this.ball.y += this.ball.vy;

    if (this.ball.y < this.height * 0.35) {
      const diff = this.height * 0.35 - this.ball.y;
      this.ball.y += diff;
      this.cameraY += diff;
      this.platforms.forEach(p => { p.y += diff; });
      this.platforms = this.platforms.filter(p => p.y < this.height + 50);
      while (this.platforms.length < 8) {
        const lastP = this.platforms[this.platforms.length - 1];
        this._addPlatform(-lastP.y + this.height - 80 - Math.random() * 40);
      }
    }

    this.ball.x = Math.max(this.ball.radius, Math.min(this.width - this.ball.radius, this.ball.x));
    if (this.ball.y > this.height + 60) this.endGame();

    for (const p of this.platforms) {
      if (this.ball.vy > 0 &&
          this.ball.y + this.ball.radius > p.y &&
          this.ball.y + this.ball.radius < p.y + p.h + 15 &&
          this.ball.x > p.x - 5 && this.ball.x < p.x + p.w + 5) {
        this.ball.vy = this.jumpForce;
        if (!p.scored) { p.scored = true; this.addScore(1); }
      }
    }
  }

  onDraw() {
    const ctx = this.ctx;
    // 平台
    for (const p of this.platforms) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      const r = 7, x = p.x, y = p.y, w = p.w, h = p.h;
      ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r); ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(x + 4, y + 2, w - 8, 4);
    }

    // 球
    const b = this.ball;
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(b.x - 5, b.y - 5, b.radius * 0.35, 0, Math.PI * 2); ctx.fill();
    // 表情
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(b.x - 6, b.y - 3, 4, 0, Math.PI * 2); ctx.arc(b.x + 6, b.y - 3, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(b.x - 5, b.y - 3, 2, 0, Math.PI * 2); ctx.arc(b.x + 7, b.y - 3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(b.x, b.y + 1, 8, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  }

  onStop() {}
}
