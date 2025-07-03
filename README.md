# VRChatにあるカードゲーム「ぷぷりえーる」のデッキ構築などができるwebアプリ
自宅鯖： https://pplale.pgw.jp/  （ipv4対応しました）   
予備: https://pplale-web-front.vercel.app/ （デッキデータをパーソナライズするためGitHubPagesから移行）
![image](https://github.com/user-attachments/assets/f30d43ca-e1b6-463f-ac5a-f3d9b23f0922)

![image](https://github.com/user-attachments/assets/51f9bd05-2cd3-4e7f-9c74-3763ed0fa326)

## ぷぷりえーるとは
VRChatのイベント「ロリっ子喫茶ぷぷりえ」のカードゲーム！幼女カードとお菓子カードがある。推しのカードでデッキを構築しよう！

## 通常構築
カードをドラッグ＆ドロップして構築する
![image](https://github.com/user-attachments/assets/1af293a3-7bbc-4b70-b80d-4d6e29962c78)



## 2pick構築について
シャドウバースの2pickのようにある程度ランダムにデッキを構築する。
```
フルーツ、プレイアブルカードのバージョン選択
↓
最後に選択するプレイアブルカード3枚の確認
↓
二枚ずつ選んデッキ構築
↓
プレイアブルカード選択
```

# 開発について

## 開発経緯

VRChatのカードゲーム「ぷぷりえーる」は、VRChatのワールド内でデッキを構築する必要があり、保存は各自がデッキデータをメモする必要がありました。これをブラウザ上で構築してユーザーごとに保存できるようにしたいと思い開発を開始しました。

また、2Pickで構築したいという要望や、webアプリがあったらいいなという話があったため、このプロジェクトを進めることになりました。

## 使用技術
| カテゴリ           | 技術                   | 選定理由                                                                                                                                                                                                               | 
| ------------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | 
| フロントエンド     | Next.js(app router)    | 色んな機能をつける可能性があったため最初からNext.jsを選定。素早くカードを選んで構築するために快適な動作を求めているため、最適化やSSGの機能は重要だった。静的なサイトであればAstroを使いたいが、例えばデッキ共有機能などはNext.jsがよいと感じた。                                | 
| フロントエンド     | React,TypeScript       | コンポーネントを作成して再利用することは開発前からカードゲームのカードはコンポーネントにする必要があると考えたため。Vueのほうが簡単そうだけどエコシステムが小さいとかTypeScriptとの相性があんまりという噂で大は小を兼ねるということでReactを学習中。また案外useEffectとかも慣れたため                                                      | 
| デザイン           | Tailwind,ネイティブCSS | AIがtailwindを書き慣れていたことと、私もこのプロジェクトを通して書き慣れたため。最初はネイティブCSSを書いていたため少し混合している                                                                                    | 
| バックエンド       | TypeScript             | リポジトリ作成段階ではバックエンドは別プロジェクトで別言語で書こうと考えていた。しかしNext.jsでAPIの実装もできたこと、認証もDBもFirebaseなので大きなバックエンドは不要で、TypeScriptで書いたほうがデータの受け渡しも楽でメリットが多かったため選定 | 
| 認証、データベース | Firebase               | Googleでログインすると保存できるようにしたが、ログインしなくてもほとんどの機能は使えるためとりあえずfirebaseという感じで実装。Supabaseに移行してみたい（自宅鯖に置きたい）                                             | 
| ミドルウェア       | Docker                 | サーバー側にnode.jsの環境を整えて動かして...そんなことしたくない。                                                                                                                                                     | 
| インフラ           | 自宅鯖(後述)           | ロマン、実家なのでまだ怒られなければ無料稼働。もちろん自動デプロイできる。            



## 自宅鯖
こんな感じでGitHubにプッシュすると自宅鯖にGitlabCI/CDでデプロイされてます  
![alt text](drawio/deploy.drawio.svg)

ドメインはmyDNSというDDNSのサービスがありそれを使ってる。  
大学のVMにIPv4を付与していただき、名目上は勉強目的でリバースプロキシとして使わせてもらってます。大学ありがとう。

## セットアップ
以下の環境を整えて
```bash
node --version
v22.4.1
npm --version
10.8.1
```

## 必要なパッケージのインストール

```bash
npm install
```

## Firebaseのルール
```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザー認証のヘルパー関数
    function isAuthenticated() {
      return request.auth != null;
    }

    // ユーザーが自分のドキュメントにアクセスしているか確認
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // デッキのドキュメントに対するルール
    match /users/{userId}/decks/{deckId} {
      // 読み取り:誰でもok
      allow read: if true;
      
      // 書き込み: 自分のみ
      allow write: if  isOwner(userId);
      
      // 作成: 自分のデッキのみ
      allow create: if isOwner(userId) && 
        request.resource.data.keys().hasAll(['name', 'yojoDeckIds', 'sweetDeckIds', 'playableCardId', 'updatedAt', 'is2pick']);
      
      // 更新: 自分のデッキのみ
      allow update: if isOwner(userId) && 
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['name', 'yojoDeckIds', 'sweetDeckIds', 'playableCardId', 'updatedAt', 'is2pick']);
      
      // 削除: 自分のデッキのみ
      allow delete: if isOwner(userId);
    }

    // その他のドキュメントへのアクセスは拒否
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
