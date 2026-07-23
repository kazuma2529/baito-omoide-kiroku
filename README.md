# バイトの思い出記録 (Part-Time Job Memory Log)

これまで経験したアルバイトを記録し、後から振り返るためのスクラップブック Web アプリです。

## 特徴

- **引き算の美学**: お金（時給・給料・交通費等）の管理項目をあえて排除し、純粋に「いつどんな体験をしてどう感じたか」に集中。
- **直感的な日付選択**: カレンダーをタップして 1 日・連続日・離れた複数日・長期間（勤務中含む）をかんたん入力。
- **4 項目の感覚評価**: おすすめ度、楽しさ、忙しさ、働きやすさを 5 段階で記録。
- **PWA 対応**: ホーム画面に追加してオフラインや全画面アプリとして起動可能。
- **ユーザーデータ分離**: Google ログインによる自分専用の安全なストレージ管理。

---

## 技術構成（Cursor 移行後）

- Vite + React + TypeScript
- Firebase Authentication（Google）+ Cloud Firestore
- Firebase 設定は Google AI Studio 由来の [`firebase-applet-config.json`](firebase-applet-config.json) をそのまま使用（プロジェクト `fine-blade-4cf5x`）
- 設定がない／初期化に失敗した場合は、ブラウザの localStorage によるデモモードで動作

---

## ローカル起動（Cursor）

```bash
npm install
npm run dev
```

開発サーバーは http://localhost:3000 で起動します。

```bash
# 型チェック
npm run lint

# 本番ビルド確認
npm run build
```

`.env` は必須ではありません。`firebase-applet-config.json` があれば Firebase に接続します。

---

## Firebase（既存 AI Studio プロジェクト）

本アプリは次を使います。

- Authentication: Google サインイン
- Cloud Firestore: データベース ID `ai-studio-e006f496-1322-4bdc-b2d2-91a57df15a0b`
- コレクション: `jobRecords`（[`firestore.rules`](firestore.rules) でユーザー分離）

### Google ログインが失敗する場合

[Firebase Console](https://console.firebase.google.com/) → プロジェクト `fine-blade-4cf5x` → Authentication → Settings → **Authorized domains** に次を追加してください。

- `localhost`（ローカル開発）
- 本番公開後は Vercel のドメイン（例: `your-app.vercel.app`）

### Firestore セキュリティルールのデプロイ

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

[`firebase.json`](firebase.json) / [`.firebaserc`](.firebaserc) は、上記の AI Studio 用プロジェクトとカスタム DB を指すように設定済みです。

### 設定を環境変数に切り替える場合（任意）

通常は不要です。JSON ではなく env で上書きしたいときだけ、`.env.local` に次を書きます（[`src/lib/firebase.ts`](src/lib/firebase.ts) が読みます）。

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_ID=ai-studio-e006f496-1322-4bdc-b2d2-91a57df15a0b
```

---

## GitHub / Vercel（自分で行う手順）

このリポジトリ側の準備（`vercel.json` など）は済んでいます。公開作業は次の流れです。

### 1. GitHub

1. 新規リポジトリを作成（**Private 推奨**）
2. このフォルダで `git init` → コミット → remote 追加 → push

### 2. Vercel

1. [Vercel](https://vercel.com/) で GitHub リポジトリを Import
2. Framework は Vite、Build Command `npm run build`、Output `dist`（[`vercel.json`](vercel.json) でも指定）
3. 環境変数の追加は不要（`firebase-applet-config.json` 同梱のため）
4. デプロイ後、Firebase Authentication の承認済みドメインに Vercel の URL を追加

---

## トラブルシュート

| 症状 | 確認すること |
|------|----------------|
| Google ログインできない | 承認済みドメインに `localhost` / Vercel URL があるか |
| データが保存されない | Firestore の DB ID が AI Studio 用か、ルールがデプロイ済みか |
| デモユーザーだけ動く | `firebase-applet-config.json` がプロジェクト直下にあるか、ブラウザ Console の Firebase エラー |
