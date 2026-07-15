# 低燃費スタディ

## AdMob iOS 実機確認

このプロジェクトは `react-native-google-mobile-ads` を使うため、Expo Go では AdMob のネイティブ広告を確認できません。iOS 実機では EAS development build を作成して確認します。

### 現在の確認用設定

- `eas.json` に iOS 実機向けの `development-ios` profile があります。
- `app.json` の `ios.bundleIdentifier` は `com.yuu.pomodorotimer` です。
- `app.json` の `expo.extra.eas.projectId` は設定済みです。
- `app.json` の `react-native-google-mobile-ads` plugin に iOS App ID が設定済みです。
- `src/ads/AdMobConfig.ts` の `isUsingTestAds` は `true` のままにします。
- iOS の banner ad unit は Google のテスト広告 ID を使います。

### 初回準備

1. EAS CLI にログインします。

   ```sh
   npx eas login
   ```

2. Apple Developer Program に登録された Apple ID で iOS の署名設定を進められる状態にします。
3. 実機の UDID 登録が求められた場合は、EAS CLI の案内に従って登録します。

### development build の作成

```sh
npx eas build --platform ios --profile development-ios
```

ビルド完了後、EAS の案内に従って実機に development build をインストールします。

### 実機での起動

development build をインストールした iPhone と開発マシンを同じネットワークに接続し、Metro を development client 向けに起動します。

```sh
npx expo start --dev-client
```

iPhone で development build を開き、表示された開発サーバーへ接続します。

### 確認ポイント

- Home 画面下部の広告枠にテスト広告が表示されること。
- Expo Go ではなく、EAS development build で起動していること。
- `src/ads/AdMobConfig.ts` の `isUsingTestAds` が `true` のままであること。
- 広告が表示されない場合は、数十秒待ってからアプリを再起動し、Metro と端末が同じネットワークにいるか確認します。
