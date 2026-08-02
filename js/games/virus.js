/**
 * 病毒游戏 - 点击消灭屏幕上的病毒
 */
class VirusGame extends BaseGame {
  constructor() {
    super({ id: 'virus', name: '消灭病毒', icon: '🦠', description: '点击消灭出现的病毒', duration: 60 });
  }

  onStart() {
    this.viruses = [];
    this.effects = [];
    this.spawnTimer = 0;
    this.maxViruses = 5;

    this.bindTouch('touchstart', (e) => {
      const pos = this.getTouchPos(e);
      this._tryHit(pos.x, pos.y);
    });
    this.bindInput('mousedown', (e) => {
      const pos = this.getTouchPos(e);
      this._tryHit(pos.x, pos.y);
    });
  }

  _tryHit(tx, ty) {
    for (let i = this.viruses.length - 1; i >= 0; i--) {
      const v = this.viruses[i];
      if (Math.hypot(tx - v.x, ty - v.y) < v.radius + 15) {
        for (let j = 0; j < 6; j++) {
          const angle = (j / 6) * Math.PI * 2;
          this.effects.push({ x: v.x, y: v.y, vx: Math.cos(angle) * 3, vy: Math.sin(angle) * 3, color: v.color, alpha: 1, size: 4 + Math.random() * 4 });
        }
        this.viruses.splice(i, 1);
        this.addScore(1);
        return;
      }
    }
  }

  onUpdate() {
    this.spawnTimer++;
    const spawnRate = Math.max(25, 55 - this.score * 0.5);
    if (this.spawnTimer >= spawnRate && this.viruses.length < this.maxViruses + Math.floor(this.score / 10)) {
      this.spawnTimer = 0;
      const colors = ['#FF6B6B', '#FF9F43', '#EE5A24', '#FC427B', '#FF4757', '#FF6348'];
      const side = Math.floor(Math.random() * 4);
      let x, y;
      switch (side) {
        case 0: x = -30; y = Math.random() * this.height; break;
        case 1: x = this.width + 30; y = Math.random() * this.height; break;
        case 2: x = Math.random() * this.width; y = -30; break;
        case 3: x = Math.random() * this.width; y = this.height + 30; break;
      }
      this.viruses.push({
        x, y,
        targetX: 50 + Math.random() * (this.width - 100),
        targetY: 100 + Math.random() * (this.height - 150),
        radius: 15 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 1 + Math.random() * 1.5,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
      });
    }

    for (const v of this.viruses) {
      v.wobble += v.wobbleSpeed;
      const dx = v.targetX - v.x, dy = v.targetY - v.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 5) { v.x += (dx / dist) * v.speed; v.y += (dy / dist) * v.speed; }
      else { v.targetX = 50 + Math.random() * (this.width - 100); v.targetY = 100 + Math.random() * (this.height - 150); }
    }

    for (const e of this.effects) { e.x += e.vx; e.y += e.vy; e.alpha -= 0.04; e.size *= 0.98; }
    this.effects = this.effects.filter(e => e.alpha > 0);
  }

  onDraw() {
    const ctx = this.ctx;
    // 网格
    ctx.strokeStyle = 'rgba(78,205,196,0.06)'; ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke(); }
    for (let y = 0; y < this.height; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke(); }

    for (const v of this.viruses) {
      const x = v.x + Math.sin(v.wobble) * 8;
      const y = v.y + Math.cos(v.wobble * 1.3) * 5;
      const glow = ctx.createRadialGradient(x, y, v.radius * 0.3, x, y, v.radius * 1.5);
      glow.addColorStop(0, v.color); glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(x, y, v.radius * 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = v.color;
      ctx.beginPath(); ctx.arc(x, y, v.radius, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = v.color; ctx.lineWidth = 2.5;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + v.phase;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * v.radius * 0.7, y + Math.sin(a) * v.radius * 0.7);
        ctx.lineTo(x + Math.cos(a) * v.radius * 1.35, y + Math.sin(a) * v.radius * 1.35);
        ctx.stroke();
      }

      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x - v.radius * 0.3, y - v.radius * 0.2, v.radius * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + v.radius * 0.3, y - v.radius * 0.2, v.radius * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(x - v.radius * 0.25, y - v.radius * 0.2, v.radius * 0.14, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + v.radius * 0.35, y - v.radius * 0.2, v.radius * 0.14, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y + v.radius * 0.25, v.radius * 0.2, 0, Math.PI); ctx.stroke();
    }

    for (const e of this.effects) {
      ctx.fillStyle = e.color.replace(')', `,${e.alpha})`).replace('rgb', 'rgba');
      if (e.color.startsWith('#')) {
        ctx.fillStyle = `rgba(255,${e.alpha})`;
      }
      ctx.beginPath(); ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2); ctx.fill();
    }
  }

  onStop() {}
}
