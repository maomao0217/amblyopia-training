/**
 * 打地鼠游戏 - 点击从洞里冒出来的小动物
 * 训练反应速度和手眼协调
 */
class WhackGame extends BaseGame {
  constructor() {
    super({ id: 'whack', name: '打地鼠', icon: '🔨', description: '点击冒出来的小动物', duration: 60 });
  }

  onStart() {
    this.holes = [];
    this.moles = []; // { holeIndex, timer, emoji, state: 'up'|'down' }
    this.hitEffects = [];
    const cols = 3, rows = 3;
    const marginX = (this.width - cols * 90) / 2;
    const marginY = this.height * 0.25;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.holes.push({
          x: marginX + c * 90 + 45,
          y: marginY + r * 100 + 45,
        });
      }
    }

    // 定时生成地鼠
    this._spawnInterval = setInterval(() => {
      if (!this.isRunning) return;
      if (this.moles.length < 3 + Math.floor(this.score / 5)) {
        const holeIdx = Math.floor(Math.random() * this.holes.length);
        if (!this.moles.some(m => m.holeIndex === holeIdx)) {
          const emojis = ['🐹', '🐰', '🐸', '🐻', '🦊', '🐼', '🐨', '🐷'];
          this.moles.push({
            holeIndex: holeIdx,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            timer: 40 + Math.random() * 40,
          });
        }
      }
    }, 800);

    this.bindTouch('touchstart', (e) => {
      const pos = this.getTouchPos(e);
      for (let i = this.moles.length - 1; i >= 0; i--) {
        const m = this.moles[i];
        const h = this.holes[m.holeIndex];
        if (Math.hypot(pos.x - h.x, pos.y - h.y) < 40) {
          this.hitEffects.push({ x: h.x, y: h.y, alpha: 1 });
          this.moles.splice(i, 1);
          this.addScore(1);
          return;
        }
      }
    });
    this.bindInput('mousedown', (e) => {
      const pos = this.getTouchPos(e);
      for (let i = this.moles.length - 1; i >= 0; i--) {
        const m = this.moles[i];
        const h = this.holes[m.holeIndex];
        if (Math.hypot(pos.x - h.x, pos.y - h.y) < 40) {
          this.hitEffects.push({ x: h.x, y: h.y, alpha: 1 });
          this.moles.splice(i, 1);
          this.addScore(1);
          return;
        }
      }
    });
  }

  onUpdate() {
    for (let i = this.moles.length - 1; i >= 0; i--) {
      this.moles[i].timer--;
      if (this.moles[i].timer <= 0) {
        this.moles.splice(i, 1);
      }
    }
    for (const e of this.hitEffects) { e.alpha -= 0.05; }
    this.hitEffects = this.hitEffects.filter(e => e.alpha > 0);
  }

  onDraw() {
    const ctx = this.ctx;
    // 地面
    ctx.fillStyle = 'rgba(139,90,43,0.4)';
    ctx.fillRect(0, this.height * 0.2, this.width, this.height * 0.8);

    // 洞
    for (const h of this.holes) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.ellipse(h.x, h.y + 10, 40, 15, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(60,30,10,0.6)';
      ctx.beginPath(); ctx.arc(h.x, h.y - 5, 38, 0, Math.PI); ctx.fill();
    }

    // 地鼠
    ctx.font = '36px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const m of this.moles) {
      const h = this.holes[m.holeIndex];
      const popUp = Math.min(1, (40 - Math.max(0, m.timer - 30)) / 10); // 弹起动画
      const y = h.y - 10 - popUp * 35;
      ctx.fillText(m.emoji, h.x, y);
      // 身体
      ctx.fillStyle = 'rgba(139,90,43,0.5)';
      ctx.beginPath(); ctx.arc(h.x, h.y + 5, 30 * popUp, 0, Math.PI * 2); ctx.fill();
    }

    // 击打特效
    for (const e of this.hitEffects) {
      ctx.fillStyle = `rgba(255,230,100,${e.alpha})`;
      ctx.font = `${30 + (1 - e.alpha) * 20}px serif`;
      ctx.fillText('💥', e.x, e.y - (1 - e.alpha) * 20);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '14px sans-serif';
    ctx.fillText(`已打到: ${this.score}个`, this.width / 2, this.height * 0.15);
  }

  onStop() {
    if (this._spawnInterval) clearInterval(this._spawnInterval);
  }
}
