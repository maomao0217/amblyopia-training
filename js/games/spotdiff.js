/**
 * 找不同游戏 - 两幅图中找出不同的那一个
 * 宝宝需要在两幅相似图中找到颜色/形状不同的那个
 */
class SpotDiffGame extends BaseGame {
  constructor() {
    super({
      id: 'spotdiff',
      name: '找不同',
      icon: '🔍',
      description: '找出哪个图案不一样',
      duration: 60,
    });
  }

  onStart() {
    this.cols = 3;
    this.rows = 2;
    this.level = 1;
    this.diffCol = 0;
    this.diffRow = 0;
    this.found = false;
    this.generateLevel();
  }

  generateLevel() {
    this.cols = Math.min(3 + Math.floor(this.level / 3), 5);
    this.rows = 2 + Math.floor(this.level / 5);
    this.diffCol = Math.floor(Math.random() * this.cols);
    this.diffRow = Math.floor(Math.random() * this.rows);
    this.found = false;

    // 基础形状和颜色
    const shapes = ['circle', 'square', 'triangle', 'star', 'heart'];
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43', '#A29BFE', '#FD79A8'];
    this.baseShape = shapes[Math.floor(Math.random() * shapes.length)];
    this.baseColor = colors[Math.floor(Math.random() * colors.length)];

    // 不同项（颜色变化或形状变化）
    const diffColors = colors.filter(c => c !== this.baseColor);
    const diffShapes = shapes.filter(s => s !== this.baseShape);

    this.diffColor = diffColors[Math.floor(Math.random() * diffColors.length)];
    this.diffShape = Math.random() < 0.5 ? this.baseShape : diffShapes[Math.floor(Math.random() * diffShapes.length)];

    // 调整难度
    if (this.level < 3) {
      // 前几关颜色差异更大
      this.diffColor = this.baseColor === '#FF6B6B' ? '#4ECDC4' : '#FF6B6B';
    }

    this._onTap = (e) => {
      e.preventDefault();
      if (!this.isRunning || this.found) return;
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const tx = (clientX - rect.left) * (this.width / rect.width);
      const ty = (clientY - rect.top) * (this.height / rect.height);

      const marginX = (this.width - this.cols * 100) / 2;
      const marginY = (this.height - this.rows * 120) / 2 + 80;

      const col = Math.floor((tx - marginX) / 100);
      const row = Math.floor((ty - marginY) / 120);

      if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;

      if (col === this.diffCol && row === this.diffRow) {
        this.found = true;
        this.addScore(this.level * 5);
        this.level++;
        setTimeout(() => this.generateLevel(), 800);
      }
    };

    this.canvas.addEventListener('touchstart', this._onTap, { passive: false });
    this.canvas.addEventListener('mousedown', this._onTap);
  }

  _drawShape(ctx, x, y, shape, color, size = 35) {
    ctx.fillStyle = color;
    ctx.beginPath();
    switch (shape) {
      case 'circle':
        ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
        break;
      case 'square':
        ctx.roundRect(x - size * 0.5, y - size * 0.5, size, size, 6);
        break;
      case 'triangle':
        ctx.moveTo(x, y - size * 0.6);
        ctx.lineTo(x - size * 0.6, y + size * 0.5);
        ctx.lineTo(x + size * 0.6, y + size * 0.5);
        ctx.closePath();
        break;
      case 'star':
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const px = x + Math.cos(angle) * size * 0.6;
          const py = y + Math.sin(angle) * size * 0.6;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
          const innerAngle = angle + (2 * Math.PI) / 5;
          ctx.lineTo(
            x + Math.cos(innerAngle) * size * 0.25,
            y + Math.sin(innerAngle) * size * 0.25
          );
        }
        ctx.closePath();
        break;
      case 'heart':
        ctx.moveTo(x, y + size * 0.3);
        ctx.bezierCurveTo(x - size * 0.5, y - size * 0.3, x - size * 0.25, y - size * 0.6, x, y - size * 0.2);
        ctx.bezierCurveTo(x + size * 0.25, y - size * 0.6, x + size * 0.5, y - size * 0.3, x, y + size * 0.3);
        break;
    }
    ctx.fill();

    // 光泽
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(x - size * 0.15, y - size * 0.2, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  onDraw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 标题
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('找出不一样的那个！', this.width / 2, 40);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(`第 ${this.level} 关`, this.width / 2, 65);

    // 网格
    const marginX = (this.width - this.cols * 100) / 2;
    const marginY = (this.height - this.rows * 120) / 2 + 80;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cx = marginX + c * 100 + 50;
        const cy = marginY + r * 120 + 55;

        // 卡片背景
        ctx.fillStyle = this.found && c === this.diffCol && r === this.diffRow
          ? 'rgba(78, 205, 196, 0.3)'
          : 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.roundRect(cx - 42, cy - 48, 84, 96, 12);
        ctx.fill();

        // 画图形
        const isDiff = c === this.diffCol && r === this.diffRow;
        const color = isDiff ? this.diffColor : this.baseColor;
        const shape = isDiff ? this.diffShape : this.baseShape;
        this._drawShape(ctx, cx, cy, shape, color);

        // 找到提示
        if (this.found && isDiff) {
          ctx.strokeStyle = '#4ECDC4';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(cx - 42, cy - 48, 84, 96, 12);
          ctx.stroke();

          ctx.fillText('✅', cx, cy + 55);
        }
      }
    }
  }

  onStop() {
    this.canvas.removeEventListener('touchstart', this._onTap);
    this.canvas.removeEventListener('mousedown', this._onTap);
  }
}
