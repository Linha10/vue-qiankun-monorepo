# 文件導覽

這個資料夾是整個 monorepo 的說明文件，依用途分成三份：

| 文件                                                         | 用途                                                                                                                       | 什麼時候看                                     |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [01-overview.md](./01-overview.md)                           | 專案總覽：資料夾結構、目前正式在跑的 host/子應用是哪一組、共用套件（`packages/*`）各自負責什麼、qiankun 掛載機制怎麼串起來 | 剛加入這個專案、或忘記整體架構時               |
| [02-onboarding-new-app.md](./02-onboarding-new-app.md)       | 如何從零建立一個「全新專案」，把它接成 qiankun 子應用                                                                      | 要開一個全新的功能模組（例如新的後台子系統）時 |
| [03-onboarding-legacy-app.md](./03-onboarding-legacy-app.md) | 如何把一個「既有 / 舊專案」搬進這個 monorepo，改造成 qiankun 子應用                                                        | 要把公司既有的舊系統整併進來時                 |
| [04-portfolio-progress.md](./04-portfolio-progress.md)       | `renhospes-admin` + `system-settings` 改造成履歷／面試作品的進度紀錄：已完成項目、尚未執行項目（CI/CD、docs、樣式精修）    | 要接續進行部署、文件、樣式相關工作時           |

> 根目錄的 [README.md](../README.md) 是最初 skeleton 專案的說明（`main-app` + `sub-app-example`），現況已經有另一組「正式在用」的 host/子應用（`renhospes-admin` + `system-settings`），這點在 [01-overview.md](./01-overview.md) 有特別說明，避免搞混。
