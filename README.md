# VRChatにあるカードゲーム「ぷぷりえーる」のデッキ構築などができるwebアプリのフロントエンド
URL: https://p-nasimonan.github.io/PPLALE-web_front/  （画像が最適化されないため、初回ロードに時間がかかるかもしれません）  
自宅鯖： https://pplale.pgw.jp/  （今のところIPv6しか対応してません）  
<img width="1619" alt="スクリーンショット 2025-05-01 15 34 43" src="https://github.com/user-attachments/assets/5a895727-011e-4c35-8c57-66b94f290253" />

## ぷぷりえーるとは
VRChatのイベントロリっ子喫茶ぷぷりえのカードゲーム！推しのデッキを構築しよう！

# 使い方
カードをドラッグ&ドロップでデッキに追加  
<img width="597" alt="スクリーンショット 2025-05-01 15 36 54" src="https://github.com/user-attachments/assets/f5325cb9-aabc-4b8d-b415-0654603d8d7b" />

もしくは、クリックしてカード詳細を開き、追加ボタンから  
<img width="826" alt="スクリーンショット 2025-05-01 15 42 14" src="https://github.com/user-attachments/assets/82a2d83f-b8b0-4533-8c72-cc8d3ef6a9fe" />

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
こんな感じでGitHubにプッシュすると自宅鯖にGitlabCI/CDでデプロイされてます  
![alt text](drawio/deploy.drawio.svg)

## Next.js使います

Reactはちょっと触ってるけどNext.jsは初めてなので学びながら（学ぶために）作ります。
node.jsが必要です。

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
適当に書いたから被ってるところありそう。
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