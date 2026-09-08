# SongCode MVP

URLフラグメント内のSC2曲情報を、ブラウザ内のWeb Audio APIで再生する静的MVPです。

## SongCode Ver 1.1

- 基本記法: `音名:長さ:歌詞`（例: `C4:0.5:な`）
- 休符（ブレス）: `R:長さ:-`（例: `R:1:-`）。休符の間は歌声を出さず、リズムだけを進めます。
- 長さ: 正の数値で指定します。`0.5`（八分音符）、`1.5`（付点四分音符）など小数拍に対応します。
- 音程: `C0`〜`C8`の範囲で指定します。跳躍幅に制限はありません。
- QR/再生URLで使うSC2形式にはタイトルとBPMを含めます: `SC2|タイトル|BPM|C4.0.5.な~R.1.-`

- 公開URL: `https://toshino2.github.io/songcode/`
- 再生URL: `https://toshino2.github.io/songcode/play/#SC2...`
- サーバー側データベース、Cookie、アクセス解析、外部APIは使用しません。
- 曲情報は`#`以降に格納され、通常のHTTPリクエストとしてサーバーへ送信されません。
- 既存の録音、TTS、歌唱モデルは使用しません。

GitHub Pagesでは、Settings > Pagesから`main`ブランチのルートを公開元に設定してください。
