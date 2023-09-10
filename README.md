# discord-keyword-notification-bot

## デプロイ方法

1. .env.template をコピーし、.env を用意する、必要な環境変数をセットする
2. github-to-discord-map.json に、GitHub のユーザ名をキーに Discord の User ID をリストアップする
3. `docker build . --platform=linux/amd64 --tag タグ名` でビルドする
4. 何らかのサービスにデプロイする

## Bot の追加方法

1. サーバ管理者が https://discord.com/api/oauth2/authorize?client_id=1147459091120271421&scope=applications.commands を開き、bot を承認する
