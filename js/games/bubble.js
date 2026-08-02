/**
 * 泡泡龙游戏 - 点击彩色泡泡消除它们
 * 训练颜色识别和手眼协调
 */
class BubbleGame extends BaseGame {
  constructor() {
    super({ id: 'bubble', name: '泡泡龙', icon: '🫧', description: '点击泡泡消除它们', duration: 60 });
  }

  onStart() {
    this.bubbles = [];
    this.pops = [];
    this.spawnTimer = 0;

    this.bindTouch('touchstart', (e) => {
      const pos = this.getTouchPos(e);
      for (let i = this.bubbles.length - 1; i >= 0; i--) {
        const b = this.bubbles[i];
        if (Math.hypot(pos.x - b.x, pos.y - b.y) < b.radius) {
          for (let j = 0; j < 4; j++) {
            const a = (j / 4) * Math.PI * 2;
            this.pops.push({ x: b.x, y: b.y, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, color: b.color, alpha: 1, size: b.radius * 0.4 });
          }
          this.bubbles.splice(i, 1);
          this.addScore(1);
          return;
        }
      }
    });
    this.bindInput('mousedown', (e) => {
      const pos = this.getTouchPos(e);
      for (let i = this.bubbles.length - 1; i >= 0; i--) {
        const b = this.bubbles[i];
        if (Math.hypot(pos.x - b.x, pos.y - b.y) < b.radius) {
          for (let j = 0; j < 4; j++) {
            const a = (j / 4) * Math.PI * 2;
            this.pops.push({ x: b.x, y: b.y, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, color: b.color, alpha: 1, size: b.radius * 0.4 });
          }
          this.bubbles.splice(i, 1);
          this.addScore(1);
          return;
        }
      }
    });
  }

  onUpdate() {
    this.spawnTimer++;
    if (this.spawnTimer >= 30 && this.bubbles.length < 12) {
      this.spawnTimer = 0;
      const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A29BFE', '#FD79A8', '#FF9F43'];
      this.bubbles.push({
        x: 30 + Math.random() * (this.width - 60),
        y: this.height + 30,
        radius: 20 + Math.random() * 18,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.5 + Math.random() * 1.5,
        wobble: Math.random() * Math.PI * 2,
      });
    }

    for (const b of this.bubbles) {
      b.y -= b.speed;
      b.wobble += 0.02;
      b.x += Math.sin(b.wobble) * 0.5;
    }
    this.bubbles = this.bubbles.filter(b => b.y > -40);

    for (const p of this.pops) { p.x += p.vx; p.y += p.vy; p.alpha -= 0.04; }
    this.pops = this.pops.filter(p => p.alpha > 0);
  }

  onDraw() {
    const ctx = this.ctx;
    for (const b of this.bubbles) {
      // 光泽高光
      const grad = ctx.createRadialGradient(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.1, b.x, b.y, b.radius);
      grad.addColorStop(0, 'rgba(255,255,255,0.6)');
      grad.addColorStop(0.4, b.color);
      grad.addColorStop(1, 'rgba(0,0,0,0.2)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.arc(b.x - b.radius * 0.25, b.y - b.radius * 0.3, b.radius * 0.25, 0, Math.PI * 2); ctx.fill();
    }

    for (const p of this.pops) {
      ctx.fillStyle = p.color.replace(')', `,${p.alpha})`).replace('rgb', 'rgba');
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
  }

  onStop() {}
}
