/**
 * 涂色游戏 - 点击区域填充颜色
 * 训练颜色识别和精细动作
 */
class ColoringGame extends BaseGame {
  constructor() {
    super({ id: 'coloring', name: '涂色游戏', icon: '🎨', description: '点击区域来涂色', duration: 60 });
  }

  onStart() {
    this.colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A29BFE', '#FD79A8', '#FF9F43', '#55E6C1', '#F8B739'];
    this.selectedColor = 0;
    this.drawings = [];
    this._generateDrawing();

    this.bindTouch('touchstart', (e) => {
      const pos = this.getTouchPos(e);
      // 检查颜色选择器
      if (pos.y > this.height - 55) {
        const idx = Math.floor(pos.x / (this.width / this.colors.length));
        if (idx >= 0 && idx < this.colors.length) {
          this.selectedColor = idx;
          return;
        }
      }
      // 涂色
      for (const d of this.drawings) {
        if (pos.x >= d.x && pos.x <= d.x + d.w && pos.y >= d.y && pos.y <= d.y + d.h) {
          if (d.color !== this.colors[this.selectedColor]) {
            d.color = this.colors[this.selectedColor];
            this.addScore(1);
          }
          return;
        }
      }
    });
    this.bindInput('mousedown', (e) => {
      const pos = this.getTouchPos(e);
      if (pos.y > this.height - 55) {
        const idx = Math.floor(pos.x / (this.width / this.colors.length));
        if (idx >= 0 && idx < this.colors.length) {
          this.selectedColor = idx;
          return;
        }
      }
      for (const d of this.drawings) {
        if (pos.x >= d.x && pos.x <= d.x + d.w && pos.y >= d.y && pos.y <= d.y + d.h) {
          if (d.color !== this.colors[this.selectedColor]) {
            d.color = this.colors[this.selectedColor];
            this.addScore(1);
          }
          return;
        }
      }
    });
  }

  _generateDrawing() {
    this.drawings = [];
    // 生成一个简单图案的区块（房子、树、太阳等）
    const cx = this.width / 2;
    const cy = this.height / 2 - 20;

    // 太阳
    this.drawings.push({ x: this.width - 80, y: 40, w: 60, h: 60, color: null });
    // 房子主体
    this.drawings.push({ x: cx - 60, y: cy - 20, w: 120, h: 100, color: null });
    // 屋顶
    this.drawings.push({ x: cx - 10, y: cy - 70, w: 90, h: 55, color: null });
    // 门
    this.drawings.push({ x: cx - 15, y: cy + 30, w: 30, h: 50, color: null });
    // 窗户
    this.drawings.push({ x: cx - 45, y: cy + 5, w: 25, h: 25, color: null });
    this.drawings.push({ x: cx + 20, y: cy + 5, w: 25, h: 25, color: null });
    // 树
    this.drawings.push({ x: 30, y: cy - 20, w: 50, h: 70, color: null });
    this.drawings.push({ x: 55, y: cy - 60, w: 60, h: 55, color: null });
    // 地面
    this.drawings.push({ x: 0, y: cy + 80, w: this.width, h: this.height - cy - 80, color: null });
    // 云
    this.drawings.push({ x: 60, y: 20, w: 70, h: 40, color: null });
  }

  onDraw() {
    const ctx = this.ctx;

    // 图画区域
    for (const d of this.drawings) {
      ctx.fillStyle = d.color || 'rgba(255,255,255,0.08)';
      ctx.beginPath(); ctx.roundRect(d.x, d.y, d.w, d.h, 6); ctx.fill();
      if (!d.color) {
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(d.x, d.y, d.w, d.h, 6); ctx.stroke();
      }
    }

    // 图标提示
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('给图画涂上好看的颜色吧！', this.width / 2, this.height - 85);

    // 颜色选择器
    const pickerH = 50;
    const pickerY = this.height - pickerH;
    const cellW = this.width / this.colors.length;
    for (let i = 0; i < this.colors.length; i++) {
      ctx.fillStyle = this.colors[i];
      ctx.fillRect(i * cellW + 2, pickerY + 2, cellW - 4, pickerH - 4);
      if (i === this.selectedColor) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.roundRect(i * cellW + 1, pickerY + 1, cellW - 2, pickerH - 2, 8); ctx.stroke();
      }
    }
  }

  onStop() {}
}
