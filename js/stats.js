/**
 * 训练数据统计模块
 * - 使用 localStorage 存储训练记录
 * - 支持按游戏、日期查询
 * - 提供汇总统计和图表数据
 */
const StatsManager = {
  STORAGE_KEY: 'amblyopia_training_stats',

  _load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  _save(records) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch {
      // storage full, remove oldest
      const all = this._load();
      all.shift();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    }
  },

  /**
   * 记录一次训练
   * @param {string} gameId - 游戏ID
   * @param {string} gameName - 游戏名称
   * @param {number} score - 得分
   * @param {number} duration - 时长（秒）
   */
  record(gameId, gameName, score, duration) {
    const record = {
      id: Date.now(),
      gameId,
      gameName,
      score,
      duration,
      date: new Date().toISOString(),
    };
    const all = this._load();
    all.push(record);
    // 只保留最近1000条
    if (all.length > 1000) {
      all.splice(0, all.length - 1000);
    }
    this._save(all);
    return record;
  },

  /** 获取所有记录 */
  getAll() {
    return this._load();
  },

  /** 获取今天记录 */
  getToday() {
    const today = new Date().toISOString().slice(0, 10);
    return this._load().filter(r => r.date.slice(0, 10) === today);
  },

  /** 获取最近N天记录 */
  getRecentDays(days = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return this._load().filter(r => new Date(r.date) >= cutoff);
  },

  /** 获取汇总统计 */
  getSummary() {
    const all = this._load();
    const today = this.getToday();

    const totalDuration = all.reduce((s, r) => s + (r.duration || 0), 0);
    const todayDuration = today.reduce((s, r) => s + (r.duration || 0), 0);
    const totalGames = all.length;

    // 每个游戏的最高分
    const bestScores = {};
    all.forEach(r => {
      if (!bestScores[r.gameId] || r.score > bestScores[r.gameId]) {
        bestScores[r.gameId] = r.score;
      }
    });

    return {
      totalDuration,
      todayDuration,
      totalGames,
      todayGames: today.length,
      bestScores,
      streak: this._calcStreak(all),
    };
  },

  /** 计算连续训练天数 */
  _calcStreak(records) {
    if (records.length === 0) return 0;
    const dates = new Set(records.map(r => r.date.slice(0, 10)));
    let streak = 0;
    const d = new Date();
    while (dates.has(d.toISOString().slice(0, 10))) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    // 检查今天是否有记录
    const today = new Date().toISOString().slice(0, 10);
    if (!dates.has(today) && streak === 0) {
      // 检查昨天
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (dates.has(yesterday)) {
        let s = 0;
        const d2 = new Date(Date.now() - 86400000);
        while (dates.has(d2.toISOString().slice(0, 10))) {
          s++;
          d2.setDate(d2.getDate() - 1);
        }
        return s;
      }
    }
    return streak;
  },

  /** 每日训练时长（最近N天） */
  getDailyDuration(days = 7) {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayRecords = this._load().filter(r => r.date.slice(0, 10) === dateStr);
      const total = dayRecords.reduce((s, r) => s + (r.duration || 0), 0);
      result.push({
        date: dateStr.slice(5), // MM-DD
        minutes: Math.round(total / 60 * 10) / 10,
      });
    }
    return result;
  },

  /** 清除所有记录 */
  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  },
};
