/**
 * 拼图游戏 - 拖动碎片到正确位置
 * 训练形状识别和空间推理（简化版适合3岁宝宝）
 */
class PuzzleGame extends BaseGame {
  constructor() {
    super({ id: 'puzzle', name: '拼图游戏', icon: '🧩', description: '把碎片拖到正确位置', duration: 60 });
  }

  onStart() {
    this.pieces = [];
    this.slots = [];
    this.dragging = null;
    this.dragOffset = { x: 0, y: 0 };
    const cols = 2, rows = 2;
    const pieceW = 100, pieceH = 100;
    const marginX = (this.width - cols * (pieceW + 20)) / 2;
    const marginY = (this.height - rows * (pieceH + 20)) / 2 + 30;

    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A29BFE'];
    const shapes = ['circle', 'star', 'heart', 'square'];

    for (let i = 0; i < rows * cols; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const sx = marginX + col * (pieceW + 20);
      const sy = marginY + row * (pieceH + 20);
      this.slots.push({ x: sx, y: sy, w: pieceW, h: pieceH, color: colors[i], shape: shapes[i], filled: false });

      this.pieces.push({
        x: 20 + Math.random() * (this.width - pieceW - 40),
        y: this.height - 150 + Math.random() * 80,
        w: pieceW, h: pieceH,
        color: colors[i], shape: shapes[i],
        slotIndex: i, placed: false,
        homeX: 0, homeY: 0,
      });
    }

    this.bindTouch('touchstart', (e) => {
      const pos = this.getTouchPos(e);
      for (let i = this.pieces.length - 1; i >= 0; i--) {
        const p = this.pieces[i];
        if (p.placed) continue;
        if (pos.x >= p.x && pos.x <= p.x + p.w && pos.y >= p.y && pos.y <= p.y + p.h) {
          this.dragging = i;
          this.dragOffset = { x: pos.x - p.x, y: pos.y - p.y };
          return;
        }
      }
    });
    this.bindTouch('touchmove', (e) => {
      if (this.dragging === null) return;
      const pos = this.getTouchPos(e);
      this.pieces[this.dragging].x = pos.x - this.dragOffset.x;
      this.pieces[this.dragging].y = pos.y - this.dragOffset.y;
    });
    this.bindTouch('touchend', () => {
      if (this.dragging !== null) {
        const p = this.pieces[this.dragging];
        const s = this.slots[p.slotIndex];
        if (Math.hypot(p.x + p.w / 2 - (s.x + s.w / 2), p.y + p.h / 2 - (s.y + s.h / 2)) < 50) {
          p.x = s.x; p.y = s.y; p.placed = true; s.filled = true;
          this.addScore(1);
        }
        this.dragging = null;
      }
    });
  }

  onDraw() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('把碎片拖到正确的位置', this.width / 2, 25);

    // 槽位
    for (const s of this.slots) {
      ctx.strokeStyle = s.filled ? s.color : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 3; ctx.setLineDash([8, 4]);
      ctx.beginPath(); ctx.roundRect(s.x, s.y, s.w, s.h, 12); ctx.stroke();
      ctx.setLineDash([]);

      if (!s.filled) {
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath(); ctx.roundRect(s.x, s.y, s.w, s.h, 12); ctx.fill();
      }
    }

    // 碎片
    for (const p of this.pieces) {
      if (p.placed) continue;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.roundRect(p.x, p.y, p.w, p.h, 12); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.roundRect(p.x + 5, p.y + 5, 30, 30, 5); ctx.fill();

      // 形状标记
      ctx.fillStyle = '#fff'; ctx.font = '40px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      let shapeEmoji = '●';
      if (p.shape === 'star') shapeEmoji = '⭐';
      else if (p.shape === 'heart') shapeEmoji = '❤️';
      else if (p.shape === 'square') shapeEmoji = '■';
      ctx.fillText(shapeEmoji, p.x + p.w / 2, p.y + p.h / 2);
    }
  }

  onStop() {}
}
