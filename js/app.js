/**
 * 主应用控制器
 * 管理页面切换、游戏生命周期、统计数据
 */
const App = {
  // 游戏注册表
  games: [],

  // 当前游戏实例
  currentGame: null,

  // DOM元素
  homePage: null,
  gamePage: null,
  statsPage: null,
  gameGrid: null,
  gameCanvas: null,
  gameTitle: null,
  gameScore: null,
  gameOverOverlay: null,
  gameOverScore: null,
  gameOverBest: null,

  init() {
    // 注册所有游戏
    this.games = [
      new BounceGame(),
      new SnakeGame(),
      new RacingGame(),
      new TankGame(),
      new RopeGame(),
      new FruitGame(),
      new SpotDiffGame(),
      new FindItGame(),
      new EChartGame(),
      new VirusGame(),
      new WhackGame(),
      new BubbleGame(),
      new MemoryGame(),
      new BasketGame(),
      new SlashGame(),
      new PuzzleGame(),
      new MazeGame(),
      new ColoringGame(),
    ];

    // 缓存DOM
    this.homePage = document.getElementById('home-page');
    this.gamePage = document.getElementById('game-page');
    this.statsPage = document.getElementById('stats-page');
    this.gameGrid = document.getElementById('game-grid');
    this.gameCanvas = document.getElementById('game-canvas');
    this.gameTitle = document.getElementById('game-title');
    this.gameScore = document.getElementById('game-score');
    this.gameOverOverlay = document.getElementById('game-over-overlay');
    this.gameOverScore = document.getElementById('game-over-score');
    this.gameOverBest = document.getElementById('game-over-best');

    // 渲染游戏卡片
    this.renderGameGrid();

    // 绑定事件
    document.getElementById('btn-stats').addEventListener('click', () => this.showStats());
    document.getElementById('btn-back-stats').addEventListener('click', () => this.showHome());
    document.getElementById('btn-back-game').addEventListener('click', () => this.exitGame());
    document.getElementById('btn-replay').addEventListener('click', () => this.replayGame());
    document.getElementById('btn-home').addEventListener('click', () => this.exitGame());
  },

  /** 渲染游戏选择网格 */
  renderGameGrid() {
    this.gameGrid.innerHTML = '';
    this.games.forEach((game, index) => {
      const card = document.createElement('div');
      card.className = 'game-card';
      card.innerHTML = `
        <div class="game-card-icon">${game.icon}</div>
        <div class="game-card-name">${game.name}</div>
        <div class="game-card-desc">${game.description}</div>
      `;
      card.addEventListener('click', () => this.startGame(index));
      this.gameGrid.appendChild(card);
    });
  },

  /** 开始游戏 */
  startGame(index) {
    const game = this.games[index];
    this.currentGame = game;

    // 切换页面
    this.homePage.classList.remove('active');
    this.gamePage.classList.add('active');

    // 更新UI
    this.gameTitle.textContent = game.name;
    this.gameScore.textContent = '得分: 0';

    // 设置游戏回调
    game.onScoreChange = (score) => {
      this.gameScore.textContent = `得分: ${score}`;
    };
    game.onTimeChange = (time) => {
      // 时间通过得分区域附近的颜色变化提醒
      if (time <= 10) {
        this.gameScore.style.color = '#FF6B6B';
      }
    };
    game.onGameOver = (result) => {
      this.showGameOver(result);
    };

    // 启动游戏
    game.start();
  },

  /** 显示游戏结束界面 */
  showGameOver(result) {
    // 记录训练数据
    StatsManager.record(result.gameId, result.gameName, result.score, result.duration);

    // 获取最高分
    const allRecords = StatsManager.getAll()
      .filter(r => r.gameId === result.gameId);
    const bestScore = allRecords.length > 0
      ? Math.max(...allRecords.map(r => r.score))
      : result.score;

    this.gameOverScore.textContent = `得分: ${result.score}`;
    this.gameOverBest.textContent = `最高分: ${bestScore}`;
    this.gameOverOverlay.classList.add('active');
  },

  /** 重玩游戏 */
  replayGame() {
    this.gameOverOverlay.classList.remove('active');
    this.gameScore.style.color = '#FFE66D';
    if (this.currentGame) {
      this.currentGame.stop();
      this.currentGame.start();
    }
  },

  /** 退出游戏 */
  exitGame() {
    this.gameOverOverlay.classList.remove('active');
    this.gameScore.style.color = '#FFE66D';
    if (this.currentGame) {
      this.currentGame.stop();
      this.currentGame = null;
    }
    this.gamePage.classList.remove('active');
    this.homePage.classList.add('active');
  },

  /** 显示统计页面 */
  showStats() {
    this.homePage.classList.remove('active');
    this.statsPage.classList.add('active');
    this.renderStats();
  },

  /** 显示主页 */
  showHome() {
    this.statsPage.classList.remove('active');
    this.homePage.classList.add('active');
  },

  /** 渲染统计数据 */
  renderStats() {
    const summary = StatsManager.getSummary();
    const dailyData = StatsManager.getDailyDuration(7);
    const allRecords = StatsManager.getAll().reverse().slice(0, 20);

    // 汇总卡片
    document.getElementById('stats-summary').innerHTML = `
      <div class="stat-card">
        <div class="stat-card-value">${Math.round(summary.todayDuration / 60)}</div>
        <div class="stat-card-label">今日训练(分钟)</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">${summary.todayGames}</div>
        <div class="stat-card-label">今日游戏次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">${summary.streak}</div>
        <div class="stat-card-label">连续训练(天)</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">${Math.round(summary.totalDuration / 60)}</div>
        <div class="stat-card-label">累计训练(分钟)</div>
      </div>
    `;

    // 简易图表（柱状图）
    this._renderChart(dailyData);

    // 最近记录
    const listEl = document.getElementById('stats-list');
    if (allRecords.length === 0) {
      listEl.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.4);padding:20px;">还没有训练记录，快去玩游戏吧！</p>';
    } else {
      listEl.innerHTML = allRecords.map(r => {
        const date = new Date(r.date);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        return `
          <div class="stats-item">
            <div>
              <div class="stats-item-game">${r.gameName}</div>
              <div class="stats-item-info">${dateStr} · ${Math.round(r.duration / 60 * 10) / 10}分钟</div>
            </div>
            <div class="stats-item-score">${r.score}分</div>
          </div>
        `;
      }).join('');
    }
  },

  /** 绘制简易统计图 */
  _renderChart(dailyData) {
    const canvas = document.getElementById('stats-chart');
    if (!canvas) return;
    const container = canvas.parentElement;
    canvas.width = container.clientWidth * window.devicePixelRatio;
    canvas.height = 160 * window.devicePixelRatio;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = '160px';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = container.clientWidth;
    const h = 160;
    const padding = { top: 20, right: 16, bottom: 30, left: 40 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    // 背景网格
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
    }

    const maxVal = Math.max(...dailyData.map(d => d.minutes), 1);

    // Y轴标签
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = Math.round(maxVal * (4 - i) / 4);
      const y = padding.top + (chartH / 4) * i;
      ctx.fillText(`${val}min`, padding.left - 6, y + 4);
    }

    // X轴标签
    ctx.textAlign = 'center';
    const barWidth = chartW / dailyData.length - 6;

    dailyData.forEach((d, i) => {
      const x = padding.left + (chartW / dailyData.length) * i + (chartW / dailyData.length) / 2;
      const barH = maxVal > 0 ? (d.minutes / maxVal) * chartH : 0;

      // 柱状图
      const gradient = ctx.createLinearGradient(0, padding.top + chartH - barH, 0, padding.top + chartH);
      gradient.addColorStop(0, '#4ECDC4');
      gradient.addColorStop(1, 'rgba(78, 205, 196, 0.3)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x - barWidth / 2, padding.top + chartH - barH, barWidth, barH, [4, 4, 0, 0]);
      ctx.fill();

      // 日期标签
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '9px sans-serif';
      ctx.fillText(d.date, x, h - 8);

      // 数值
      if (d.minutes > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '9px sans-serif';
        ctx.fillText(d.minutes, x, padding.top + chartH - barH - 6);
      }
    });

    // 坐标轴
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(w - padding.right, padding.top + chartH);
    ctx.stroke();
  },
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => App.init());
