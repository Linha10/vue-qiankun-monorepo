export default {
  extends: ['@commitlint/config-conventional'],
  helpUrl: '格式：feat: 描述 / fix: 描述 / chore: 描述（冒號後需空格）',
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修復 bug
        'docs', // 文件更新
        'style', // 樣式調整（不影響邏輯）
        'refactor', // 重構
        'perf', // 效能優化
        'test', // 測試相關
        'chore', // 雜務（依賴更新、設定調整）
        'revert', // 回滾
      ],
    ],
    'subject-min-length': [2, 'always', 5],
  },
}
