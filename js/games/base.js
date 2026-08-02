/**
 * 游戏基类 - 所有游戏继承此类
 * 提供通用功能：画布管理、得分、计时、动态背景、触屏支持
 */
class BaseGame {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description || '';
    this.icon = config.icon || '🎮';
    this.duration = config.duration || 60;
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
    this.frameCount = 0;

    // 动态背景
    this.useDynamicBg = config.useDynamicBg !== false;

    // 存储事件处理器用于清理
    this._handlers = [];

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

  /**
   * 安全绑定触摸事件（自动清理）
   * @param {string} event - 事件名
   * @param {function} handler - 处理函数
   * @param {object} options - 选项
   */
  bindTouch(event, handler, options = {}) {
    const wrapped = (e) => {
      if (!this.isRunning) return;
      e.preventDefault();
      handler(e);
    };
    this.canvas.addEventListener(event, wrapped, { passive: false, ...options });
    this._handlers.push({ event, handler: wrapped });
    return wrapped;
  }

  /** 安全绑定鼠标事件（同时支持触摸） */
  bindInput(event, handler) {
    return this.bindTouch(event, handler);
  }

  /** 清理所有事件 */
  _cleanupEvents() {
    if (!this.canvas) return;
    for (const { event, handler } of this._handlers) {
      this.canvas.removeEventListener(event, handler);
    }
    this._handlers = [];
  }

  /** 开始游戏 */
  start() {
    this.initCanvas();
    this.score = 0;
    this.timeLeft = this.duration;
    this.isRunning = true;
    this.isEnded = false;
    this.startTime = Date.now();
    this.frameCount = 0;
    this._handlers = [];

    GameBackground.reset();
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
    this._cleanupEvents();
    this.onStop();
  }

  /** 结束游戏 */
  endGame() {
    if (this.isEnded) return;
    this.isEnded = true;
    this.isRunning = false;
    if (this.timer) clearInterval(this.timer);
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this._cleanupEvents();

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

  /**
   * 获取触摸坐标（相对于画布）
   * @param {TouchEvent|MouseEvent} e
   * @returns {{x: number, y: number}}
   */
  getTouchPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (this.width / rect.width),
      y: (clientY - rect.top) * (this.height / rect.height),
    };
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
    this.frameCount++;
    this.onUpdate();
    this._drawBackground();
    this.onDraw();
    this.animFrame = requestAnimationFrame(() => this._gameLoop());
  }

  /** 绘制动态背景 */
  _drawBackground() {
    if (this.useDynamicBg) {
      GameBackground.draw(this.ctx, this.width, this.height, this.frameCount);
    } else {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
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
  onDraw() {}
}
