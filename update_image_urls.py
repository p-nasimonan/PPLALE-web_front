import json
import os
import re
from functools import lru_cache

@lru_cache(maxsize=1)
def get_image_files(directory):
    """ディレクトリ内のファイルリストをキャッシュして返す"""
    return os.listdir(directory)

def find_matching_file(files, name, fruit, is_yojo):
    """正規表現を使用して効率的にファイルを検索"""
    # カード名から特殊文字を除去
    clean_name = re.sub(r'[、。・]', '', name)
    
    # フルーツに応じたパターンを生成
    if is_yojo:
        if fruit == 'いちご':
            pattern = re.compile(f'.*イチゴ.*{clean_name}.*\.png$')
        elif fruit == 'ぶどう':
            pattern = re.compile(f'.*ぶどう.*{clean_name}.*\.png$')
        else:
            pattern = re.compile(f'.*{clean_name}.*\.png$')
    else:
        pattern = re.compile(f'.*{clean_name}.*\.png$')
    
    # パターンに一致する最初のファイルを返す
    for file in files:
        if pattern.match(file):
            return file
    return None

def update_image_urls(json_file, output_file, is_yojo=True):
    # JSONファイルを読み込む
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # カードの種類に応じてキーを設定
    cards_key = 'yojo' if is_yojo else 'sweet'
    cards = data[cards_key]
    
    # 画像ディレクトリのパスを設定
    image_dir = 'public/images/yojo' if is_yojo else 'public/images/sweet'
    
    # ファイルリストを一度だけ取得
    files = get_image_files(image_dir)
    
    # 各カードのimageUrlを更新
    for card in cards:
        selected_file = find_matching_file(
            files,
            card['name'],
            card['fruit'],
            is_yojo
        )
        
        if selected_file:
            card['imageUrl'] = f'/images/{cards_key}/{selected_file}'
            print(f"Updated {card['name']} ({card['fruit']}): {selected_file}")
        else:
            print(f"Warning: No matching file found for {card['name']} ({card['fruit']})")
    
    # 更新したデータを保存
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# 幼女カードのJSONを更新
update_image_urls('src/data/yojo.json', 'src/data/yojo_updated.json', True)

# お菓子カードのJSONを更新
update_image_urls('src/data/sweet.json', 'src/data/sweet_updated.json', False)

print("画像URLの更新が完了しました。") 