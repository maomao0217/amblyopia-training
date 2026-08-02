/**
 * E字游戏 - 视力E字表训练
 * 显示不同方向和大小的E，宝宝指出E的开口方向
 */
class EChartGame extends BaseGame {
  constructor() {
    super({ id: 'echart', name: 'E字游戏', icon: '👁️', description: '指出E的开口方向', duration: 60 });
  }

  onStart() {
    this.currentE = null;
    this.level = 1;
    this.correctCount = 0;
    this.showFeedback = false;
    this.feedbackCorrect = false;
    this._generateE();

    this.bindTouch('touchstart', (e) => {
      if (this.showFeedback) return;
      const pos = this.getTouchPos(e);
      this._checkAnswer(pos.x, pos.y);
    });
    this.bindInput('mousedown', (e) => {
      if (this.showFeedback) return;
      const pos = this.getTouchPos(e);
      this._checkAnswer(pos.x, pos.y);
    });
  }

  _generateE() {
    const minSize = Math.max(30, 100 - this.level * 8);
    const maxSize = Math.max(50, 150 - this.level * 10);
    const size = minSize + Math.random() * (maxSize - minSize);
    const rotations = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
    const rotation = rotations[Math.floor(Math.random() * 4)];
    const margin = size;
    this.currentE = {
      size, rotation,
      x: margin + Math.random() * (this.width - 2 * margin),
      y: 120 + Math.random() * (this.height - 140 - margin),
    };
  }

  _rotationToDir(rotation) {
    if (Math.abs(rotation) < 0.1) return 'right';
    if (Math.abs(rotation - Math.PI / 2) < 0.1) return 'down';
    if (Math.abs(Math.abs(rotation) - Math.PI) < 0.1) return 'left';
    return 'up';
  }

  _angleToDir(angle) {
    if (angle > -Math.PI / 4 && angle <= Math.PI / 4) return 'right';
    if (angle > Math.PI / 4 && angle <= 3 * Math.PI / 4) return 'down';
    if (angle > -3 * Math.PI / 4 && angle <= -Math.PI / 4) return 'up';
    return 'left';
  }

  _checkAnswer(tx, ty) {
    const cx = this.currentE.x;
    const cy = this.currentE.y;
    const angle = Math.atan2(ty - cy, tx - cx);
    const dir = this._angleToDir(angle);
    const correctDir = this._rotationToDir(this.currentE.rotation);

    if (dir === correctDir) {
      this.correctCount++;
      this.showFeedback = true;
      this.feedbackCorrect = true;
      this.addScore(this.level * 2);
      this.level = Math.min(8, Math.floor(this.correctCount / 3) + 1);
    } else {
      this.showFeedback = true;
      this.feedbackCorrect = false;
      if (this.level > 1 && this.correctCount % 3 === 0) this.level = Math.max(1, this.level - 1);
    }
    setTimeout(() => { this.showFeedback = false; this._generateE(); }, 600);
  }

  _drawE(ctx, x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    const sw = size / 5;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = sw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-size / 2, -size / 2); ctx.lineTo(-size / 2, size / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-size / 2, -size / 2); ctx.lineTo(size / 2, -size / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-size / 2, 0); ctx.lineTo(size / 2 * 0.6, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-size / 2, size / 2); ctx.lineTo(size / 2, size / 2); ctx.stroke();
    ctx.restore();
  }

  onDraw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('E的开口朝哪个方向？', this.width / 2, 30);
    ctx.fillText('点击E字的开口方向', this.width / 2, 52);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '14px sans-serif';
    ctx.fillText(`难度: ${this.level}/8 | 正确: ${this.correctCount}`, this.width / 2, 72);

    if (!this.showFeedback && this.currentE) {
      const cx = this.currentE.x, cy = this.currentE.y;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      const indicators = [
        { x: cx + 100, y: cy, t: '右→' },
        { x: cx, y: cy + 100, t: '↓下' },
        { x: cx - 100, y: cy, t: '←左' },
        { x: cx, y: cy - 100, t: '↑上' },
      ];
      for (const ind of indicators) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath(); ctx.arc(ind.x, ind.y, 28, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = 'bold 14px sans-serif';
        ctx.fillText(ind.t, ind.x, ind.y + 4);
      }
    }

    if (this.currentE) {
      if (this.showFeedback) {
        ctx.fillStyle = this.feedbackCorrect ? 'rgba(78,205,196,0.2)' : 'rgba(255,107,107,0.2)';
        ctx.beginPath(); ctx.arc(this.currentE.x, this.currentE.y, this.currentE.size * 0.8, 0, Math.PI * 2); ctx.fill();
      }
      this._drawE(ctx, this.currentE.x, this.currentE.y, this.currentE.size, this.currentE.rotation);
    }

    if (this.showFeedback) {
      ctx.fillStyle = this.feedbackCorrect ? '#4ECDC4' : '#FF6B6B';
      ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(this.feedbackCorrect ? '✓ 对了!' : '✗ 再试试', this.width / 2, this.height - 20);
    }
  }

  onStop() {}
}
