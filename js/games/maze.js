/**
 * 走迷宫游戏 - 用手指引导小动物走出迷宫
 * 训练精细动作和路径规划
 */
class MazeGame extends BaseGame {
  constructor() {
    super({ id: 'maze', name: '走迷宫', icon: '🌀', description: '引导小动物走出迷宫', duration: 60 });
  }

  onStart() {
    this.dot = { x: 40, y: 40, radius: 14 };
    this.goal = { x: this.width - 40, y: this.height - 80, radius: 30 };
    this.trail = [];
    this.walls = [];
    this.level = 1;
    this.touching = false;
    this._generateMaze();

    this.bindTouch('touchstart', (e) => {
      const pos = this.getTouchPos(e);
      if (Math.hypot(pos.x - this.dot.x, pos.y - this.dot.y) < 40) {
        this.touching = true;
      }
    });
    this.bindTouch('touchmove', (e) => {
      if (!this.touching) return;
      const pos = this.getTouchPos(e);
      // 检查碰墙
      let canMove = true;
      for (const w of this.walls) {
        if (pos.x > w.x - 5 && pos.x < w.x + w.w + 5 &&
            pos.y > w.y - 5 && pos.y < w.y + w.h + 5) {
          canMove = false;
          break;
        }
      }
      if (canMove && pos.x > 5 && pos.x < this.width - 5 && pos.y > 5 && pos.y < this.height - 5) {
        this.dot.x = pos.x;
        this.dot.y = pos.y;
        this.trail.push({ x: pos.x, y: pos.y });
        if (this.trail.length > 50) this.trail.shift();
      }

      // 到达目标
      if (Math.hypot(this.dot.x - this.goal.x, this.dot.y - this.goal.y) < this.goal.radius) {
        this.addScore(this.level * 5);
        this.level++;
        this._generateMaze();
      }
    });
    this.bindTouch('touchend', () => { this.touching = false; });
  }

  _generateMaze() {
    this.dot.x = 40; this.dot.y = 40;
    this.goal.x = this.width - 40;
    this.goal.y = this.height - 80;
    this.trail = [];
    this.walls = [];

    const numWalls = 10 + this.level * 2;
    const wallW = 20 + Math.random() * 20;
    for (let i = 0; i < numWalls; i++) {
      const horiz = Math.random() < 0.5;
      this.walls.push({
        x: 30 + Math.random() * (this.width - 150),
        y: 30 + Math.random() * (this.height - 150),
        w: horiz ? 80 + Math.random() * 100 : wallW,
        h: horiz ? wallW : 80 + Math.random() * 100,
      });
    }
    // 保证起点和终点不被遮挡
    this.walls = this.walls.filter(w =>
      !(w.x < 80 && w.y < 80) &&
      !(w.x + w.w > this.width - 80 && w.y + w.h > this.height - 120)
    );
  }

  onDraw() {
    const ctx = this.ctx;

    // 墙壁
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    for (const w of this.walls) {
      ctx.beginPath(); ctx.roundRect(w.x, w.y, w.w, w.h, 8); ctx.fill();
    }

    // 轨迹
    if (this.trail.length > 1) {
      ctx.strokeStyle = 'rgba(78,205,196,0.4)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.stroke();
    }

    // 终点
    const pulse = Math.sin(this.frameCount * 0.05) * 5;
    ctx.fillStyle = 'rgba(78,205,196,0.3)';
    ctx.beginPath(); ctx.arc(this.goal.x, this.goal.y, this.goal.radius + pulse, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4ECDC4';
    ctx.beginPath(); ctx.arc(this.goal.x, this.goal.y, this.goal.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '28px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🏠', this.goal.x, this.goal.y);

    // 小动物
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath(); ctx.arc(this.dot.x, this.dot.y, this.dot.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(this.dot.x - 3, this.dot.y - 3, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(this.dot.x + 3, this.dot.y - 3, 3, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '14px sans-serif';
    ctx.fillText(`第${this.level}关 | 拖动小动物回家`, this.width / 2, 20);
  }

  onStop() {}
}
