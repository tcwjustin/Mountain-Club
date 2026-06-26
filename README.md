# 想山享山 · 登山社網站 — 上架說明

單一 HTML 檔的網站，附 PWA（可安裝到手機主畫面）。
登入方式：**Google 登入 ＋ Email 白名單**——只有 Email 在名冊裡、且在籍的 Google 帳號才能進。
不開放自行註冊；帳號由 系統管理員 / 社長 / 副社長 在站內「隊員管理」建立。

> 這版**沒有任何範例資料**：沒有假隊員、沒有假出隊紀錄、沒有假行程。
> 百岳清單則預載了真實的山名與海拔（全部標記為未完成），方便你直接拿來收集；不需要的可自行刪除。

## 兩種模式

| 模式 | 何時 | 行為 |
|------|------|------|
| 本機示範模式 | 還沒填 Firebase 設定時 | 按「以示範身分進入」即可瀏覽，資料不保存。可離線預覽。 |
| 雲端版 | 填好 Firebase 設定並部署後 | Google 登入＋白名單、全社共用、即時同步、永久保存。 |

---

## 檔案清單

```
你的資料夾/
├─ index.html                 ← 主程式（原 mountain-club.html）
├─ manifest.webmanifest       ← PWA 設定
├─ sw.js                      ← PWA service worker（離線、可安裝）
├─ icon-192.png / icon-512.png
├─ icon-maskable-192.png / icon-maskable-512.png
├─ icon-180.png / favicon-32.png
├─ firebase.json
├─ firestore.rules
├─ .gitignore
└─ README.md
```
> 把 `mountain-club.html` 改名為 `index.html`；上面所有檔案放在同一層。

---

## 白名單怎麼運作

- 名冊上每個人的「Google 登入 Email」就是白名單。Email 在名冊、且在籍，才登得進來。
- 新成員由管理員／正副社長在「隊員管理 → 新增隊員」建立，填上他的 Gmail。
- 成員用那個 Google 帳號按「使用 Google 登入」即可；不在名單會被擋下並自動登出。
- 退社＝移出白名單（保留歷史）；復籍＝放回。本站不接觸也不儲存任何密碼。

---

## 步驟 1｜放上 GitHub

GitHub 右上 ＋ → New repository → 取名 → Create → 進 repo → Add file → Upload files → 拖入全部檔案 → Commit。

## 步驟 2｜建立 Firebase 專案

console.firebase.google.com → 建立專案 → 取名（例：`xiangshan-club`）。

## 步驟 3｜開啟 Google 登入

Build → Authentication → Get started → Sign-in method → 啟用 **Google**。

## 步驟 4｜建立 Firestore ＋ 套用規則

Build → Firestore Database → Create database（production mode，地區選 `asia-east1`）。
Rules 分頁貼上附檔 `firestore.rules`，按 Publish：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clubs/{clubId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 步驟 5｜把設定貼進 index.html

專案設定 → 你的應用程式 → 點 `</>`（網頁）→ 複製 `firebaseConfig`，填進 `index.html` 最上方，
並把 `ADMIN_EMAIL` 換成你的 Gmail：

```js
const firebaseConfig = {
  apiKey:     "AIza....",
  authDomain: "xiangshan-club.firebaseapp.com",
  projectId:  "xiangshan-club",
  appId:      "1:1234567890:web:abc123"
};
const ADMIN_EMAIL = "你的Gmail@gmail.com";   // 永遠可登入，首次登入自動成為系統管理員
```

## 步驟 6｜上架（二選一）

**A. Firebase Hosting（推薦）**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting     # 現有專案；public 填「.」；單頁 App 選 Yes；不要覆蓋 index.html
firebase deploy --only hosting
```
網址像 `https://xiangshan-club.web.app`。

**B. GitHub Pages**
repo → Settings → Pages → Source 選 `main`、`/ (root)` → Save。網址像 `https://你的帳號.github.io/xiangshan-club/`。

## 步驟 7｜設定授權網域（不做 Google 登入會失敗）

Authentication → Settings → Authorized domains → Add domain，加入你的網站網域
（`xiangshan-club.web.app` 或 `你的帳號.github.io`）。

## 步驟 8｜第一次登入＝系統管理員，建立白名單

1. 打開網站 → 「使用 Google 登入」→ 用步驟 5 的那個 Gmail 登入，自動成為系統管理員。
2. 「隊員」分頁 → 最下方「隊員管理」→「新增隊員」把社員加進來，每人填上 Google 登入 Email。
3. 社員之後用自己的 Google 帳號登入即可。
4. 一開始名冊只有你一人、出隊與行程都是空的——這是乾淨的起點，由你開始建立。

---

## 安裝到手機（PWA）

部署完成、用手機瀏覽器打開網站後：

- **iPhone（Safari）**：分享鈕 → 「加入主畫面」。
- **Android（Chrome）**：右上選單 → 「安裝應用程式 / 加入主畫面」。

之後就會像一般 App 一樣有圖示、全螢幕開啟。
（PWA 需要 HTTPS，所以一定要先照步驟 6 部署到網路上，本機 file:// 不會出現安裝選項。）

---

## 疑難排解

- **Google 登入跳出又關掉 / 失敗** → 多半是步驟 7 授權網域沒加。
- **登入後跳出「不在名單」** → 這個 Google 帳號的 email 不在名冊，或該員已退社。請管理員新增／補 Email／復籍。
- **白畫面** → `firebaseConfig` 填錯，按 F12 看主控台紅字。
- **存不了 / `permission-denied`** → 步驟 4 規則沒發布，或步驟 3 沒開 Google 登入。
- **改了沒更新 / PWA 沒更新** → 重新 deploy 或 commit；手機上把已安裝的 App 關掉重開，或在瀏覽器清快取。

---

## 安全性

- 密碼完全交給 Google，本站不接觸也不儲存密碼。
- 白名單（email 在不在名冊）控制「誰能使用本網站」。
- 誠實提醒：純前端沒有伺服器，規則只能擋「未登入者」，任何已登入的 Google 使用者技術上仍可能讀到資料庫內容（但會被擋在 App 門外）。請勿放敏感個資。
- 要連讀取也鎖死白名單，需進階 Firestore 規則或 Cloud Functions，屬之後的進階題。
