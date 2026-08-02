/**
 * 游戏基类 - 所有游戏继承此类
 * 提供通用功能：画布管理、得分、计时、结束逻辑
 */
class BaseGame {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description || '';
    this.icon = config.icon || '🎮';
    this.duration = config.duration || 60; // 默认60秒
    this.canvasId = config.canvasId || 'game-canvas';

    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.score = 0;
    this.timeLeft = this.duration;
    this.isRunning = false;
    this.isPaused = false;
    this.isEnded = false;
    this.startTime = 0;
    this.timer = null;
    this.animFrame = null;

    // 回调
    this.onScoreChange = null;
    this.onTimeChange = null;
    this.onGameOver = null;
  }

  /** 初始化画布 */
  initCanvas() {
    this.canvas = document.getElementById(this.canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    const container = this.canvas.parentElement;
    const maxW = container.clientWidth;
    const maxH = container.clientHeight;

    // iPad 适配：使用合适比例
    const ratio = Math.min(maxW / 400, maxH / 700, 1.2);
    this.width = Math.floor(400 * ratio);
    this.height = Math.floor(700 * ratio);

    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  /** 开始游戏 */
  start() {
    this.initCanvas();
    this.score = 0;
    this.timeLeft = this.duration;
    this.isRunning = true;
    this.isEnded = false;
    this.startTime = Date.now();
    this._notifyScore();
    this._notifyTime();

    this.onStart();
    this._startTimer();
    this._gameLoop();
  }

  /** 停止游戏 */
  stop() {
    this.isRunning = false;
    if (this.timer) clearInterval(this.timer);
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.onStop();
  }

  /** 结束游戏 */
  endGame() {
    if (this.isEnded) return;
    this.isEnded = true;
    this.isRunning = false;
    if (this.timer) clearInterval(this.timer);
    if (this.animFrame) cancelAnimationFrame(this.animFrame);

    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    this.onEnd();

    if (this.onGameOver) {
      this.onGameOver({
        gameId: this.id,
        gameName: this.name,
        score: this.score,
        duration: elapsed,
      });
    }
  }

  /** 增加分数 */
  addScore(points = 1) {
    this.score += points;
    this._notifyScore();
  }

  // ===== 内部方法 =====

  _startTimer() {
    this.timer = setInterval(() => {
      if (!this.isRunning) return;
      this.timeLeft--;
      this._notifyTime();
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  _gameLoop() {
    if (!this.isRunning) return;
    this.onUpdate();
    this.onDraw();
    this.animFrame = requestAnimationFrame(() => this._gameLoop());
  }

  _notifyScore() {
    if (this.onScoreChange) this.onScoreChange(this.score);
  }

  _notifyTime() {
    if (this.onTimeChange) this.onTimeChange(this.timeLeft);
  }

  // ===== 子类重写 =====
  onStart() {}
  onStop() {}
  onEnd() {}
  onUpdate() {}
  onDraw() {
    // 默认清屏
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
