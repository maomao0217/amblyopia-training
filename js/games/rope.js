/**
 * 套牛游戏 - 在合适的时机点击套住移动的动物
 * 训练时机把握和手眼协调
 */
class RopeGame extends BaseGame {
  constructor() {
    super({
      id: 'rope',
      name: '套牛游戏',
      icon: '🤠',
      description: '看准时机点击套住小动物',
      duration: 60,
    });
  }

  onStart() {
    this.animals = [];
    this.rope = null; // { x, y, radius, growing }
    this.spawnTimer = 0;
    this.caughtAnimals = [];
    this.missCount = 0;

    this._onTap = (e) => {
      e.preventDefault();
      if (!this.isRunning) return;
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const tx = (clientX - rect.left) * (this.width / rect.width);
      const ty = (clientY - rect.top) * (this.height / rect.height);

      // 检查是否套中动物
      let caught = false;
      for (let i = this.animals.length - 1; i >= 0; i--) {
        const a = this.animals[i];
        const dist = Math.hypot(tx - a.x, ty - a.y);
        if (dist < a.radius + 15) {
          this.caughtAnimals.push({
            x: a.x,
            y: a.y,
            emoji: a.emoji,
            alpha: 1,
            vy: -3,
          });
          this.animals.splice(i, 1);
          this.addScore(1);
          caught = true;
          break;
        }
      }

      if (!caught) {
        this.missCount++;
        // 显示套索动画
        this.ropeAnimations = this.ropeAnimations || [];
        this.ropeAnimations.push({ x: tx, y: ty, radius: 5, alpha: 1 });
      }
    };

    this.canvas.addEventListener('touchstart', this._onTap, { passive: false });
    this.canvas.addEventListener('mousedown', this._onTap);
  }

  onUpdate() {
    this.spawnTimer++;

    if (this.spawnTimer >= 45) {
      this.spawnTimer = 0;
      const animals = ['🐮', '🐷', '🐑', '🐔', '🐴', '🐰', '🐸', '🦆'];
      this.animals.push({
        x: -40,
        y: 100 + Math.random() * (this.height - 200),
        radius: 22,
        speed: 1 + Math.random() * 2,
        emoji: animals[Math.floor(Math.random() * animals.length)],
        wobble: Math.random() * Math.PI * 2,
      });
    }

    // 移动动物
    for (const a of this.animals) {
      a.x += a.speed;
      a.wobble += 0.03;
      a.displayY = a.y + Math.sin(a.wobble) * 10;
    }

    // 移除跑掉的动物
    this.animals = this.animals.filter(a => a.x < this.width + 60);

    // 捕获动画
    for (const c of this.caughtAnimals) {
      c.y += c.vy;
      c.alpha -= 0.02;
    }
    this.caughtAnimals = this.caughtAnimals.filter(c => c.alpha > 0);

    // 套索动画
    if (this.ropeAnimations) {
      for (const r of this.ropeAnimations) {
        r.radius += 3;
        r.alpha -= 0.06;
      }
      this.ropeAnimations = this.ropeAnimations.filter(r => r.alpha > 0);
    }
  }

  onDraw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 草原背景
    const bg = ctx.createLinearGradient(0, 0, 0, this.height);
    bg.addColorStop(0, '#87CEEB');
    bg.addColorStop(0.6, '#90EE90');
    bg.addColorStop(1, '#228B22');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.width, this.height);

    // 地面纹理
    ctx.fillStyle = '#7CCD7C';
    for (let x = 0; x < this.width; x += 40) {
      ctx.fillRect(x, this.height * 0.7 + (x % 80 === 0 ? 0 : 5), 20, 3);
    }

    // 围栏
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 3;
    for (let x = this.width - 20; x > 0; x -= 50) {
      ctx.beginPath();
      ctx.moveTo(x, this.height * 0.62);
      ctx.lineTo(x, this.height * 0.72);
      ctx.stroke();
    }
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.height * 0.65);
    ctx.lineTo(this.width, this.height * 0.65);
    ctx.moveTo(0, this.height * 0.7);
    ctx.lineTo(this.width, this.height * 0.7);
    ctx.stroke();

    // 动物
    ctx.font = '36px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const a of this.animals) {
      const dy = a.displayY || a.y;
      ctx.fillText(a.emoji, a.x, dy);
    }

    // 套索动画
    if (this.ropeAnimations) {
      for (const r of this.ropeAnimations) {
        ctx.strokeStyle = `rgba(139, 90, 43, ${r.alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 被捕获的动物
    ctx.font = '30px serif';
    for (const c of this.caughtAnimals) {
      ctx.globalAlpha = c.alpha;
      ctx.fillText(c.emoji, c.x, c.y);
      ctx.globalAlpha = 1;
    }

    // 人物（底部）
    ctx.font = '50px serif';
    ctx.fillText('🤠', this.width / 2, this.height - 20);
  }

  onStop() {
    this.canvas.removeEventListener('touchstart', this._onTap);
    this.canvas.removeEventListener('mousedown', this._onTap);
  }
}
