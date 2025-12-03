# Profile Card - エンジニア向けイベント用プロフィールサイト

テックイベントで素早くプロフィールを紹介できる、3Dインタラクティブなプロフィールカードサイトです。

## 特徴

- 📱 **スマホ最適化** - モバイル画面にピッタリフィット
- 🎴 **3Dカード** - ジャイロセンサーで傾きに連動する立体的なカード
- 🔄 **カードフリップ** - SNSアイコンタップでカードが回転、QRコード表示
- 📊 **QRコード生成** - クライアントサイドで各SNSリンクのQRコード生成
- 💾 **柔軟なストレージ** - localStorage → Firebase等への移行が容易な設計
- 👥 **マルチユーザー対応** - 複数ユーザーが各自のプロフィールを登録可能

## 技術スタック

- Next.js (Pages Router)
- React
- CSS (素のCSS)
- QRコード生成ライブラリ（qrcode.react）
- ジャイロセンサー API

## セットアップ

```bash
# プロジェクト作成
npx create-next-app@latest profile-card --use-npm
cd profile-card

# 依存関係インストール
npm install qrcode.react

# 開発サーバー起動
npm run dev
```

## プロジェクト構造

```
profile-card/
├── pages/
│   ├── index.js          # ホーム/プロフィール一覧
│   ├── edit.js           # プロフィール編集
│   └── profile/[id].js   # プロフィール表示（3Dカード）
├── components/
│   ├── ProfileCard.js    # 3Dカードコンポーネント
│   └── QRCodeDisplay.js  # QRコード表示コンポーネント
├── lib/
│   └── storage.js        # ストレージ抽象化層
├── styles/
│   └── globals.css
└── public/
```

## 使い方

1. `/edit` でプロフィール情報を入力
   - 名前
   - プロフィール画像URL
   - SNSリンク（X, GitHub, Zenn等）

2. `/profile/[id]` でプロフィールカードを表示
   - スマホを傾けるとカードが3D的に動く
   - SNSアイコンをタップするとカードが回転してQRコード表示

## ストレージ移行

現在は localStorage を使用していますが、`lib/storage.js` を変更するだけで Firebase や他のバックエンドに移行できます。

```javascript
// lib/storage.js の実装を変更するだけ
export const storage = {
  saveProfile: async (profile) => {
    // localStorage → Firebase に変更
  },
  // ...
}
```

## 今後の拡張予定

- [ ] Firebase/Supabase 対応
- [ ] カスタムテーマ
- [ ] 名刺交換機能
- [ ] アクセス解析

## ライセンス

MIT