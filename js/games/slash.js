/**
 * 切水果游戏 - 滑动手指切开飞起的水果
 * 训练追踪移动目标
 */
class SlashGame extends BaseGame {
  constructor() {
    super({ id: 'slash', name: '切水果', icon: '🔪', description: '滑动手指切开水果', duration: 60 });
  }

  onStart() {
    this.fruits = [];
    this.slashTrail = [];
    this.spawnTimer = 0;
    this.trailTimer = 0;

    this.bindTouch('touchstart', (e) => {
      const pos = this.getTouchPos(e);
      this.slashTrail = [{ x: pos.x, y: pos.y }];
      this.trailTimer = 10;
    });
    this.bindTouch('touchmove', (e) => {
      const pos = this.getTouchPos(e);
      if (this.slashTrail.length > 0) {
        const last = this.slashTrail[this.slashTrail.length - 1];
        this.slashTrail.push({ x: pos.x, y: pos.y });
        // 检测切割
        for (let i = this.fruits.length - 1; i >= 0; i--) {
          const f = this.fruits[i];
          if (Math.hypot(pos.x - f.x, pos.y - f.y) < f.radius + 8 &&
              Math.hypot(last.x - f.x, last.y - f.y) < f.radius + 8) {
            this.addScore(1);
            this.fruits.splice(i, 1);
          }
        }
      }
      this.trailTimer = 10;
    });
    this.bindTouch('touchend', () => { this.trailTimer = 0; });
  }

  onUpdate() {
    this.spawnTimer++;
    if (this.spawnTimer >= 40) {
      this.spawnTimer = 0;
      const fruits = ['🍎', '🍊', '🍋', '🍉', '🍇', '🍓', '🍑', '🥝', '🍌'];
      this.fruits.push({
        x: 20 + Math.random() * (this.width - 40),
        y: this.height + 30,
        radius: 22,
        emoji: fruits[Math.floor(Math.random() * fruits.length)],
        vy: -(5 + Math.random() * 6),
        vx: (Math.random() - 0.5) * 3,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
      });
    }

    for (const f of this.fruits) {
      f.vy += 0.25;
      f.y += f.vy;
      f.x += f.vx;
      f.rotation += f.rotSpeed;
    }
    this.fruits = this.fruits.filter(f => f.y < this.height + 40);

    if (this.trailTimer > 0) this.trailTimer--;
    if (this.trailTimer <= 0 && this.slashTrail.length > 0) {
      this.slashTrail.splice(0, 3);
      if (this.slashTrail.length === 0) this.slashTrail = [];
    }
  }

  onDraw() {
    const ctx = this.ctx;
    // 切割轨迹
    if (this.slashTrail.length > 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(this.slashTrail[0].x, this.slashTrail[0].y);
      for (let i = 1; i < this.slashTrail.length; i++) {
        ctx.lineTo(this.slashTrail[i].x, this.slashTrail[i].y);
      }
      ctx.stroke();
      // 发光效果
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(this.slashTrail[0].x, this.slashTrail[0].y);
      for (let i = 1; i < this.slashTrail.length; i++) {
        ctx.lineTo(this.slashTrail[i].x, this.slashTrail[i].y);
      }
      ctx.stroke();
    }

    // 水果
    ctx.font = '34px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const f of this.fruits) {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rotation);
      ctx.fillText(f.emoji, 0, 0);
      ctx.restore();
    }

    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '13px sans-serif';
    ctx.fillText('滑动手指切水果', this.width / 2, this.height - 15);
  }

  onStop() {}
}
