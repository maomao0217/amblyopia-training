/**
 * 消除水果游戏 - 点击3个以上相邻的相同水果消除
 * 简化版：点击一组相同水果即可消除（适合3岁宝宝）
 */
class FruitGame extends BaseGame {
  constructor() {
    super({
      id: 'fruit',
      name: '消除水果',
      icon: '🍉',
      description: '点击相同的水果消除它们',
      duration: 60,
    });
  }

  onStart() {
    this.cols = 6;
    this.rows = 8;
    this.cellSize = Math.min(
      Math.floor((this.width - 20) / this.cols),
      Math.floor((this.height - 20) / this.rows)
    );
    this.offsetX = (this.width - this.cols * this.cellSize) / 2;
    this.offsetY = (this.height - this.rows * this.cellSize) / 2;
    this.fruits = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒'];
    this.grid = [];
    this.selected = null;
    this.eliminating = []; // 正在消除的动画
    this._initGrid();

    this._onTap = (e) => {
      e.preventDefault();
      if (!this.isRunning) return;
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const tx = (clientX - rect.left) * (this.width / rect.width);
      const ty = (clientY - rect.top) * (this.height / rect.height);

      const col = Math.floor((tx - this.offsetX) / this.cellSize);
      const row = Math.floor((ty - this.offsetY) / this.cellSize);

      if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;

      // 找到所有相连的相同水果
      const target = this.grid[row][col];
      if (!target) return;
      const group = this._findGroup(col, row, target);
      if (group.length >= 2) {
        // 消除
        for (const { col: c, row: r } of group) {
          this.eliminating.push({
            x: this.offsetX + c * this.cellSize + this.cellSize / 2,
            y: this.offsetY + r * this.cellSize + this.cellSize / 2,
            fruit: this.grid[r][c],
            alpha: 1,
            scale: 1,
          });
          this.grid[r][c] = null;
        }
        this.addScore(group.length);
        // 下落和填充
        setTimeout(() => this._applyGravity(), 300);
      }
    };

    this.canvas.addEventListener('touchstart', this._onTap, { passive: false });
    this.canvas.addEventListener('mousedown', this._onTap);
  }

  _initGrid() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = this.fruits[Math.floor(Math.random() * this.fruits.length)];
      }
    }
  }

  _findGroup(col, row, fruit) {
    const visited = new Set();
    const group = [];
    const stack = [{ col, row }];

    while (stack.length > 0) {
      const { col: c, row: r } = stack.pop();
      const key = `${c},${r}`;
      if (visited.has(key)) continue;
      if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) continue;
      if (this.grid[r][c] !== fruit) continue;

      visited.add(key);
      group.push({ col: c, row: r });

      stack.push({ col: c + 1, row: r });
      stack.push({ col: c - 1, row: r });
      stack.push({ col: c, row: r + 1 });
      stack.push({ col: c, row: r - 1 });
    }

    return group;
  }

  _applyGravity() {
    // 下落
    for (let c = 0; c < this.cols; c++) {
      let writeRow = this.rows - 1;
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.grid[r][c] !== null) {
          this.grid[writeRow][c] = this.grid[r][c];
          if (writeRow !== r) this.grid[r][c] = null;
          writeRow--;
        }
      }
      // 填充新水果
      for (let r = writeRow; r >= 0; r--) {
        this.grid[r][c] = this.fruits[Math.floor(Math.random() * this.fruits.length)];
      }
    }
  }

  onUpdate() {
    // 消除动画
    for (const e of this.eliminating) {
      e.alpha -= 0.04;
      e.scale += 0.03;
    }
    this.eliminating = this.eliminating.filter(e => e.alpha > 0);
  }

  onDraw() {
    const ctx = this.ctx;
    const cs = this.cellSize;
    ctx.clearRect(0, 0, this.width, this.height);

    // 网格背景
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(this.offsetX, this.offsetY, this.cols * cs, this.rows * cs);

    ctx.font = `${cs * 0.7}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const fruit = this.grid[r][c];
        if (!fruit) continue;

        // 检查是否正在消除
        const isEliminating = this.eliminating.some(
          e => Math.abs(e.x - (this.offsetX + c * cs + cs / 2)) < 2 &&
               Math.abs(e.y - (this.offsetY + r * cs + cs / 2)) < 2
        );
        if (isEliminating) continue;

        const cx = this.offsetX + c * cs + cs / 2;
        const cy = this.offsetY + r * cs + cs / 2;

        // 单元格背景
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.roundRect(cx - cs / 2 + 2, cy - cs / 2 + 2, cs - 4, cs - 4, 8);
        ctx.fill();

        ctx.fillText(fruit, cx, cy);
      }
    }

    // 消除动画
    for (const e of this.eliminating) {
      ctx.globalAlpha = e.alpha;
      ctx.font = `${cs * 0.7 * e.scale}px serif`;
      ctx.fillText(e.fruit, e.x, e.y);
      ctx.globalAlpha = 1;
    }
  }

  onStop() {
    this.canvas.removeEventListener('touchstart', this._onTap);
    this.canvas.removeEventListener('mousedown', this._onTap);
  }
}
