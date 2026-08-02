/**
 * 投篮游戏 - 瞄准篮筐投球
 * 训练空间判断和手眼协调
 */
class BasketGame extends BaseGame {
  constructor() {
    super({ id: 'basket', name: '投篮游戏', icon: '🏀', description: '瞄准篮筐投篮', duration: 60 });
  }

  onStart() {
    this.hoop = { x: this.width / 2, y: this.height * 0.3, w: 70 };
    this.hoopDir = 1;
    this.balls = [];
    this.power = 0;
    this.aiming = false;
    this.aimStart = { x: 0, y: 0 };
    this.shooterX = this.width / 2;
    this.shooterY = this.height - 40;

    this.bindTouch('touchstart', (e) => {
      const pos = this.getTouchPos(e);
      this.aiming = true;
      this.aimStart = { x: pos.x, y: pos.y };
      this.power = 0;
    });
    this.bindTouch('touchmove', (e) => {
      if (!this.aiming) return;
      const pos = this.getTouchPos(e);
      this.power = Math.min(1, Math.hypot(pos.x - this.aimStart.x, pos.y - this.aimStart.y) / 150);
    });
    this.bindTouch('touchend', () => {
      if (this.aiming && this.power > 0.1) {
        this._shoot();
      }
      this.aiming = false;
      this.power = 0;
    });
    this.bindInput('mousedown', (e) => {
      const pos = this.getTouchPos(e);
      this.aiming = true;
      this.aimStart = { x: pos.x, y: pos.y };
      this.power = 0;
    });
    this.bindInput('mousemove', (e) => {
      if (!this.aiming) return;
      const pos = this.getTouchPos(e);
      this.power = Math.min(1, Math.hypot(pos.x - this.aimStart.x, pos.y - this.aimStart.y) / 150);
    });
    this.bindInput('mouseup', () => {
      if (this.aiming && this.power > 0.1) {
        this._shoot();
      }
      this.aiming = false;
      this.power = 0;
    });
  }

  _shoot() {
    const dx = this.hoop.x - this.shooterX;
    const dy = this.hoop.y - this.shooterY;
    const dist = Math.hypot(dx, dy);
    this.balls.push({
      x: this.shooterX, y: this.shooterY,
      vx: (dx / dist) * 10 * this.power,
      vy: (dy / dist) * 10 * this.power - 3,
      scored: false,
    });
  }

  onUpdate() {
    // 篮筐移动
    this.hoop.x += this.hoopDir * 1.2;
    if (this.hoop.x > this.width - 50 || this.hoop.x < 50) this.hoopDir *= -1;

    // 球的物理
    for (const b of this.balls) {
      b.vy += 0.3;
      b.x += b.vx;
      b.y += b.vy;

      if (!b.scored && b.y < this.hoop.y + 20 && b.y > this.hoop.y - 20 &&
          Math.abs(b.x - this.hoop.x) < this.hoop.w / 2) {
        b.scored = true;
        this.addScore(1);
      }
    }
    this.balls = this.balls.filter(b => b.y < this.height + 30);
  }

  onDraw() {
    const ctx = this.ctx;
    // 篮筐
    ctx.strokeStyle = '#FF6B6B'; ctx.lineWidth = 4;
    ctx.beginPath();
    const hx = this.hoop.x;
    ctx.moveTo(hx - this.hoop.w / 2, this.hoop.y);
    ctx.lineTo(hx + this.hoop.w / 2, this.hoop.y);
    ctx.moveTo(hx - this.hoop.w / 2, this.hoop.y);
    ctx.lineTo(hx - this.hoop.w / 2 - 10, this.hoop.y + 30);
    ctx.moveTo(hx + this.hoop.w / 2, this.hoop.y);
    ctx.lineTo(hx + this.hoop.w / 2 + 10, this.hoop.y + 30);
    ctx.stroke();
    // 网
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const sx = hx - this.hoop.w / 2 + (i * this.hoop.w) / 4;
      ctx.beginPath();
      ctx.moveTo(sx, this.hoop.y);
      ctx.lineTo(sx - 5 + i * 2, this.hoop.y + 40);
      ctx.stroke();
    }

    // 球
    for (const b of this.balls) {
      ctx.fillStyle = '#FF9F43';
      ctx.beginPath(); ctx.arc(b.x, b.y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(b.x - 6, b.y - 6); ctx.lineTo(b.x + 6, b.y + 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(b.x + 6, b.y - 6); ctx.lineTo(b.x - 6, b.y + 6); ctx.stroke();
    }

    // 投篮手
    ctx.font = '40px serif'; ctx.textAlign = 'center';
    ctx.fillText('🏀', this.shooterX, this.shooterY);

    // 力量指示器
    if (this.aiming) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(this.shooterX - 50, this.shooterY - 30, 100, 15);
      const powerColors = ['#4ECDC4', '#FFE66D', '#FF9F43', '#FF6B6B'];
      const idx = Math.min(3, Math.floor(this.power * 4));
      ctx.fillStyle = powerColors[idx];
      ctx.fillRect(this.shooterX - 50, this.shooterY - 30, 100 * this.power, 15);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '13px sans-serif';
    ctx.fillText('按住屏幕蓄力，松手投篮', this.width / 2, this.height - 15);
  }

  onStop() {}
}
