/**
 * 贪吃蛇游戏 - 滑动控制蛇的方向吃食物
 */
class SnakeGame extends BaseGame {
  constructor() {
    super({ id: 'snake', name: '贪吃蛇', icon: '🐍', description: '滑动让蛇吃到好吃的水果', duration: 60 });
  }

  onStart() {
    this.gridSize = 22;
    this.cols = Math.floor(this.width / this.gridSize);
    this.rows = Math.floor(this.height / this.gridSize);

    this.snake = [{ x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) }];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.food = this._spawnFood();
    this.moveTimer = 0;
    this.moveInterval = 10;

    this.touchStart = null;
    this.bindTouch('touchstart', (e) => {
      const t = e.touches[0];
      this.touchStart = { x: t.clientX, y: t.clientY };
    });
    this.bindTouch('touchmove', (e) => {
      if (!this.touchStart) return;
      const t = e.touches[0];
      const dx = t.clientX - this.touchStart.x;
      const dy = t.clientY - this.touchStart.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.nextDir = { x: dx > 0 ? 1 : -1, y: 0 };
      } else {
        this.nextDir = { x: 0, y: dy > 0 ? 1 : -1 };
      }
      this.touchStart = { x: t.clientX, y: t.clientY };
    });

    this._onKey = (e) => {
      const map = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
      if (map[e.key]) this.nextDir = map[e.key];
    };
    document.addEventListener('keydown', this._onKey);
  }

  _spawnFood() {
    let pos;
    do { pos = { x: Math.floor(Math.random() * this.cols), y: Math.floor(Math.random() * this.rows) }; }
    while (this.snake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  }

  onUpdate() {
    if (this.frameCount - this.moveTimer < this.moveInterval) return;
    this.moveTimer = this.frameCount;

    if (this.nextDir.x !== -this.dir.x || this.nextDir.y !== -this.dir.y) {
      this.dir = this.nextDir;
    }

    const head = this.snake[0];
    let nx = head.x + this.dir.x;
    let ny = head.y + this.dir.y;

    if (nx < 0) { nx = 0; this.dir.x = 1; this.nextDir.x = 1; }
    if (nx >= this.cols) { nx = this.cols - 1; this.dir.x = -1; this.nextDir.x = -1; }
    if (ny < 0) { ny = 0; this.dir.y = 1; this.nextDir.y = 1; }
    if (ny >= this.rows) { ny = this.rows - 1; this.dir.y = -1; this.nextDir.y = -1; }

    const newHead = { x: nx, y: ny };

    if (nx === this.food.x && ny === this.food.y) {
      this.snake.unshift(newHead);
      this.food = this._spawnFood();
      this.addScore(1);
      if (this.moveInterval > 4) this.moveInterval -= 0.3;
    } else {
      this.snake.unshift(newHead);
      this.snake.pop();
    }
  }

  onDraw() {
    const ctx = this.ctx;
    const gs = this.gridSize;

    // 网格
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < this.cols; x++)
      for (let y = 0; y < this.rows; y++)
        ctx.strokeRect(x * gs, y * gs, gs, gs);

    // 食物
    const foods = ['🍎', '🍊', '🍇', '🍓', '🍒', '🍑', '🥝', '🫐'];
    const emoji = foods[Math.floor(Date.now() / 800) % foods.length];
    ctx.font = `${gs * 1.3}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(emoji, this.food.x * gs + gs / 2, this.food.y * gs + gs / 2);

    // 蛇
    for (let i = this.snake.length - 1; i >= 0; i--) {
      const s = this.snake[i];
      const ratio = 1 - i / (this.snake.length + 10) * 0.5;
      const size = gs * ratio;
      const cx = s.x * gs + gs / 2;
      const cy = s.y * gs + gs / 2;

      if (i === 0) {
        ctx.fillStyle = '#4ECDC4';
        ctx.beginPath(); ctx.arc(cx, cy, size / 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(cx - 3, cy - 3, 3.5, 0, Math.PI * 2); ctx.arc(cx + 3, cy - 3, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath(); ctx.arc(cx - 3, cy - 3, 1.8, 0, Math.PI * 2); ctx.arc(cx + 3, cy - 3, 1.8, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = `hsla(175, 60%, 55%, ${0.6 + ratio * 0.4})`;
        ctx.beginPath(); ctx.arc(cx, cy, size / 2, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  onStop() {
    document.removeEventListener('keydown', this._onKey);
  }
}
