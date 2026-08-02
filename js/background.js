/**
 * 弱视训练背景系统
 * - 双层背景：全局条纹层 + 游戏内动态背景
 * - 游戏内背景周期性切换：条纹、纯色、棋盘格等
 * - 高对比度刺激视觉皮层
 */
class StripeBackground {
  constructor() {
    this.canvas = document.getElementById('stripe-bg');
    this.ctx = this.canvas.getContext('2d');
    this.offset = 0;
    this.speed = 0.8;
    this.stripeWidth = 30;
    this.contrast = 0.35;
    this.direction = 'vertical';
    this.color1 = '#000000';
    this.color2 = '#ffffff';
    this.running = true;
    this.timer = null;
    this.cycleColors = false;
    this.colorPhase = 0;
    this.frameCount = 0;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  start() {
    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.timer) {
      cancelAnimationFrame(this.timer);
      this.timer = null;
    }
  }

  setIntensity(level) {
    this.speed = 0.3 + level * 0.3;
    this.contrast = 0.15 + level * 0.08;
    this.stripeWidth = 40 - level * 4;
  }

  loop() {
    if (!this.running) return;
    this.frameCount++;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const sw = this.stripeWidth;

    // 周期性切换条纹颜色
    if (this.cycleColors && this.frameCount % 300 === 0) {
      this.colorPhase = (this.colorPhase + 1) % 3;
      switch (this.colorPhase) {
        case 0: this.color1 = '#000000'; this.color2 = '#ffffff'; break;
        case 1: this.color1 = '#FF0000'; this.color2 = '#000000'; break;
        case 2: this.color1 = '#0000FF'; this.color2 = '#FFFF00'; break;
      }
    }

    // 每3秒切换条纹方向
    if (this.frameCount % 180 === 0) {
      this.direction = this.direction === 'vertical' ? 'horizontal' : 'vertical';
    }

    ctx.clearRect(0, 0, w, h);

    if (this.direction === 'vertical') {
      this.offset = (this.offset + this.speed) % (sw * 2);
      let x = -this.offset;
      while (x < w) {
        ctx.fillStyle = this.color1;
        ctx.fillRect(x, 0, sw, h);
        x += sw;
        ctx.fillStyle = this.color2;
        ctx.fillRect(x, 0, sw, h);
        x += sw;
      }
    } else {
      this.offset = (this.offset + this.speed) % (sw * 2);
      let y = -this.offset;
      while (y < h) {
        ctx.fillStyle = this.color1;
        ctx.fillRect(0, y, w, sw);
        y += sw;
        ctx.fillStyle = this.color2;
        ctx.fillRect(0, y, w, sw);
        y += sw;
      }
    }

    ctx.fillStyle = `rgba(26, 26, 46, ${1 - this.contrast})`;
    ctx.fillRect(0, 0, w, h);

    this.timer = requestAnimationFrame(() => this.loop());
  }
}

/**
 * 游戏内动态背景
 * 在每个游戏的画布中渲染，周期性切换背景类型
 */
const GameBackground = {
  // 背景类型列表
  types: [
    'stripes_v',      // 黑白竖条纹
    'stripes_h',      // 黑白横条纹
    'solid_red',      // 红色背景
    'solid_green',    // 绿色背景
    'solid_blue',     // 蓝色背景
    'checkerboard',   // 棋盘格
    'stripes_v_red',  // 红黑竖条纹
    'stripes_h_blue', // 蓝白横条纹
    'gradient_warm',  // 暖色渐变
    'dots',           // 点阵
  ],

  // 当前类型索引
  _currentIndex: -1,
  // 切换计时器
  _switchTimer: 0,
  // 切换间隔（帧数，60fps = 约3-5秒）
  _switchInterval: 200,
  // 条纹偏移（用于滚动动画）
  _stripeOffset: 0,
  // 当前背景色
  _currentColor: null,

  /**
   * 获取下一个背景类型
   * 不随机，按顺序循环确保多样性
   */
  next() {
    this._currentIndex = (this._currentIndex + 1) % this.types.length;
    this._stripeOffset = 0;
    return this.types[this._currentIndex];
  },

  /** 重置状态 */
  reset() {
    this._currentIndex = -1;
    this._switchTimer = 0;
    this._stripeOffset = 0;
    this._currentColor = null;
  },

  /**
   * 在游戏画布上绘制动态背景
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width - 画布宽度
   * @param {number} height - 画布高度
   * @param {number} frameCount - 当前帧计数
   */
  draw(ctx, width, height, frameCount) {
    // 检查是否需要切换背景类型
    if (this._switchTimer === 0 || frameCount - this._switchTimer > this._switchInterval) {
      this.next();
      this._switchTimer = frameCount;
      // 随机切换间隔（180-300帧 = 3-5秒）
      this._switchInterval = 180 + Math.floor(Math.random() * 120);
    }

    this._stripeOffset += 1.5;
    const type = this.types[this._currentIndex];
    const offset = this._stripeOffset;

    switch (type) {
      case 'stripes_v':
        this._drawStripes(ctx, width, height, offset, 'v', '#000000', '#ffffff');
        break;
      case 'stripes_h':
        this._drawStripes(ctx, width, height, offset, 'h', '#000000', '#ffffff');
        break;
      case 'solid_red':
        ctx.fillStyle = '#CC0000';
        ctx.fillRect(0, 0, width, height);
        break;
      case 'solid_green':
        ctx.fillStyle = '#009933';
        ctx.fillRect(0, 0, width, height);
        break;
      case 'solid_blue':
        ctx.fillStyle = '#0033CC';
        ctx.fillRect(0, 0, width, height);
        break;
      case 'checkerboard':
        this._drawCheckerboard(ctx, width, height, offset);
        break;
      case 'stripes_v_red':
        this._drawStripes(ctx, width, height, offset, 'v', '#CC0000', '#000000');
        break;
      case 'stripes_h_blue':
        this._drawStripes(ctx, width, height, offset, 'h', '#0033CC', '#ffffff');
        break;
      case 'gradient_warm':
        this._drawGradient(ctx, width, height, frameCount);
        break;
      case 'dots':
        this._drawDots(ctx, width, height, offset);
        break;
    }
  },

  _drawStripes(ctx, w, h, offset, dir, c1, c2) {
    const sw = 28;
    if (dir === 'v') {
      const off = offset % (sw * 2);
      let x = -off;
      while (x < w) {
        ctx.fillStyle = c1;
        ctx.fillRect(x, 0, sw, h);
        x += sw;
        ctx.fillStyle = c2;
        ctx.fillRect(x, 0, sw, h);
        x += sw;
      }
    } else {
      const off = offset % (sw * 2);
      let y = -off;
      while (y < h) {
        ctx.fillStyle = c1;
        ctx.fillRect(0, y, w, sw);
        y += sw;
        ctx.fillStyle = c2;
        ctx.fillRect(0, y, w, sw);
        y += sw;
      }
    }
  },

  _drawCheckerboard(ctx, w, h, offset) {
    const size = 30;
    const off = offset % (size * 2);
    for (let y = -off; y < h + size; y += size) {
      for (let x = -off; x < w + size; x += size) {
        const cx = Math.floor((x + off) / size);
        const cy = Math.floor((y + off) / size);
        ctx.fillStyle = (cx + cy) % 2 === 0 ? '#000000' : '#ffffff';
        ctx.fillRect(x, y, size, size);
      }
    }
  },

  _drawGradient(ctx, w, h, frameCount) {
    const hue = (frameCount * 0.5) % 360;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, `hsl(${hue}, 80%, 30%)`);
    grad.addColorStop(0.5, `hsl(${(hue + 60) % 360}, 80%, 20%)`);
    grad.addColorStop(1, `hsl(${(hue + 120) % 360}, 80%, 30%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  },

  _drawDots(ctx, w, h, offset) {
    const spacing = 25;
    const off = offset % spacing;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    for (let y = -off; y < h + spacing; y += spacing) {
      for (let x = -off; x < w + spacing; x += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
};

// 全局实例
const stripeBg = new StripeBackground();
stripeBg.start();
