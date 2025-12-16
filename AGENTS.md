## プロジェクト概要

**プロジェクト名**: HiTouch  
**目的**: エンジニアがテックイベントでプロフィールを素早く紹介できるインタラクティブなWebアプリケーション

## コア機能

1. **プロフィール表示**
   - 名前とプロフィール画像を3Dカードで表示
   - スマホの傾き（ジャイロセンサー）に連動してカードが立体的に動く
   - スマホ画面にピッタリ収まるレスポンシブデザイン

2. **SNSリンク管理**
   - X (Twitter), GitHub, Zenn 等のSNSリンクを登録
   - 各SNSのアイコンを表示

3. **QRコード生成**
   - SNSアイコンをタップするとカードがフリップアニメーション（3D回転）
   - カード裏面にタップしたSNSのQRコードを表示
   - QRコード生成はクライアントサイドで実行

4. **マルチユーザー対応**
   - 複数のユーザーが個別にプロフィールを作成・編集可能
   - 各プロフィールは一意のIDで識別

## 技術スタック

### 必須技術
- **フレームワーク**: Next.js (Pages Router) ※App Routerは使用しない
- **スタイリング**: 素のCSS（CSS-in-JSやTailwindは使わない）
- **QRコード**: qrcode.react ライブラリを使用
- **ストレージ**: 現在はlocalStorage、将来的にFirebase等に移行予定

### 使用API
- Gyroscope API（デバイスの傾き検知）
- Canvas API（QRコード生成に内部で使用）

## アーキテクチャ設計

### ディレクトリ構造
```
profile-card/
├── pages/
│   ├── index.js          # ホーム/プロフィール一覧
│   ├── edit.js           # プロフィール編集画面
│   └── profile/[id].js   # プロフィール表示（メイン機能）
├── components/
│   ├── ProfileCard.js    # 3Dカードコンポーネント
│   └── QRCodeDisplay.js  # QRコード表示コンポーネント
├── lib/
│   └── storage.js        # ストレージ抽象化層
└── styles/
    └── globals.css
```

### データ構造

```typescript
Profile {
  id: string;              // 一意のID
  name: string;            // 表示名
  imageUrl: string;        // プロフィール画像URL
  links: {
    twitter?: string;      // XのURL
    github?: string;       // GitHubのURL
    zenn?: string;         // ZennのURL
  }
}
```

### ストレージ抽象化層

`lib/storage.js` が全てのデータアクセスを担当：

```javascript
class StorageAdapter {
  getProfiles()           // 全プロフィール取得
  getProfile(id)          // 特定プロフィール取得
  saveProfile(profile)    // プロフィール保存/更新
  deleteProfile(id)       // プロフィール削除
  generateId()            // 新規ID生成
}
```

**設計意図**: 将来的にFirebase/Supabase等に移行する際、このファイルのみ変更すればよい

## UI/UX要件

### スマホ最適化
- viewport: 画面幅100%、高さ100%を使い切る
- フォントサイズ: 十分に大きく読みやすいサイズ
- タップターゲット: 最小44x44px

### 3Dカード演出
- **通常状態**: ジャイロセンサーで傾きに追従（perspective効果）
- **フリップ状態**: Y軸回転で裏返る（180度回転）
- **アニメーション**: smooth、duration 600ms程度

### カラーパレット（推奨）
- ダークモード想定
- カード背景: グラデーション or グラスモーフィズム
- アクセントカラー: 鮮やかな色（青/紫/緑系）

## 実装上の制約・注意点

### 1. Pages Router使用
- `getServerSideProps`や`getStaticProps`は今回不要
- クライアントサイドレンダリングで完結

### 2. CSS直書き
- CSS Modules (`*.module.css`) を使用
- またはインラインstyle属性 + styled-jsx
- Tailwind、styled-components等は使用しない

### 3. localStorage使用時の注意
- サーバーサイドでは使用不可（`typeof window !== 'undefined'`でチェック）
- 容量制限（5-10MB）を考慮

### 4. ジャイロセンサー
- iOS SafariではDeviceMotionEvent許可が必要
- フォールバック: ジャイロ非対応時はマウス/タッチで操作可能にする

## 拡張計画

### Phase 1（現在）
- localStorage実装
- 基本的な3Dカード
- QRコード生成

### Phase 2（今後）
- Firebase/Supabase対応
- 画像アップロード機能
- プロフィールURL共有機能

### Phase 3（将来）
- カスタムテーマ
- アクセス解析
- 名刺交換機能（相互フォロー的な）

## コード品質基準

- **変数名**: 日本語でなくても構わないが、意味が明確に
- **関数**: 単一責任の原則
- **コンポーネント**: 再利用性を考慮
- **エラーハンドリング**: localStorage失敗、画像読み込み失敗等に対応

## 参考リンク

- [DeviceMotionEvent API](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent)
- [qrcode.react](https://www.npmjs.com/package/qrcode.react)
- [CSS 3D Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)

## 開発時のTips

- ジャイロセンサーテスト: 実機必須（Chrome DevToolsのエミュレーターでは不完全）
- QRコード読み取りテスト: スマホのカメラアプリで確認
- localStorage確認: Chrome DevTools > Application > Local Storage