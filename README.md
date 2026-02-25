# 百家樂牌權重計算器 (Baccarat Card-Weight Calculator)

純數值計算工具（Web Tool）。
不連接博弈平台、不自動下注、不做爬蟲。

## 功能

- 手動輸入本局 6 張牌（閒 3 張 + 莊 3 張）
- 依權重換算分數並加總
- 判斷規則：
  - `總分 >= 0` -> 下一局建議：`莊`
  - `總分 < 0` -> 下一局建議：`閒`
- 權重可編輯，且可重設預設值
- 最近 100 筆歷史紀錄
- 一鍵複製本局結果
- 下一局 Monte Carlo 模擬（可調牌靴副數與模擬次數）
- 雲端設定（Upstash Redis）：儲存/載入權重與模擬參數

## 預設權重 (A 方案)

- `0(10/J/Q/K)=+1`
- `A=+4`
- `2=+6`
- `3=+9`
- `4=+19`
- `5=-12`
- `6=-18`
- `7=-12`
- `8=-6`
- `9=-1`

## 本機執行

1. 安裝依賴

```bash
npm install
```

2. 啟動開發環境

```bash
npm run dev
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

