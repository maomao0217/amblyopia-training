/**
 * 套牛游戏 - 在合适的时机点击套住移动的动物
 * 训练时机把握和手眼协调
 */
class RopeGame extends BaseGame {
  constructor() {
    super({ id: 'rope', name: '套牛游戏', icon: '🤠', description: '看准时机点击套住小动物', duration: 60 });
  }

  onStart() {
    this.animals = [];
    this.caughtAnimals = [];
    this.ropeAnimations = [];
    this.spawnTimer = 0;

    this.bindTouch('touchstart', (e) => {
      const pos = this.getTouchPos(e);
      this._tryCatch(pos.x, pos.y);
    });
    this.bindInput('mousedown', (e) => {
      const pos = this.getTouchPos(e);
      this._tryCatch(pos.x, pos.y);
    });
  }

  _tryCatch(tx, ty) {
    // 检查是否套中动物
    for (let i = this.animals.length - 1; i >= 0; i--) {
      const a = this.animals[i];
      const dist = Math.hypot(tx - a.x, ty - a.y);
      if (dist < a.radius + 20) {
        this.caughtAnimals.push({
          x: a.x, y: a.y, emoji: a.emoji, alpha: 1, vy: -3,
        });
        this.animals.splice(i, 1);
        this.addScore(1);
        return;
      }
    }
    // 未命中动画
    this.ropeAnimations.push({ x: tx, y: ty, radius: 5, alpha: 1 });
  }

  onUpdate() {
    this.spawnTimer++;
    if (this.spawnTimer >= 45) {
      this.spawnTimer = 0;
      const animals = ['🐮', '🐷', '🐑', '🐔', '🐴', '🐰', '🐸', '🦆'];
      this.animals.push({
        x: -40, y: 80 + Math.random() * (this.height - 180),
        radius: 28,
        speed: 1 + Math.random() * 2,
        emoji: animals[Math.floor(Math.random() * animals.length)],
        wobble: Math.random() * Math.PI * 2,
      });
    }

    for (const a of this.animals) {
      a.x += a.speed;
      a.wobble += 0.03;
    }
    this.animals = this.animals.filter(a => a.x < this.width + 60);

    for (const c of this.caughtAnimals) { c.y += c.vy; c.alpha -= 0.02; }
    this.caughtAnimals = this.caughtAnimals.filter(c => c.alpha > 0);

    for (const r of this.ropeAnimations) { r.radius += 3; r.alpha -= 0.06; }
    this.ropeAnimations = this.ropeAnimations.filter(r => r.alpha > 0);
  }

  onDraw() {
    const ctx = this.ctx;

    // 草地
    ctx.fillStyle = 'rgba(34,139,34,0.3)';
    ctx.fillRect(0, this.height * 0.7, this.width, this.height * 0.3);

    // 围栏
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 3;
    for (let x = this.width - 20; x > 0; x -= 50) {
      ctx.beginPath();
      ctx.moveTo(x, this.height * 0.62);
      ctx.lineTo(x, this.height * 0.72);
      ctx.stroke();
    }
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.height * 0.65);
    ctx.lineTo(this.width, this.height * 0.65);
    ctx.moveTo(0, this.height * 0.7);
    ctx.lineTo(this.width, this.height * 0.7);
    ctx.stroke();

    // 动物
    ctx.font = '40px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const a of this.animals) {
      const dy = Math.sin(a.wobble) * 10;
      ctx.fillText(a.emoji, a.x, a.y + dy);
      // 触控区域指示
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(a.x, a.y + dy, a.radius + 15, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 套索动画
    for (const r of this.ropeAnimations) {
      ctx.strokeStyle = `rgba(139,90,43,${r.alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2); ctx.stroke();
    }

    // 被捕获
    ctx.font = '34px serif';
    for (const c of this.caughtAnimals) {
      ctx.globalAlpha = c.alpha;
      ctx.fillText(c.emoji, c.x, c.y);
      ctx.globalAlpha = 1;
    }

    // 人物
    ctx.font = '50px serif';
    ctx.fillText('🤠', this.width / 2, this.height - 20);
  }

  onStop() {}
}
