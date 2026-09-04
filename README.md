# SongCode MVP

URLフラグメント内のSC2曲情報を、ブラウザ内のWeb Audio APIで再生する静的MVPです。

- 公開URL: `https://toshino2.github.io/songcode/`
- 再生URL: `https://toshino2.github.io/songcode/play/#SC2...`
- サーバー側データベース、Cookie、アクセス解析、外部APIは使用しません。
- 曲情報は`#`以降に格納され、通常のHTTPリクエストとしてサーバーへ送信されません。
- 既存の録音、TTS、歌唱モデルは使用しません。

GitHub Pagesでは、Settings > Pagesから`main`ブランチのルートを公開元に設定してください。
