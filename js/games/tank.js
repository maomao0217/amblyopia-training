/**
 * 坦克游戏 - 点击屏幕射击下落的目标
 */
class TankGame extends BaseGame {
  constructor() {
    super({ id: 'tank', name: '坦克射击', icon: '🎯', description: '点击目标来射击', duration: 60 });
  }

  onStart() {
    this.tank = { x: this.width / 2, y: this.height - 50, w: 50, h: 40 };
    this.bullets = [];
    this.targets = [];
    this.spawnTimer = 0;
    this.explosions = [];

    this.bindTouch('touchstart', (e) => {
      const pos = this.getTouchPos(e);
      // 先检查是否点击了目标
      for (let i = this.targets.length - 1; i >= 0; i--) {
        const t = this.targets[i];
        if (Math.hypot(pos.x - t.x, pos.y - t.y) < t.radius + 15) {
          this.explosions.push({ x: t.x, y: t.y, radius: t.radius, alpha: 1 });
          this.targets.splice(i, 1);
          this.addScore(1);
          return;
        }
      }
      // 否则发射子弹
      const angle = Math.atan2(pos.y - this.tank.y, pos.x - this.tank.x);
      this.bullets.push({ x: this.tank.x, y: this.tank.y - 15, vx: Math.cos(angle) * 6, vy: Math.sin(angle) * 6, life: 60 });
    });
    this.bindInput('mousedown', (e) => {
      const pos = this.getTouchPos(e);
      for (let i = this.targets.length - 1; i >= 0; i--) {
        const t = this.targets[i];
        if (Math.hypot(pos.x - t.x, pos.y - t.y) < t.radius + 15) {
          this.explosions.push({ x: t.x, y: t.y, radius: t.radius, alpha: 1 });
          this.targets.splice(i, 1);
          this.addScore(1);
          return;
        }
      }
    });
  }

  onUpdate() {
    this.spawnTimer++;
    const spawnRate = Math.max(20, 60 - this.score * 2);
    if (this.spawnTimer >= spawnRate) {
      this.spawnTimer = 0;
      this.targets.push({
        x: 40 + Math.random() * (this.width - 80), y: -30,
        radius: 18 + Math.random() * 15,
        speed: 0.8 + Math.random() * 1.5,
        color: ['#FF6B6B', '#FFE66D', '#FF9F43', '#EE5A24', '#FC427B'][Math.floor(Math.random() * 5)],
      });
    }

    for (const t of this.targets) t.y += t.speed;
    this.targets = this.targets.filter(t => t.y < this.height + 30);

    for (const b of this.bullets) { b.x += b.vx; b.y += b.vy; b.life--; }
    this.bullets = this.bullets.filter(b => b.life > 0 && b.x > 0 && b.x < this.width && b.y > 0 && b.y < this.height);

    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      for (let ti = this.targets.length - 1; ti >= 0; ti--) {
        if (Math.hypot(this.bullets[bi].x - this.targets[ti].x, this.bullets[bi].y - this.targets[ti].y) < this.targets[ti].radius + 4) {
          this.explosions.push({ x: this.targets[ti].x, y: this.targets[ti].y, radius: this.targets[ti].radius, alpha: 1 });
          this.targets.splice(ti, 1);
          this.bullets.splice(bi, 1);
          this.addScore(1);
          break;
        }
      }
    }

    for (const e of this.explosions) { e.alpha -= 0.04; e.radius += 2; }
    this.explosions = this.explosions.filter(e => e.alpha > 0);
  }

  onDraw() {
    const ctx = this.ctx;
    // 地面
    ctx.fillStyle = 'rgba(139,105,20,0.6)';
    ctx.fillRect(0, this.height - 60, this.width, 60);
    ctx.fillStyle = 'rgba(107,79,18,0.6)';
    ctx.fillRect(0, this.height - 60, this.width, 4);

    // 目标
    for (const t of this.targets) {
      ctx.strokeStyle = t.color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = t.color;
      ctx.beginPath(); ctx.arc(t.x, t.y, t.radius * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(t.x, t.y - t.radius * 0.3); ctx.lineTo(t.x, t.y + t.radius * 0.3);
      ctx.moveTo(t.x - t.radius * 0.3, t.y); ctx.lineTo(t.x + t.radius * 0.3, t.y);
      ctx.stroke();
    }

    // 子弹
    ctx.fillStyle = '#FFE66D';
    for (const b of this.bullets) { ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI * 2); ctx.fill(); }

    // 爆炸
    for (const e of this.explosions) {
      ctx.fillStyle = `rgba(255,200,50,${e.alpha})`;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.fill();
    }

    // 坦克
    const t = this.tank;
    ctx.fillStyle = '#444';
    ctx.fillRect(t.x - t.w / 2, t.y + 5, t.w, t.h - 10);
    ctx.fillStyle = '#5D8233';
    ctx.beginPath(); ctx.arc(t.x, t.y - 5, t.w * 0.45, Math.PI, 0); ctx.fill();
    ctx.fillRect(t.x - t.w * 0.45, t.y - 20, t.w * 0.9, t.h * 0.65);
    ctx.fillStyle = '#444'; ctx.fillRect(t.x - 3, t.y - 35, 6, 22);
    ctx.fillStyle = '#6B9B3A';
    ctx.beginPath(); ctx.arc(t.x, t.y - 12, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFE66D'; ctx.font = '14px serif'; ctx.textAlign = 'center';
    ctx.fillText('⭐', t.x, t.y - 8);
  }

  onStop() {}
}
