# 開発ガイドライン

## プロジェクト方針

「低燃費スタディ」は、その日の余力に合わせて小さく着手するための集中支援アプリです。詳しい仕様と実装状況は [PRD.md](../PRD.md) を参照してください。

- iOS / AndroidをReact Native + Expoで扱う
- シンプルで落ち着いた操作感を保つ
- ユーザーの入力データは端末内に保存する
- MVPではログインや外部サーバー同期を行わない

## 技術スタック

- React Native / Expo / TypeScript
- React Hooks
- AsyncStorage
- React Navigation
- Expo Notifications / Expo Haptics
- React Native Google Mobile Ads

依存ライブラリを追加するときは、React Native・Expoとの互換性と、既存の依存で代替できないかを確認します。

## 主な構成

```text
App.tsx                       ナビゲーション
src/screens/                  画面コンポーネント
src/components/               共通UI
src/domain/                   表示・ドメインロジック
src/hooks/                    カスタムフック
src/storage/                  AsyncStorage操作と集計
src/notifications/            ローカル通知
src/ads/                      広告設定
src/constants/                定数
src/types/                    型定義
docs/                         開発資料
```

## 実装時の原則

- 変更目的と関係のないリファクタリングを混ぜない
- 不要な抽象化を避け、画面・ドメイン・保存処理の責務を分ける
- props、保存データ、画面遷移パラメーターに型を付ける
- UIの色や余白は既存の定数を優先して使う
- コメントは、コードから読み取れない判断理由を中心に書く
- ユーザーの個人情報を収集・外部送信しない
- 本番コードに認証情報、秘密鍵、トークンを含めない
- AdMob App IDや広告ユニットIDなどの公開識別子と、秘密情報を区別する

## 変更後の確認

最低限、次を確認します。

```sh
npm install
npx tsc --noEmit
```

package.jsonにtestやlintのスクリプトが追加された場合は、それらも実行します。通知とAdMobはExpo Goだけでは確認できないため、必要に応じてdevelopment buildで実機確認します。

## ドキュメント更新

- 実装済み機能だけをREADMEに記載する
- 企画と実装が変わった場合はPRDの実装状況を更新する
- 生成AIを利用した場合は利用範囲を隠さず、判断・修正・検証をどのように行ったか説明できる状態にする
