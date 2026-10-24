# Peperon
パズルゲーム [Spaghetti Network](https://spa-net.com/) をもとに作ったToy Programming Languageです。  
パズル自体のルールは公式ヘルプページを参照してください。

# インストール
リリースバージョンのtgzファイルから、npm installすることで `peperon` コマンドを利用可能になります。

```
npm install --global peperon-1.0.0.tgz
```

あるいは、レポジトリをcloneしてローカルでbuildすることも可能です。

# 実行方法
- 拡張子が `.pprn` のファイルを作成してコードを記述
- `peperon <ファイル名>.pprn` で実行。最終的な出力ノードの値が出力される。
- `-x` オプションをつけることで、、各ノードの計算過程も出力される。

# 文法
## ノードの宣言
- keyword
  - `input`: 入力ノード
  - `node`: 中間ノード
  - `output`: 出力ノード
- ノード名: 大文字アルファベット1文字のみ
- `init` : 初期値。入力ノードには必須・中間ノードは任意。outputノードには指定不可 (常に初期値0)。
- 優先度: `@<number>` の形式で指定。Spaghetti Networkでは、値が正でありかつ最も左にあるノードが実行されるが、このノードの位置関係を指定するために使う。数値が低いものほど先に実行される (=左にある)。同じ優先度は指定できない。
- なお、peperonで扱える数値はint32の範囲内のみ。

## 式の宣言
- 式は `<ノード名> <operator> <ノード名>` の形式で宣言する。
- operator
  - `->+` : 左辺ノードから右辺ノードへ+のEdgeを張る
  - `->-` : 左辺ノードから右辺ノードへ-のEdgeを張る

## その他
- コメントは `#` で始める行として記述可能
- コメント・空行は無視される

## 例
```
# test.pprn
input A init 1 @1
input B init 2 @2
node C init 0 @3
output D @4

A ->+ C
B ->- C
C ->+ D
```

```
$ peperon -x test.pprn
A: 1 B: 3 C: 1 D: 1
A: 0 B: 3 C: 2 D: 2
A: 0 B: 2 C: 1 D: 2
A: 0 B: 1 C: 0 D: 2
A: 0 B: 0 C: -1 D: 2
2
```
