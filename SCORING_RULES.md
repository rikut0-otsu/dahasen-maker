# 打破宣言メーカー - 配点ルール

## 概要

この診断は、16問の回答をもとに以下の4領域を判定します。

- 意思決定: `Logic / Emotion`
- 役割: `Drive / Support`
- 領域: `Expansion / Mastery`
- 実行: `Agile / Precision`

各領域でスコアが高かった側を採用し、その4領域の組み合わせから16タイプを決定します。

---

## 回答の基本配点

回答は4段階です。

- 強くそう思う: `2点`
- ややそう思う: `1点`
- ややそう思わない: `1点`
- まったくそう思わない: `2点`

画面上では左右の丸の大きさで強弱を表します。

---

## 加点の考え方

各設問には

- `positive`
- `negative`

の2方向が定義されています。

ユーザーが「そう思う」側を選んだ場合は `positive` 側へ加点され、
「そう思わない」側を選んだ場合は `negative` 側へ加点されます。

計算式は次の通りです。

`実際の加点 = 回答点数 × 設問weight`

通常の設問は `weight = 1` です。
一部の重要設問のみ `weight = 2` を持ちます。

---

## 重み付き設問

以下の設問は重要度が高く、2倍で集計されます。

- `Q4`: 感性 / 論理
- `Q7`: 緻密 / 爆速
- `Q12`: 専門 / 越境
- `Q14`: 伴走 / 自走

この4問は配点が次のようになります。

- 強くそう思う: `4点`
- ややそう思う: `2点`
- ややそう思わない: `2点`
- まったくそう思わない: `4点`

---

## 16問の配点一覧

### 実行

1. まずやってみて、走りながら改善していくほうが性に合っている。
   - はい: `Agile`
   - いいえ: `Precision`
   - weight: `1`

3. 計画が完璧に固まる前に、動き出すことに抵抗がある。
   - はい: `Precision`
   - いいえ: `Agile`
   - weight: `1`

7. 未知の領域に取り組んでいる時、確実性のない中で決断を下すことは苦手だ。
   - はい: `Precision`
   - いいえ: `Agile`
   - weight: `2`

8. 完璧を目指すよりも、とにかく一旦前に進めることのほうが大事だと思う。
   - はい: `Agile`
   - いいえ: `Precision`
   - weight: `1`

### 領域

2. 憧れるのは、圧倒的なスキルを持つ職人タイプより、何でもこなす多才なタイプだ。
   - はい: `Expansion`
   - いいえ: `Mastery`
   - weight: `1`

6. 会議では、他分野を掛け合わせたアイデアを出すより、自分の担当領域を深く話したい。
   - はい: `Mastery`
   - いいえ: `Expansion`
   - weight: `1`

9. キャリア形成において、同じ部署に長く留まるより、多様な環境を経験したい。
   - はい: `Expansion`
   - いいえ: `Mastery`
   - weight: `1`

12. 未経験だが視野が広がる業務と、自分の強みをさらに磨ける業務なら、後者を選ぶ。
   - はい: `Mastery`
   - いいえ: `Expansion`
   - weight: `2`

### 意思決定

4. 大きな決断を迫られたとき、客観的なデータや事実よりも、理想や直感を重視する。
   - はい: `Emotion`
   - いいえ: `Logic`
   - weight: `2`

13. 仕事をする上で、「誰と一緒にやるか」という周囲との繋がりでモチベーションよりも、「なぜこの仕事が必要か」という論理的な納得感に左右されやすい。
   - はい: `Logic`
   - いいえ: `Emotion`
   - weight: `1`

16. あなたが人事なら、抜擢の理由は「その人が持つ熱量や人間的魅力」より、「過去の定量的な実績」に理由の比重をおくべきだと思う。
   - はい: `Logic`
   - いいえ: `Emotion`
   - weight: `1`

### 役割

5. 『あなたのおかげで道が開けた』と言われるよりも、『あなたのおかげで頑張れた』と言われる方が嬉しい。
   - はい: `Support`
   - いいえ: `Drive`
   - weight: `1`

10. 理想のチームとは、弱点を補い合うような集団よりも、強力な個が集まった集団であるべきだと思う。
   - はい: `Drive`
   - いいえ: `Support`
   - weight: `1`

14. 高い営業目標を追いかける際、自分が圧倒的な数字を作って「背中」でチームを引っ張るよりも、自分や他者の強みを組み合わせて、みんなで勝てる仕組みを整えたい。
   - はい: `Support`
   - いいえ: `Drive`
   - weight: `2`

15. 全社会議の表彰台で、自分の名前が呼ばれてスポットライトを浴びる瞬間よりも、自分が裏で支えた後輩やチームメンバーが表彰され、壇上でキラキラしている姿を見る方が泣ける。
   - はい: `Support`
   - いいえ: `Drive`
   - weight: `1`

---

## 結果決定方法

各指標の累計スコアを比較し、各領域で高い側を採用します。

- `Logic` vs `Emotion`
- `Drive` vs `Support`
- `Expansion` vs `Mastery`
- `Agile` vs `Precision`

決まった4領域の組み合わせから、16タイプのいずれかにマッピングします。

例:

- `Logic + Drive + Expansion + Agile` → `L-D-X-A` → 織田信長
- `Emotion + Support + Mastery + Precision` → `E-S-M-P` → 菅原道真

---

## 実装上の参照先

- 設問定義: [`client/src/data/questions.json`](c:\Users\apate\Documents\dahasen-maker\client\src\data\questions.json)
- 診断ロジック: [`client/src/hooks/useDiagnosis.ts`](c:\Users\apate\Documents\dahasen-maker\client\src\hooks\useDiagnosis.ts)
- タイプ定義: [`client/src/data/types.json`](c:\Users\apate\Documents\dahasen-maker\client\src\data\types.json)
