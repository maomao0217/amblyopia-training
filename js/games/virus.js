/**
 * 病毒游戏 - 点击消灭屏幕上的病毒
 * 病毒会在屏幕上出现和移动，宝宝点击消灭它们
 */
class VirusGame extends BaseGame {
  constructor() {
    super({
      id: 'virus',
      name: '消灭病毒',
      icon: '🦠',
      description: '点击消灭出现的病毒',
      duration: 60,
    });
  }

  onStart() {
    this.viruses = [];
    this.effects = []; // 消灭特效
    this.spawnTimer = 0;
    this.maxViruses = 5;
    this.missedViruses = 0;

    this._onTap = (e) => {
      e.preventDefault();
      if (!this.isRunning) return;
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const tx = (clientX - rect.left) * (this.width / rect.width);
      const ty = (clientY - rect.top) * (this.height / rect.height);

      for (let i = this.viruses.length - 1; i >= 0; i--) {
        const v = this.viruses[i];
        const dist = Math.hypot(tx - v.x, ty - v.y);
        if (dist < v.radius + 10) {
          // 消灭特效
          for (let j = 0; j < 6; j++) {
            const angle = (j / 6) * Math.PI * 2;
            this.effects.push({
              x: v.x,
              y: v.y,
              vx: Math.cos(angle) * 3,
              vy: Math.sin(angle) * 3,
              color: v.color,
              alpha: 1,
              size: 4 + Math.random() * 4,
            });
          }
          this.viruses.splice(i, 1);
          this.addScore(1);
          return;
        }
      }
    };

    this.canvas.addEventListener('touchstart', this._onTap, { passive: false });
    this.canvas.addEventListener('mousedown', this._onTap);
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
        life: 300 + Math.random() * 200,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // 病毒移动
    for (const v of this.viruses) {
      v.life--;
      v.wobble += v.wobbleSpeed;

      // 向目标移动
      const dx = v.targetX - v.x;
      const dy = v.targetY - v.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 5) {
        v.x += (dx / dist) * v.speed;
        v.y += (dy / dist) * v.speed;
      } else {
        // 到达后换目标
        v.targetX = 50 + Math.random() * (this.width - 100);
        v.targetY = 100 + Math.random() * (this.height - 150);
      }

      // 摆动
      v.displayX = v.x + Math.sin(v.wobble) * 8;
      v.displayY = v.y + Math.cos(v.wobble * 1.3) * 5;
    }

    // 移除超时的病毒
    this.viruses = this.viruses.filter(v => v.life > 0);

    // 特效动画
    for (const e of this.effects) {
      e.x += e.vx;
      e.y += e.vy;
      e.alpha -= 0.04;
      e.size *= 0.98;
    }
    this.effects = this.effects.filter(e => e.alpha > 0);
  }

  onDraw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 实验室背景
    const bg = ctx.createLinearGradient(0, 0, 0, this.height);
    bg.addColorStop(0, '#0a0a1a');
    bg.addColorStop(1, '#1a1a3e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.width, this.height);

    // 网格线
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // 病毒
    for (const v of this.viruses) {
      const x = v.displayX || v.x;
      const y = v.displayY || v.y;

      // 光晕
      const glow = ctx.createRadialGradient(x, y, v.radius * 0.3, x, y, v.radius * 1.5);
      glow.addColorStop(0, v.color);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, v.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 主体
      ctx.fillStyle = v.color;
      ctx.beginPath();
      ctx.arc(x, y, v.radius, 0, Math.PI * 2);
      ctx.fill();

      // 刺突
      const spikeCount = 8;
      ctx.strokeStyle = v.color;
      ctx.lineWidth = 2.5;
      for (let i = 0; i < spikeCount; i++) {
        const angle = (i / spikeCount) * Math.PI * 2 + v.phase;
        const innerR = v.radius * 0.7;
        const outerR = v.radius * 1.35;
        ctx.beginPath();
        ctx.moveTo(
          x + Math.cos(angle) * innerR,
          y + Math.sin(angle) * innerR
        );
        ctx.lineTo(
          x + Math.cos(angle) * outerR,
          y + Math.sin(angle) * outerR
        );
        ctx.stroke();
      }

      // 眼睛
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x - v.radius * 0.3, y - v.radius * 0.2, v.radius * 0.28, 0, Math.PI * 2);
      ctx.arc(x + v.radius * 0.3, y - v.radius * 0.2, v.radius * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(x - v.radius * 0.25, y - v.radius * 0.2, v.radius * 0.14, 0, Math.PI * 2);
      ctx.arc(x + v.radius * 0.35, y - v.radius * 0.2, v.radius * 0.14, 0, Math.PI * 2);
      ctx.fill();

      // 嘴巴（愤怒表情）
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y + v.radius * 0.25, v.radius * 0.2, 0, Math.PI);
      ctx.stroke();
    }

    // 特效粒子
    for (const e of this.effects) {
      ctx.fillStyle = `rgba(${e.color === '#FF6B6B' ? '255,107,107' : '255,159,67'}, ${e.alpha})`;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 消灭计数
    if (this.score > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`已消灭: ${this.score}个`, this.width / 2, this.height - 15);
    }
  }

  onStop() {
    this.canvas.removeEventListener('touchstart', this._onTap);
    this.canvas.removeEventListener('mousedown', this._onTap);
  }
}
