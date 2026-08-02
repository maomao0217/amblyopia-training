/**
 * 连连看游戏 - 翻开两张卡片找到匹配的一对
 * 训练记忆力和视觉辨别
 */
class MemoryGame extends BaseGame {
  constructor() {
    super({ id: 'memory', name: '连连看', icon: '🃏', description: '翻开卡片找到一样的', duration: 60 });
  }

  onStart() {
    this.cards = [];
    this.flipped = [];
    this.matched = new Set();
    this.checking = false;
    this.cols = 4;
    this.rows = 3;

    const emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒'];
    const pairs = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    const cardW = 65, cardH = 80;
    const marginX = (this.width - this.cols * (cardW + 8)) / 2;
    const marginY = (this.height - this.rows * (cardH + 8)) / 2 + 20;

    for (let i = 0; i < this.rows * this.cols; i++) {
      const col = i % this.cols;
      const row = Math.floor(i / this.cols);
      this.cards.push({
        x: marginX + col * (cardW + 8),
        y: marginY + row * (cardH + 8),
        w: cardW, h: cardH,
        emoji: pairs[i],
        flipped: false,
        matched: false,
      });
    }

    this.bindTouch('touchstart', (e) => {
      if (this.checking) return;
      const pos = this.getTouchPos(e);
      for (let i = 0; i < this.cards.length; i++) {
        const c = this.cards[i];
        if (c.matched || c.flipped) continue;
        if (pos.x >= c.x && pos.x <= c.x + c.w && pos.y >= c.y && pos.y <= c.y + c.h) {
          c.flipped = true;
          this.flipped.push(i);
          if (this.flipped.length === 2) {
            this.checking = true;
            const [a, b] = this.flipped;
            if (this.cards[a].emoji === this.cards[b].emoji) {
              this.cards[a].matched = true;
              this.cards[b].matched = true;
              this.addScore(2);
              this.flipped = [];
              this.checking = false;
              if (this.matched.size + 2 >= this.cards.length) {
                this.addScore(5);
                setTimeout(() => this._resetBoard(), 600);
              }
            } else {
              setTimeout(() => {
                this.cards[a].flipped = false;
                this.cards[b].flipped = false;
                this.flipped = [];
                this.checking = false;
              }, 600);
            }
          }
          return;
        }
      }
    });
    this.bindInput('mousedown', (e) => {
      if (this.checking) return;
      const pos = this.getTouchPos(e);
      for (let i = 0; i < this.cards.length; i++) {
        const c = this.cards[i];
        if (c.matched || c.flipped) continue;
        if (pos.x >= c.x && pos.x <= c.x + c.w && pos.y >= c.y && pos.y <= c.y + c.h) {
          c.flipped = true;
          this.flipped.push(i);
          if (this.flipped.length === 2) {
            this.checking = true;
            const [a, b] = this.flipped;
            if (this.cards[a].emoji === this.cards[b].emoji) {
              this.cards[a].matched = true;
              this.cards[b].matched = true;
              this.addScore(2);
              this.flipped = [];
              this.checking = false;
              const matchedCount = this.cards.filter(c => c.matched).length;
              if (matchedCount >= this.cards.length) {
                this.addScore(5);
                setTimeout(() => this._resetBoard(), 600);
              }
            } else {
              setTimeout(() => {
                this.cards[a].flipped = false;
                this.cards[b].flipped = false;
                this.flipped = [];
                this.checking = false;
              }, 600);
            }
          }
          return;
        }
      }
    });
  }

  _resetBoard() {
    const emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🍑', '🥝'];
    const numPairs = Math.min(6, 4 + Math.floor(this.score / 10));
    const selected = emojis.slice(0, numPairs);
    const pairs = [...selected, ...selected].sort(() => Math.random() - 0.5);
    this.cols = numPairs > 4 ? 4 : 3;
    this.rows = Math.ceil(pairs.length / this.cols);
    const cardW = this.cols > 3 ? 65 : 75;
    const cardH = 80;
    const marginX = (this.width - this.cols * (cardW + 8)) / 2;
    const marginY = (this.height - this.rows * (cardH + 8)) / 2 + 20;

    this.cards = [];
    for (let i = 0; i < pairs.length; i++) {
      const col = i % this.cols;
      const row = Math.floor(i / this.cols);
      this.cards.push({
        x: marginX + col * (cardW + 8), y: marginY + row * (cardH + 8),
        w: cardW, h: cardH, emoji: pairs[i], flipped: false, matched: false,
      });
    }
    this.flipped = [];
    this.checking = false;
  }

  onDraw() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('找到一样的图案配对', this.width / 2, 30);

    for (const c of this.cards) {
      if (c.matched) {
        ctx.fillStyle = 'rgba(78,205,196,0.3)';
        ctx.beginPath(); ctx.roundRect(c.x, c.y, c.w, c.h, 10); ctx.fill();
        ctx.font = '30px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(c.emoji, c.x + c.w / 2, c.y + c.h / 2);
      } else if (c.flipped) {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.roundRect(c.x, c.y, c.w, c.h, 10); ctx.fill();
        ctx.font = '30px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(c.emoji, c.x + c.w / 2, c.y + c.h / 2);
      } else {
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath(); ctx.roundRect(c.x, c.y, c.w, c.h, 10); ctx.fill();
        ctx.fillStyle = '#FF9999';
        ctx.font = '24px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('?', c.x + c.w / 2, c.y + c.h / 2);
      }
    }
  }

  onStop() {}
}
