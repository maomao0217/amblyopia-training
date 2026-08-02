/**
 * 找到规定的东西 - 在一堆物品中找到要求的目标
 * 训练视觉搜索和辨别能力
 */
class FindItGame extends BaseGame {
  constructor() {
    super({
      id: 'findit',
      name: '找到物品',
      icon: '🔎',
      description: '找到要求的那个物品',
      duration: 60,
    });
  }

  onStart() {
    this.targetEmoji = '';
    this.items = [];
    this.foundCount = 0;
    this.level = 1;
    this._generatePuzzle();

    this._onTap = (e) => {
      e.preventDefault();
      if (!this.isRunning) return;
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const tx = (clientX - rect.left) * (this.width / rect.width);
      const ty = (clientY - rect.top) * (this.height / rect.height);

      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        if (item.emoji !== this.targetEmoji) continue;
        const dist = Math.hypot(tx - item.x, ty - item.y);
        if (dist < 28) {
          this.items.splice(i, 1);
          this.addScore(1);
          this.foundCount++;
          if (this.foundCount >= this.level + 2) {
            this.level++;
            setTimeout(() => this._generatePuzzle(), 500);
          }
          return;
        }
      }

      // 点击了错误物品
      // 对于3岁宝宝，不做惩罚，只是没有反应
    };

    this.canvas.addEventListener('touchstart', this._onTap, { passive: false });
    this.canvas.addEventListener('mousedown', this._onTap);
  }

  _generatePuzzle() {
    const allEmojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🍑', '🥝',
      '🐱', '🐶', '🐰', '🐸', '🐻', '🐼', '🐨', '🦊',
      '⭐', '❤️', '🌸', '🌈', '☀️', '🌙', '⚽', '🎈'];
    const itemCount = 12 + this.level * 2;

    // 选择目标和干扰项
    this.targetEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
    const targetCount = this.level + 2;
    this.foundCount = 0;
    this.items = [];

    // 生成位置（避免重叠）
    const usedPositions = [];
    const margin = 40;

    const addItem = (emoji) => {
      let attempts = 0;
      let x, y;
      do {
        x = margin + Math.random() * (this.width - 2 * margin);
        y = 100 + Math.random() * (this.height - 140);
        attempts++;
      } while (attempts < 50 && usedPositions.some(
        p => Math.hypot(p.x - x, p.y - y) < 45
      ));
      usedPositions.push({ x, y });
      this.items.push({ emoji, x, y, size: 26 + Math.random() * 8 });
    };

    // 放置目标
    for (let i = 0; i < targetCount; i++) {
      addItem(this.targetEmoji);
    }

    // 放置干扰项
    const distractors = allEmojis.filter(e => e !== this.targetEmoji);
    for (let i = 0; i < itemCount - targetCount; i++) {
      addItem(distractors[Math.floor(Math.random() * distractors.length)]);
    }

    // 随机打乱
    this.items.sort(() => Math.random() - 0.5);
  }

  onDraw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 目标提示
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(this.width / 2 - 120, 10, 240, 60, 20);
    ctx.fill();

    ctx.fillStyle = '#FFE66D';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('请找到所有的', this.width / 2, 38);

    ctx.font = '36px serif';
    ctx.fillText(this.targetEmoji, this.width / 2, 68);

    // 进度
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '14px sans-serif';
    ctx.fillText(`剩余: ${this.level + 2 - this.foundCount} | 第${this.level}关`, this.width / 2, 90);

    // 物品
    ctx.font = '30px serif';
    ctx.textBaseline = 'middle';
    for (const item of this.items) {
      ctx.font = `${item.size}px serif`;
      ctx.fillText(item.emoji, item.x, item.y);
    }
  }

  onStop() {
    this.canvas.removeEventListener('touchstart', this._onTap);
    this.canvas.removeEventListener('mousedown', this._onTap);
  }
}
