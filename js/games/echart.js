/**
 * E字游戏 - 视力E字表训练
 * 显示不同方向和大小的E，宝宝指出E的开口方向
 * 经典弱视训练方法
 */
class EChartGame extends BaseGame {
  constructor() {
    super({
      id: 'echart',
      name: 'E字游戏',
      icon: '👁️',
      description: '指出E的开口方向',
      duration: 60,
    });
  }

  onStart() {
    this.currentE = null; // { size, rotation, x, y }
    this.level = 1;
    this.correctCount = 0;
    this.totalCount = 0;
    this.showFeedback = false;
    this.feedbackTimer = 0;
    this.feedbackCorrect = false;
    this._generateE();

    this._onTap = (e) => {
      e.preventDefault();
      if (!this.isRunning || this.showFeedback) return;
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const tx = (clientX - rect.left) * (this.width / rect.width);
      const ty = (clientY - rect.top) * (this.height / rect.height);

      // E方向：0=右, PI/2=下, PI=左, 3PI/2=上
      const angles = {
        right: 0,
        down: Math.PI / 2,
        left: Math.PI,
        up: -Math.PI / 2,
      };

      // 判断点击在哪个方向区域
      const cx = this.currentE.x;
      const cy = this.currentE.y;
      const angle = Math.atan2(ty - cy, tx - cx);
      const dir = this._angleToDir(angle);
      const correctDir = this._rotationToDir(this.currentE.rotation);

      this.totalCount++;
      if (dir === correctDir) {
        this.correctCount++;
        this.showFeedback = true;
        this.feedbackCorrect = true;
        this.feedbackTimer = 30;
        this.addScore(this.level * 2);
        this.level = Math.min(8, Math.floor(this.correctCount / 3) + 1);
      } else {
        this.showFeedback = true;
        this.feedbackCorrect = false;
        this.feedbackTimer = 20;
        if (this.level > 1 && this.correctCount % 3 === 0) {
          this.level = Math.max(1, this.level - 1);
        }
      }
      setTimeout(() => {
        this.showFeedback = false;
        this._generateE();
      }, 600);
    };

    this.canvas.addEventListener('touchstart', this._onTap, { passive: false });
    this.canvas.addEventListener('mousedown', this._onTap);
  }

  _generateE() {
    const minSize = Math.max(30, 100 - this.level * 8);
    const maxSize = Math.max(50, 150 - this.level * 10);
    const size = minSize + Math.random() * (maxSize - minSize);

    const rotations = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
    const rotation = rotations[Math.floor(Math.random() * 4)];

    const margin = size;
    this.currentE = {
      size,
      rotation,
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

  _drawE(ctx, x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    const strokeW = size / 5;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = strokeW;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // E 的竖线
    ctx.beginPath();
    ctx.moveTo(-size / 2, -size / 2);
    ctx.lineTo(-size / 2, size / 2);
    ctx.stroke();

    // 三条横线
    ctx.beginPath();
    ctx.moveTo(-size / 2, -size / 2);
    ctx.lineTo(size / 2, -size / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-size / 2, 0);
    ctx.lineTo(size / 2 * 0.6, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-size / 2, size / 2);
    ctx.lineTo(size / 2, size / 2);
    ctx.stroke();

    ctx.restore();
  }

  onDraw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 提示
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('E的开口朝哪个方向？', this.width / 2, 35);
    ctx.fillText('点击对应的方向', this.width / 2, 58);

    // 关卡
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px sans-serif';
    ctx.fillText(`难度: ${this.level}/8 | 正确: ${this.correctCount}`, this.width / 2, 80);

    // 答案区域指示
    if (!this.showFeedback) {
      const cx = this.currentE.x;
      const cy = this.currentE.y;

      // 四个方向指示
      const indicators = [
        { x: cx + 120, y: cy, label: '右→', dir: 'right' },
        { x: cx, y: cy + 120, label: '↓下', dir: 'down' },
        { x: cx - 120, y: cy, label: '←左', dir: 'left' },
        { x: cx, y: cy - 120, label: '↑上', dir: 'up' },
      ];

      // 高亮正确答案方向（给提示）- 仅对低难度
      if (this.level <= 2) {
        const correctDir = this._rotationToDir(this.currentE.rotation);
        const ind = indicators.find(i => i.dir === correctDir);
        if (ind) {
          ctx.fillStyle = 'rgba(78, 205, 196, 0.5)';
          ctx.beginPath();
          ctx.arc(ind.x, ind.y, 25, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // E字
    if (this.currentE) {
      if (this.showFeedback) {
        ctx.fillStyle = this.feedbackCorrect
          ? 'rgba(78, 205, 196, 0.2)'
          : 'rgba(255, 107, 107, 0.2)';
        ctx.beginPath();
        ctx.arc(this.currentE.x, this.currentE.y, this.currentE.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      this._drawE(ctx, this.currentE.x, this.currentE.y, this.currentE.size, this.currentE.rotation);
    }

    // 反馈
    if (this.showFeedback) {
      ctx.fillStyle = this.feedbackCorrect ? '#4ECDC4' : '#FF6B6B';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        this.feedbackCorrect ? '✓ 对了!' : '✗ 再试试',
        this.width / 2,
        this.height - 30
      );
    }
  }

  onStop() {
    this.canvas.removeEventListener('touchstart', this._onTap);
    this.canvas.removeEventListener('mousedown', this._onTap);
  }
}
