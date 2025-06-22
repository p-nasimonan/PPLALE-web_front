# VRChatにあるカードゲーム「ぷぷりえーる」のデッキ構築などができるwebアプリのフロントエンド
自宅鯖： https://pplale.pgw.jp/  （ipv4対応しました）   
予備: https://pplale-web-front.vercel.app/ （デッキデータをパーソナライズするためGitHubPagesから移行）
![image](https://github.com/user-attachments/assets/f30d43ca-e1b6-463f-ac5a-f3d9b23f0922)

![image](https://github.com/user-attachments/assets/51f9bd05-2cd3-4e7f-9c74-3763ed0fa326)

## ぷぷりえーるとは
VRChatのイベントロリっ子喫茶ぷぷりえのカードゲーム！推しのデッキを構築しよう！

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
