# CLAUDE.md

このファイルはClaude Codeが毎回最初に読む指示書です。
作業を始める前に必ず内容を確認してください。

---

## 1. プロジェクト概要

- **何を作るか**：ポモドーロタイマーアプリ
- **主な機能**：
  - 25分作業 / 5分休憩 / 15分長い休憩のタイマー
  - 完了回数・集中時間の統計
- **対象**：iOS・Android両対応
- **デザイン**：シンプル・ミニマル
- **詳細仕様**：`PRD.md` を参照

---

## 2. 技術スタック

- **フレームワーク**：React Native + Expo
- **言語**：TypeScript
- **状態管理**：React Hooks（useState / useReducer / Context）まずはこれだけ
- **ストレージ**：`@react-native-async-storage/async-storage`
- **ナビゲーション**：`@react-navigation/native` + bottom-tabs
- **通知**：`expo-notifications`
- **バイブ**：`expo-haptics`

> 上記以外のライブラリを追加する前に、必要性を必ず確認すること。

---

## 3. フォルダ構成のルール

```
pomodoro-app/
├── App.tsx                  # エントリーポイント
├── app.json                 # Expo設定
├── PRD.md                   # 要件定義
├── CLAUDE.md                # この指示書
├── src/
│   ├── screens/             # 画面コンポーネント
│   │   ├── TimerScreen.tsx
│   │   ├── StatsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/          # 共通UIパーツ
│   ├── hooks/               # カスタムフック（usePomodoroなど）
│   ├── storage/             # AsyncStorage操作
│   ├── types/               # 型定義
│   └── constants/           # 定数（時間・色など）
└── assets/                  # 画像・アイコン
```

### ルール

- 画面ファイルは `src/screens/` に置く
- 再利用するUIは `src/components/` に切り出す
- ロジックは `src/hooks/` にまとめる
- 1ファイル200行を超えたら分割を検討

---

## 4. コーディング規約

### シンプルに保つ

- 不要な抽象化はしない（最初はベタ書きでOK）
- 1関数・1コンポーネントは「1つのことだけやる」
- 早すぎる最適化はしない

### 命名

- コンポーネント：PascalCase（例：`TimerButton`）
- 関数・変数：camelCase（例：`startTimer`）
- 定数：UPPER_SNAKE_CASE（例：`WORK_DURATION`）
- ファイル名：コンポーネントはPascalCase、それ以外はcamelCase

### スタイル

- StyleSheet.create を使う（インラインスタイルは最小限）
- 色・余白の値は `src/constants/` で定数化
- マジックナンバーを直接書かない

### 型

- `any` を使わない
- propsには必ず型をつける
- API・ストレージの戻り値も型を定義

### コメント

- 「なぜそうしたか」を書く（「何をしているか」はコードで伝える）
- TODOコメントを残すときは内容を具体的に

---

## 5. やってはいけないこと

- ❌ Webだけで動く依存ライブラリを入れる（必ずReact Native対応か確認）
- ❌ Expoから外れるネイティブモジュールを安易に追加する
- ❌ Reduxなど大きな状態管理ライブラリをいきなり導入する
- ❌ デザインを派手にする（ミニマル方針を崩さない）
- ❌ ユーザーの個人情報を収集・送信する
- ❌ サーバー通信を入れる（MVPはローカルのみ）
- ❌ `any` 型を使う
- ❌ 1コミットで大量のファイルを変更する（小さく刻む）
- ❌ PRD.mdに無い機能を勝手に追加する（事前に相談）
- ❌ console.log を本番コードに残す

---

## 6. 作業の進め方

1. 作業前に `PRD.md` と `CLAUDE.md` を読み直す
2. やることをタスクに分割する
3. 1タスクごとに動作確認する
4. 不明点・仕様の判断が必要な場面では勝手に決めず、ユーザーに確認する

---

## 7. 確認したいことがあるとき

- 機能の範囲が曖昧 → 必ず質問する
- ライブラリ追加の判断 → 必ず質問する
- デザインの細部 → ミニマルを基準に提案ベースで聞く
