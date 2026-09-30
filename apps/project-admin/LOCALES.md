# 多語言翻譯表管理

## 🌍 翻譯表位置

📊 **Google Sheet**: [Lang-Key 翻譯表](https://docs.google.com/spreadsheets/d/1pB_9wwmf62MgsCTLpY8GmINDW4udplbOexQjYkYUNAU/edit?hl=zh-tw&gid=1207371602#gid=1207371602)
t

---

## 🚀 快速開始

### 1. 編輯翻譯內容

- 在 Google Sheet 中編輯或新增翻譯鍵值
- 格式：`key` | `zh` | `en`
- 範例：`hotel.name` | `飯店名稱` | `Hotel Name`

### 2. 生成 TypeScript 檔案

在 Google Sheet 中：

1. 點選菜單 **「語言轉換」**
2. 選擇 **📝 生成 zh.ts (中文)** 或 **📝 生成 en.ts (英文)**
3. 新視窗開啟，顯示完整的 TypeScript 代碼
4. 點 **📋 複製到剪貼板**

### 3. 更新專案檔案

在專案中：

1. 打開對應的檔案：`src/locales/zh.ts` 或 `src/locales/en.ts`
2. 全選全部代碼
3. 貼上複製的新代碼
4. 保存並提交

---

## 📁 相關檔案

| 檔案                         | 用途                   |
| ---------------------------- | ---------------------- |
| `src/locales/zh.ts`          | 中文翻譯               |
| `src/locales/en.ts`          | 英文翻譯               |
| `src/locales/keys.csv`       | 翻譯鍵索引（CSV 格式） |
| `src/stores/app.ts`          | i18n 狀態管理          |
| `src/composables/useI18n.ts` | i18n 組合式函數        |

---

## 📋 翻譯鍵結構

目前支援的翻譯類別：

| 類別         | 說明     | 範例                                  |
| ------------ | -------- | ------------------------------------- |
| `common.*`   | 通用文本 | `common.create` → '建立'              |
| `auth.*`     | 認證相關 | `auth.login` → '登入'                 |
| `messages.*` | 訊息提示 | `messages.deleteSuccess` → '刪除成功' |
| `dialog.*`   | 對話框   | `dialog.deleteTitle` → '刪除確認'     |
| `hotel.*`    | 飯店模組 | `hotel.name` → '飯店名稱'             |
| `roomType.*` | 房型模組 | `roomType.name` → '房型名稱'          |
| `button.*`   | 按鈕文字 | `button.save` → '保存'                |
| `form.*`     | 表單相關 | `form.required` → '必填'              |

---

## 🔄 參數化翻譯

某些翻譯支援參數插值（使用 `{參數名}` 格式）：

```typescript
// 示例：刪除確認訊息
$t('messages.deleteConfirm', { name: '飯店名稱' })
// 結果：'確定要刪除「飯店名稱」嗎？此操作無法復原。'

// 示例：成功訊息
$t('messages.createSuccess', { type: '飯店' })
// 結果：'飯店建立成功'
```

---

## ✅ 維護檢查清單

新增翻譯鍵值後，請確認：

- [ ] 在 Google Sheet 新增了新的 key-zh-en 三列資料
- [ ] 運行「語言轉換」生成新的 TypeScript 代碼
- [ ] 複製代碼並更新 `src/locales/zh.ts` 和 `src/locales/en.ts`
- [ ] 在組件中使用新的翻譯鍵（`$t('新.鍵')`）
- [ ] 提交 Git commit

---

## 📞 常見問題

### Q: 翻譯鍵有格式限制嗎？

A: 必須使用 `category.key` 的格式（點號分隔），例如 `hotel.name`、`roomType.quantity`

### Q: 如何使用參數化翻譯？

A: 在翻譯文本中使用 `{參數名}` 格式，在代碼中使用 `$t('key', { 參數名: 值 })` 調用

### Q: 如何新增新的語言？

A: 在 Google Sheet 新增新欄位，修改 Apps Script 中的 `generateLocales()` 函數，新增語言選項即可。

---

## 📝 更新紀錄

- **2026-05-04**: 初始設置，支援中文 (zh) 和英文 (en)
