# 百家樂牌權重計算器 (Baccarat Card-Weight Calculator)

純數值計算工具（Web Tool）。
不連接博弈平台、不自動下注、不做爬蟲。

## 功能

- 手動輸入本局 4～6 張牌（閒 2～3 張 + 莊 2～3 張）
- 依標準發牌順序逐步輸入（閒1→莊1→閒2→莊2→補牌）
- 內建標準百家樂補牌規則檢查（例牌/第三張補牌規則）
- 每局先計算 `RoundScore`（該局所有已開牌的權重總分）
- 使用最近 6 局滾動加總 `Sum6` 推估下一局：
  - `Sum6 >= 0` -> 下一局建議：`莊`
  - `Sum6 < 0` -> 下一局建議：`閒`
  - 未滿 6 局時僅記錄分數，不輸出預測
- 權重可編輯，且可重設預設值
- 可儲存/套用/刪除本機權重 Presets（命名模板）
- 最近 100 筆歷史紀錄
- 一鍵複製本局結果
- 下一局 Monte Carlo 模擬（可調牌靴副數與模擬次數）
- 雲端設定（Upstash Redis）：儲存/載入權重與模擬參數

## 預設權重

- `0(10/J/Q/K)=+4`
- `A=+9`
- `2=+11`
- `3=+14`
- `4=+24`
- `5=-17`
- `6=-23`
- `7=-17`
- `8=-11`
- `9=-5`

## 本機執行

1. 安裝依賴

```bash
pnpm install
```

2. 啟動開發環境

```bash
pnpm run dev
```

3. 瀏覽器開啟

`http://localhost:3000`

## 雲端設定（可選）

在專案根目錄建立 `.env.local`：

```env
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
# 可選：自訂儲存 key
BACCARAT_SETTINGS_KEY=baccarat:settings:default
```

說明：

- API 路由：`/api/settings`
- `GET`：讀取雲端設定
- `POST`：儲存雲端設定

## 交付內容

- 原始碼（本專案）
- 可直接使用的網頁版本（本機執行：`npm run dev`）
- 使用說明文件（本 README）
