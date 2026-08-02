/**
 * 找到规定的东西 - 在一堆物品中找到要求的目标
 */
class FindItGame extends BaseGame {
  constructor() {
    super({ id: 'findit', name: '找到物品', icon: '🔎', description: '找到要求的那个物品', duration: 60 });
  }

  onStart() {
    this.targetEmoji = '';
    this.items = [];
    this.foundCount = 0;
    this.level = 1;
    this._generatePuzzle();

    this.bindTouch('touchstart', (e) => {
      const pos = this.getTouchPos(e);
      this._handleTap(pos.x, pos.y);
    });
    this.bindInput('mousedown', (e) => {
      const pos = this.getTouchPos(e);
      this._handleTap(pos.x, pos.y);
    });
  }

  _handleTap(tx, ty) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.emoji !== this.targetEmoji) continue;
      if (Math.hypot(tx - item.x, ty - item.y) < 32) {
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
  }

  _generatePuzzle() {
    const allEmojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🍑', '🥝',
      '🐱', '🐶', '🐰', '🐸', '🐻', '🐼', '🐨', '🦊',
      '⭐', '❤️', '🌸', '🌈', '☀️', '🌙', '⚽', '🎈'];
    const itemCount = 12 + this.level * 2;

    this.targetEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
    const targetCount = this.level + 2;
    this.foundCount = 0;
    this.items = [];

    const usedPositions = [];
    const margin = 40;

    const addItem = (emoji) => {
      let x, y, attempts = 0;
      do {
        x = margin + Math.random() * (this.width - 2 * margin);
        y = 110 + Math.random() * (this.height - 150);
        attempts++;
      } while (attempts < 50 && usedPositions.some(p => Math.hypot(p.x - x, p.y - y) < 50));
      usedPositions.push({ x, y });
      this.items.push({ emoji, x, y, size: 26 + Math.random() * 8 });
    };

    for (let i = 0; i < targetCount; i++) addItem(this.targetEmoji);
    const distractors = allEmojis.filter(e => e !== this.targetEmoji);
    for (let i = 0; i < itemCount - targetCount; i++) {
      addItem(distractors[Math.floor(Math.random() * distractors.length)]);
    }
    this.items.sort(() => Math.random() - 0.5);
  }

  onDraw() {
    const ctx = this.ctx;
    // 目标提示
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath(); ctx.roundRect(this.width / 2 - 130, 10, 260, 70, 20); ctx.fill();
    ctx.fillStyle = '#FFE66D'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('请找到所有的', this.width / 2, 40);
    ctx.font = '38px serif'; ctx.fillText(this.targetEmoji, this.width / 2, 72);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '14px sans-serif';
    ctx.fillText(`剩余: ${this.level + 2 - this.foundCount} | 第${this.level}关`, this.width / 2, 95);

    ctx.textBaseline = 'middle';
    for (const item of this.items) {
      ctx.font = `${item.size}px serif`;
      ctx.fillText(item.emoji, item.x, item.y);
    }
  }

  onStop() {}
}
