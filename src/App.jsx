// npm install lucide-react recharts firebase

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Check, 
  X, 
  Home, 
  ChevronRight, 
  RefreshCw, 
  BarChart2, 
  BookOpen, 
  User, 
  ArrowRight, 
  HelpCircle 
} from "lucide-react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from "recharts";

// データの分離用 APP_ID
const APP_ID = "QuizApp_Capital_And_Cost_001";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebaseの防衛的初期化
let app;
let db;
let auth;
try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("Firebase initialized successfully for AppID:", APP_ID);
  } else {
    console.warn("Firebase config is incomplete. Running in Local Storage Mode.");
  }
} catch (e) {
  console.error("Firebase initialization failed:", e);
}

// 1. 問題データ配列（完全ノンカット収録）
const QUESTIONS = [
  {
    id: "q_1",
    title: "問題 1 資材所要量計画",
    source: "令和4年　第6問",
    category: "資材管理",
    text: "資材所要量計画に関する記述として、最も適切なものはどれか。",
    options: [
      "ア　従属需要品目とは、資材調達先企業からの要望に従い、生産する時期と数量が決定される品目のことである。",
      "イ　タイムバケットとは、外部企業からの資材の調達にかかる所要時間のことである。",
      "ウ　独立需要品目とは、営業部門とは無関係に、生産部門や資材調達部門が独自の需要予測に基づいて、生産する時期と必要量を決定する品目のことである。",
      "エ　部品構成表とは、購買部門が調達する資材と部品をリスト化した表のことである。",
      "オ　部品展開とは、計画期間内に生産する最終製品の種類と数量が決まったとき、それらを生産するのに必要な構成部品の種類とその数量を求めることである。"
    ],
    answerIndex: 4,
    explanation: `解答：オ
ここが重要
　資材計画では、生産に必要な資材が、いつ、どれだけ必要かを決定することが重要です。これを決定するのが、資材所要量計画（MRP：Material Requirement Planning）です。
　では、選択肢を確認していきましょう。

選択肢アは不適切な記述です。従属需要品目とは、「その品目に対する需要が、独立需要品目又は上位品目の需要から算定される品目」のことです。例えば、パソコンで言うとCPUやメモリが従属需要品目に該当します。従属需要品目は上位の品目や独立需要品目の需要によって、生産する時期や量が決定されます。資材調達先企業からの要望に従って決めるものではありません。

選択肢イは不適切な記述です。タイムバケットとは、生産計画を立てる際の各期間のことです。連続する期間を１か月や1週間などに分け、生産活動を計画・統制します。この期間がタイムバケットです。資材の調達にかかる所要時間ではありません。

選択肢ウは不適切な記述です。独立需要品目とは、他の品目とは無関係に「受注又は予測に基づいて、その必要時期又は必要量を決定する品目」のことです。例えば、パソコンで言うとパソコンそのもの（最終製品）や、修理や保守で個別に提供されるサービスパーツが独立需要品目に該当します。本肢の記述は、需要予測に基づいて生産する時期と必要量を決定する点は正しい説明ですが、営業部門は無関係ではありません。最も高い精度で需要を予測できる営業部門は、むしろ大きく関わる部門と言えます。

選択肢エは不適切な記述です。部品構成表とは、「各部品（製品も含む）を生産するのに必要な子部品の種類と数量を示すリスト」のことです。部品構成表は、生産部門において生産設計により作られる「生産部品表」と、需要予測や生産計画を行いやすくするために作られる「計画部品表」における商品構成の情報を指します。購買部門が調達する資材と部品をリスト化したものではありません。

選択肢オは適切な記述です。部品展開とは、「計画期間内に生産しなければならない最終製品の種類と数量が決まったとき、それらの製品を作るために必要な構成部品又は資材の種類とその数量を求める行為」を指します。

資材所要量計画については、独立需要品目と従属需要品目の違いについて、しっかり理解しておきましょう。また、本試験では部品表から部品の数を計算させる問題がよく出題されますので、併せて学習しておきましょう。`
  },
  {
    id: "q_2",
    title: "問題 2 部品構成表(BOM)",
    source: "令和3年　第9問",
    category: "資材管理",
    text: "最終製品Zの部品構成表が下図に与えられている。（　　）内の数は親1個に対して必要な子部品の個数を示している。製品Zを10個生産するのに必要な部品Aの数量の範囲として、最も適切なものを下記の解答群から選べ。",
    options: [
      "ア　100 未満",
      "イ　100 以上 200 未満",
      "ウ　200 以上 800 未満",
      "エ　800 以上"
    ],
    answerIndex: 3,
    explanation: `解答：エ
ここが重要
　部品構成表（BOM：Bill of Material）に関する出題です。部品構成表の知識が無かった場合でも、本問は与えられた図（構成表）から容易に計算することができます。
　部品構成表は、製品（各部品を含む）を生産するのに必要な子部品の種類と数量を示したリストです。部品表あるいはBOMとも呼ばれ、部品展開を行う際の基礎資料になります。部品構成表は、部品の親子関係をツリー状に表現したストラクチャ型と表形式で示したサマリー型があり、本問ではストラクチャ型の構成表が与えられています。

　では、計算してみましょう。
　赤枠が部品Aです。青枠は部品Ａを必要とするそれぞれの部品を示しています。各部品に必要な数量は（　）内の数字で示されていますので、部品Aの総数は次の計算で求まります。
　① A ＝2×1×5＝10個
　② A ＝2×3×2＝12個
　③ A ＝1×5×2＝10個
　④ A ＝1×10×5＝50個
　①＋②＋③＋④＝10＋12＋10＋50＝82個　

　製品Zを1個生産するために必要な部品Aは82個と分かりました。本問は製品Zを10個生産するための必要数が問われていますので、82個×10＝820個となります。
　よって、選択肢エが正解です。

　部品構成表は、サマリー型で出題されるケースもあります。計算自体は単純な足し算ですので、ストラクチャ型とサマリー型のどちらのパターンでも計算できるようにしておきましょう。`
  },
  {
    id: "q_3",
    title: "問題 3 ストラクチャ型部品表",
    source: "令和5年　第7問",
    category: "資材管理",
    text: "　以下のストラクチャ型部品表に基づいた記述として、最も適切なものを下記の解答群から選べ。",
    options: [
      "ア　製品Ｘを10個生産するために、部品Ｂは10個必要である。",
      "イ　製品Ｘを10個生産するために、部品Ｃは40個必要である。",
      "ウ　製品Ｘを10個生産するために、部品Ｄは40個必要である。",
      "エ　部品Ｂを20個生産するために、部品Ｃは40個必要である。",
      "オ　部品Ｂを20個生産するために、部品Ｄは60個必要である。"
    ],
    answerIndex: 1,
    explanation: `解答：イ
ここが重要
　ストラクチャ型部品表に関する出題です。本問はストラクチャ型部品表の知識が無い場合でも、与えられた条件から数えていくだけで容易に正解が導ける問題です。
　部品表は、製品（部品を含む）を生産するのに必要な子部品の種類と数量を示したリストです。部品構成表あるいはBOM（Bill of Material）とも呼ばれます。部品表は、部品展開を行う際の基礎資料になり、部品の親子関係をツリー状に表現したストラクチャ型と表形式で示したサマリー型の2種類があります。本問ではストラクチャ型の部品表に基づいた情報が与えられています。

　では、本問の部品構成を確認してみましょう。ストラクチャ型部品表を作成すると次のようになります。数値は数量を表します。
　製品Xを1個生産するために必要な各部品の数量は次の通りです。
　部品A：1個
　部品B：2個
　部品C：4個（2個＋部品Bを構成するための2個）
　部品D：6個（2個＋部品Bを構成するための4個）

　では、選択肢を見ていきましょう。
選択肢アは不適切な記述です。製品Xの生産量10個に対して部品Bは20個必要です。
選択肢イは適切な記述です。製品Xの生産量10個に対して部品Cは40個必要です。
選択肢ウは不適切な記述です。製品Xの生産量10個に対して部品Dは60個必要です。
選択肢エは不適切な記述です。部品Bの生産量20個に対して部品Cは20個必要です。
選択肢オは不適切な記述です。部品Bの生産量20個に対して部品Dは40個必要です。

以上より、選択肢イが正解です。
部品表は出題頻度が高く、得点源にしやすいテーマです。計算自体は単純な足し算ですので、ストラクチャ型とサマリー型のどちらのパターンでも計算できるようにしておくと良いでしょう。`
  },
  {
    id: "q_4",
    title: "問題 4 発注方式1",
    source: "令和3年　第12問",
    category: "在庫管理",
    text: "発注方式における発注点あるいは発注量の決定に関する記述として、最も適切なものはどれか。",
    options: [
      "ア　ダブルビン方式における発注量として、発注点の2倍を用いた。",
      "イ　定量発注方式における発注点として、調達期間中の平均的な払い出し量を用いた。",
      "ウ　定量発注方式における発注量として、経済発注量を用いた。",
      "エ　定期発注方式における発注量として、（発注間隔＋調達期間）中の需要量の推定値に安全在庫を加えた量を用いた。"
    ],
    answerIndex: 2,
    explanation: `解答：ウ
ここが重要
　発注方式に関する出題です。発注点と発注量の決定について、それぞれの発注方式の基本的な知識が問われています。難易度は高くありませんので、確実に正解したい問題です。
　まず、発注方式について確認しておきましょう。

【発注方式の概要】
・ダブルビン方式
　発注点と発注量：2つの入れ物を用意し、一方が空になったら発注する。
　対象品目：単価が安い小物などに適している。
・定量発注方式
　発注点と発注量：在庫量が発注点を切ったら毎回同じ量を発注する。
　対象品目：需要が安定しており、単価が低い品目に適している。
・定期発注方式
　発注点と発注量：一定期間ごとにその都度、発注量を決めて発注する。
　対象品目：単価が高く、在庫調整の必要が高い品目に適している。

では、選択肢を見ていきましょう。
選択肢アは不適切な記述です。ダブルビン方式は在庫を2つの容器に入れ、片方ずつ使用し、容器が空になった時点で発注する方式です。ここで発注する量は、空になった分だけ、つまり容器１つ分だけです。発注点の2倍を発注すると過剰在庫になります。

選択肢イは不適切な記述です。定量発注方式の発注点は、１期間あたりの平均需要量×調達期間＋安全在庫量で求めます。つまり、調達期間中の平均的な払い出し量に安全在庫を加えた量になります。安全在庫を考慮しないと、頻繁に欠品を起こす可能性があります。

選択肢ウは適切な記述です。定量発注方式の発注量には経済的発注量が用いられます。経済的発注量とは、発注作業にかかる費用と在庫の保管費用を合計した総費用を最も少なくする発注量のことです。次の式で算出します。
経済的発注量 ＝ √（ ２ × 1回あたりの発注費用 × 年間需要量 ／ 1個あたりの年間在庫維持費用 ）

選択肢エは不適切な記述です。定期発注方式の発注量は、（発注間隔＋調達期間）中の需要量の推定値－発注残－手持在庫量＋安全在庫量となります。つまり、発注間隔＋調達期間中の需要量に安全在庫を足した数値から、現時点の在庫量を差し引き、発注済みでまだ入荷していない品物があればその分も差し引く必要があります。

発注方式は生産管理と店舗販売管理のどちらにも狙われやすいテーマです。それぞれの発注方式がどのような資材（或いは商品）の発注に適しているか、発注点と発注量の関係と合わせて、理解しておきましょう。`
  },
  {
    id: "q_5",
    title: "問題 5 発注方式2",
    source: "令和4年　第10問",
    category: "在庫管理",
    text: "発注方式における発注点あるいは発注量の決定に関する記述として、最も適切なものはどれか。",
    options: [
      "ア　安全在庫は欠品を起こさないために決めるものであるが、保有在庫は安全在庫として決めた量を下回ることがある。",
      "イ　経済的発注量は、累積入荷数量と累積出荷数量に基づいて決まる。",
      "ウ　ダブルビン方式の発注量は、納入リードタイムを考慮して、その都度、決める。",
      "エ　内示とは、発注後に納入日を提示することである。",
      "オ　発注点とは、発注をする時点を示し、通常、日付のことである。"
    ],
    answerIndex: 0,
    explanation: `解答：ア
ここが重要
　発注方式に関する出題です。それぞれの発注方式における発注点や発注量の決定について、基本的な知識が問われています。過去の本試験でも頻繁に出題されている内容で、合格する方は確実に正解する問題です。

　では、選択肢を見ていきましょう。
選択肢アは適切な記述です。保有在庫は安全在庫として決めた量を下回ることがあります。安全在庫とは、「需要変動又は補充期間の不確実性を吸収するために必要とされる在庫を指します。簡単に言うと、欠品しないように余分に持っておく在庫です。予想以上に出荷量が増えたり（小売業なら予想を上回る数が売れたり）、ベンダー側の欠品で長期間入荷が無かった場合、安全在庫ではカバーしきれず保有在庫の量を下回ってしまうこともあります。

選択肢イは不適切な記述です。経済的発注量とは、発注作業にかかる費用と在庫の保管費用を合計した総費用を最も少なくする発注量のことです。次の式で算出します。
経済的発注量 ＝ √（ 2 × 1回あたりの発注費用 × 年間需要量 ／ 1個あたりの年間在庫維持費用 ）
よって、経済的発注量は、「1回あたり発注費用」、「年間需要量」、「1個あたりの年間在庫維持費用」によって決まります。累積入荷数量と累積出荷数量に基づくものではありません。

選択肢ウは不適切な記述です。ダブルビン方式は、在庫を2つの容器に入れ、片方ずつ使用し、容器が空になった時点で発注する方式です。発注量は納入リードタイムを考慮しているわけでなく、その都度決める必要もありません。

選択肢エは不適切な記述です。内示とは、事前に口頭もしくは非公式な書面によって予約的な注文を行うことを言います。発注後に納入日を提示することではありません。

選択肢オは不適切な記述です。発注点とは、「発注点方式において、発注を促す在庫水準」のことを言います。例えば、「在庫が残り10個になったら発注する」と決めた場合、この10個が発注点です。発注する日付ではありません。

発注方式に関する問題は、「店舗・販売管理」の分野からも頻繁に出題されています。特に定量発注方式、定期発注方式については、その発注方法の違いだけでなく、どのような資材の管理に適しているかも含めて、理解を深めておきましょう。`
  },
  {
    id: "q_6",
    title: "問題 6 経済的発注量1",
    source: "令和元年　第10問",
    category: "在庫管理",
    text: "　経済的発注量Qを表す数式として、最も適切なものはどれか。ただし、dを1期当たりの推定所要量、cを1回当たりの発注費、hを1個1期当たりの保管費とする。",
    options: [
      "ア",
      "イ",
      "ウ",
      "エ"
    ],
    answerIndex: 3,
    explanation: `解答：エ
ここが重要
　本問では、経済的発注量について問われています。数式を覚えていれば当然正解できますが、分子と分母に含まれる計算要素だけを覚えていても正解できますので難易度は高くありません。
　では、資材調達における経済的発注量について確認しましょう。
　経済的発注量は、総費用を最も少なくする発注量です。経済的発注量は、英語ではEconomic Order Quantityですので、略してEOQと呼ばれます。
　一回あたりの発注量を増やすと、発注回数が減るため在庫の発注処理にかかる費用は減りますが、在庫の保管費用が増加します。逆に、一回あたりの発注量を減らすと、在庫の保管費用は減りますが、発注回数が増え発注処理の費用が増えます。よって、発注量は多すぎても少なすぎても在庫の総費用が増加します。
　経済的発注量は、発注処理にかかる費用と、在庫の保管費用を合計した総費用を最も少なくする発注量です。

　経済的発注量は、次の式で求めることができます。
  Q = √（ 2 × c × d ／ h ）

　この式は、少し複雑ですが、次のようにして覚えると良いでしょう。
　まず、1回あたりの発注費用が大きい場合、小さい単位で数多く発注すると費用が多くかかります。よって、この場合は発注量を多くした方が経済的です。そのため、1回あたりの発注費用が多くなると、経済的発注量も多くなりますので、これは分子に置きます。
　需要量が多いと、その分たくさん発注をする必要があります。よって、年間需要量（推定所要量 d）は分子に置きます。
　在庫の維持費用が大きくなると、在庫をできるだけ少なくする方が経済的になります。在庫を少なくするには、こまめに発注した方が良いため、発注量を少なくする必要があります。よって、1個あたりの年間在庫維持費用（保管費 h）は分母に置きます。
　後は、分数に2を掛け、ルートを適用すれば、経済的発注量になります。
　従って、選択肢エの式が適切となります。`
  },
  {
    id: "q_7",
    title: "問題 7 経済的発注量2",
    source: "令和5年　第11問",
    category: "在庫管理",
    text: "経済的発注量に関する記述として、最も適切なものはどれか。",
    options: [
      "ア　１個１期当たりの在庫保管費が増え、１回当たりの発注費が減少した場合、経済的発注量は増える。",
      "イ　１個１期当たりの在庫保管費が変化せず、１回当たりの発注費が増えた場合、経済的発注量は減る。",
      "ウ　経済的発注量で発注する場合、在庫保管費用と発注費用が等しくなる。",
      "エ　経済的発注量で発注する場合、在庫保管費用より発注費用が高くなる。"
    ],
    answerIndex: 2,
    explanation: `解答：ウ
ここが重要
　経済的発注量に関する出題です。選択肢の記述だけ読むと一見難しく感じますが、経済的発注量の公式（分子と分母）とグラフを思い出せると、容易に正解が選べる問題です。
　経済的発注量とは、発注費用と在庫保管費用を足した総費用が、最も小さくなる発注量をいいます。一回あたりの発注量を増やすと、発注回数が減るため発注費用は減りますが、在庫の保管費用が増加します。逆に、一回あたりの発注量を減らすと、在庫保管費用は減りますが、発注費用が増えます。よって、発注量は多すぎても少なすぎても在庫の総費用が増加します。
　この在庫の保管費用と発注費用が同じになる発注量が、経済的発注量となります。

では、それぞれの記述を確認してみましょう。
選択肢アは不適切な記述です。１個１期当たりの在庫保管費（在庫維持費用）が増え、１回当たりの発注費が減少した場合、経済的発注量は減少します。公式に当てはめると分かりやすいでしょう。分母が大きくなり、分子が小さくなるわけですから、経済的発注量は減少します。

選択肢イは不適切な記述です。１個１期当たりの在庫保管費（在庫維持費用）が変化せず、１回当たりの発注費が増えた場合、経済的発注量は増加します。公式に当てはめると分かりやすいでしょう。分母は変わらず、分子が大きくなるわけですから、経済的発注量は増えます。

選択肢ウは適切な記述です。経済的発注量で発注する場合、在庫保管費用（在庫維持費用）と発注費用は等しくなります。

選択肢エは不適切な記述です。経済的発注量で発注する場合、在庫保管費用（在庫維持費用）と発注費用は等しくなります。

以上より、選択肢ウが正解です。
経済的発注量は頻出のテーマです。経済的発注量の考え方は過去によく問われています。「在庫保管費用と発注費用の合計が最小となる発注量」という点をしっかり覚えておきましょう。また、計算できなくても良いので、公式の分母と分子だけ押さえておくと、正解が導きやすくなります。`
  },
  {
    id: "q_8",
    title: "問題 8 資材管理",
    source: "平成30年　第13問",
    category: "在庫管理",
    text: "　資材の発注に関する記述として、最も適切なものはどれか。",
    options: [
      "ア　MRPでは、発注量と発注時期を生産計画と独立に決定できる。",
      "イ　定期発注方式における発注量は、（発注間隔+調達期間）中の需要推定量-発注残-手持在庫量-安全在庫量で求められる。",
      "ウ　発注間隔を長くすることにより、きめの細かい在庫管理ができ在庫量が減少する。",
      "エ　発注点は、調達期間中の払出量の大きさと不確実性を考慮して決定される。"
    ],
    answerIndex: 3,
    explanation: `解答：エ
ここが重要
　本問は、資材管理について問われています。
　資材管理に関する基礎的な知識を押さえている方であれば、容易に正解できる問題です。
　まずは資材管理について、全般的に復習しておきましょう。

　では、選択肢をみていきましょう。
選択肢アですが、MRP（Material Requirement Planning：資材所要量計画）とは、製品の生産計画をもとに、資材の所要量と時期を計画するための仕組みです。生産計画、発注量、発注時期は密接に関連していることが特徴であり、これらを独立して決定することはできません。よって、アは不適切です。

選択肢イですが、定期発注方式は、一定期間ごと、その都度発注量を決めて発注します。この方式では、発注のたびに、需要の予測や在庫量を考慮して発注量を決定します。発注量を求める式は、次のようになります。
　　発注量＝在庫調整期間の需要予測量－現在の在庫量－発注残＋安全在庫
ここで、在庫調整期間は、発注サイクルと、調達リードタイムをあわせた期間を表します。また、安全在庫は足す必要があります。本肢では安全在庫量を引いているため不適切です。

選択肢ウですが、発注間隔を長くすると、1回あたりの発注量を多くする必要があります。そうすると、需要の変動によって欠品が生じたり、過剰在庫を抱えたりして、健全な在庫管理とは言えない状態になります。きめ細かい在庫管理をするには、発注間隔を短くすることが重要です。よって、ウは不適切です。

選択肢エですが、発注点とは、この時点まで在庫が減った場合に発注を行う在庫量です。実際には、発注してもすぐに調達はできず、調達リードタイムの期間が経過した後に、在庫が入庫します。そのため、発注点を決める際には、調達リードタイムの間の需要量を考慮する必要があります。また、需要にはバラツキがありますので、在庫切れを防ぐために安全在庫を残しておく必要があります。発注点を求める式は、次の通りです。
　　発注点＝調達リードタイムＸ1日平均需要量＋安全在庫
調達リードタイムの期間の需要量に、安全在庫を足したものになっていますが、選択肢の記述にある、「調達期間中の払出量の大きさと不確実性を考慮して決定される」ということに合致しています。安全在庫を足す点は、不確実性を考慮した対応と言えます。よって、記述は適切で、エが正解です。

資材管理や発注方式の出題頻度も高くなっています。発注方式には、その種類や計算式が多数ありますが、それを単純に暗記するだけではなく、計算問題などにも対応できるよう、繰り返し学習して習得するようにしましょう。`
  },
  {
    id: "q_9",
    title: "問題 9 内外作区分1",
    source: "令和元年　第15問",
    category: "資材管理",
    text: "ある工程における製品Ａの1個当たりの標準作業時間は0.3時間で、適合品率は90％である。この工程を担当する作業者は5人で、1人1日当たりの実働時間は6 時間、稼働率は90％である。今期、残り10日間に適合品を900個生産しなければならないことが分かっている。この場合にとるべき施策として、最も適切なものはどれか。",
    options: [
      "ア　一部作業の外注化を行う。",
      "イ　次期の仕事を前倒しして行う。",
      "ウ　終業時刻を早めて小集団活動を行う。",
      "エ　特別な施策は必要ない。"
    ],
    answerIndex: 0,
    explanation: `解答：ア
ここが重要
本問は、内外製区分に関する問題です。比較的単純な計算問題であることから難易度は高くありません。計算式を検討するにあたってうっかりミスに注意したい問題です。

まず、条件にもとづいて、残り10日間に5人で生産可能な個数を求めましょう。
10日間に5人で生産可能な個数＝（1人1日当たりの実働時間×稼働率×適合品率×5人）/1個当たりの標準作業時間 × 10日間
＝（6時間×稼働率0.9×適合品率0.9×5人）/（標準作業時間0.3時間）× 10日間
＝ 24.3/0.3 × 10日間
＝ 81個 × 10日間
＝ 810個

上記より、10日間で810個しか生産できないため、必要生産量である900個に対して90個足りません。
従って、不足分を補うための施策として、選択肢アの「一部作業の外注化を行う」が正解となります。`
  },
  {
    id: "q_10",
    title: "問題 10 内外作区分2",
    source: "平成28年　第12問",
    category: "資材管理",
    text: "　内外作区分に関連する記述として、最も不適切なものはどれか。",
    options: [
      "ア　一過性の需要に対応するためには、生産設備を増強して、内作で対応することが好ましい。",
      "イ　自社が特殊な技術を持っており、その優位性を維持するためには、該当する部品を継続的に内作することが好ましい。",
      "ウ　特許技術のような特に優れた技術を他社が持っている場合には、外作することが好ましい。",
      "エ　秘密性や重要性が低い部品で、自社において稼働率が低く、コストが引き合わないときには外作することが好ましい。"
    ],
    answerIndex: 0,
    explanation: `解答：ア
ここが重要
　内外作区分に関する問題です。外注を利用する目的に関する基本的な内容ですので、確実に正解したい問題です。
　まずは、内作に適している場合と外作に適している場合について簡単に復習しましょう。

 「内作に適している場合」と「外作に適している場合」
　内作に適しているのは、自社が競争優位な技術を持っている場合、コスト面、納期面で自社が有利な場合などです。
　外作に適しているのは、コスト面で外注した方が安い場合、自社にない生産設備や専門技術が必要な場合、自社の生産能力が足らないような場合などです。

　では、選択肢を見ていきましょう。
選択肢アについて、自社で一過性の需要に対応するために設備を増強すると、将来の設備稼働率の低下やコスト増加につながります。この場合は外作（外注）に適しています。よって、選択肢アは不適切です。

選択肢イについて、優位性を有する特殊技術に該当する部品を外作すると、他社が特殊技術を模倣するリスクがあります。自社の優位性が損なわれるため、継続的に内作することが望ましいです。よって、選択肢イは適切です。

選択肢ウについて、特許技術のような特に優れた技術を他社が持っている場合、それを上回る技術を自社で開発するより、他社が持っている技術を活用して外作するほうがコスト面で有利になります。よって、選択肢ウは適切です。

選択肢エについて、自社でコストが引き合わず、外作しても自社の競争優位性に影響がない場合には外作したほうが有利です。よって、選択肢エは適切です。`
  }
];

// --- SVG COMPONENTS FOR GRAPHICS ---

// 問題2用 部品構成表 (BOMツリー)
const BOMTreeSVG = ({ highlightRoute = false }) => {
  return (
    <svg viewBox="0 0 800 270" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 shadow-inner">
      <rect x="370" y="15" width="60" height="28" fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="4" />
      <text x="400" y="33" fill="#f8fafc" className="text-xs font-bold" textAnchor="middle">Z</text>

      <path d="M 400 43 L 400 58 L 240 58 L 240 75" fill="none" stroke="#64748b" strokeWidth="1.5" />
      <path d="M 400 43 L 400 58 L 560 58 L 560 75" fill="none" stroke="#64748b" strokeWidth="1.5" />

      {/* X(2) */}
      <rect x="210" y="75" width="60" height="28" fill="#1e293b" stroke={highlightRoute ? "#f43f5e" : "#475569"} strokeWidth={highlightRoute ? "2.5" : "1.5"} rx="4" />
      <text x="240" y="93" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">X (2)</text>

      {/* Y(1) */}
      <rect x="530" y="75" width="60" height="28" fill="#1e293b" stroke={highlightRoute ? "#ef4444" : "#475569"} strokeWidth={highlightRoute ? "2.5" : "1.5"} rx="4" />
      <text x="560" y="93" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">Y (1)</text>

      {/* X lines to P, Q, R */}
      <path d="M 240 103 L 240 118 L 110 118 L 110 135" fill="none" stroke="#64748b" strokeWidth="1.5" />
      <path d="M 240 103 L 240 135" fill="none" stroke="#64748b" strokeWidth="1.5" />
      <path d="M 240 103 L 240 118 L 370 118 L 370 135" fill="none" stroke="#64748b" strokeWidth="1.5" />

      {/* P(1) */}
      <rect x="80" y="135" width="60" height="28" fill="#1e293b" stroke={highlightRoute ? "#f43f5e" : "#475569"} strokeWidth={highlightRoute ? "2.5" : "1.5"} rx="4" />
      <text x="110" y="153" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">P (1)</text>

      {/* Q(3) */}
      <rect x="210" y="135" width="60" height="28" fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="4" />
      <text x="240" y="153" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">Q (3)</text>

      {/* R(3) */}
      <rect x="340" y="135" width="60" height="28" fill="#1e293b" stroke={highlightRoute ? "#f43f5e" : "#475569"} strokeWidth={highlightRoute ? "2.5" : "1.5"} rx="4" />
      <text x="370" y="153" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">R (3)</text>

      {/* Y lines to S, T */}
      <path d="M 560 103 L 560 118 L 470 118 L 470 135" fill="none" stroke="#64748b" strokeWidth="1.5" />
      <path d="M 560 103 L 560 118 L 670 118 L 670 135" fill="none" stroke="#64748b" strokeWidth="1.5" />

      {/* S(5) */}
      <rect x="440" y="135" width="60" height="28" fill="#1e293b" stroke={highlightRoute ? "#ef4444" : "#475569"} strokeWidth={highlightRoute ? "2.5" : "1.5"} rx="4" />
      <text x="470" y="153" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">S (5)</text>

      {/* T(10) */}
      <rect x="640" y="135" width="60" height="28" fill="#1e293b" stroke={highlightRoute ? "#ef4444" : "#475569"} strokeWidth={highlightRoute ? "2.5" : "1.5"} rx="4" />
      <text x="670" y="153" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">T (10)</text>

      {/* P lines to A, B */}
      <path d="M 110 163 L 110 178 L 70 178 L 70 195" fill="none" stroke="#64748b" strokeWidth="1.5" />
      <path d="M 110 163 L 110 178 L 150 178 L 150 195" fill="none" stroke="#64748b" strokeWidth="1.5" />
      
      {/* A(5) */}
      <rect x="40" y="195" width="60" height="28" fill={highlightRoute ? "#881337" : "#1e1b4b"} stroke={highlightRoute ? "#f43f5e" : "#4f46e5"} strokeWidth="2" rx="4" />
      <text x="70" y="213" fill={highlightRoute ? "#fecdd3" : "#c7d2fe"} className="text-[10px] font-bold" textAnchor="middle">A (5)</text>

      {/* B(2) */}
      <rect x="120" y="195" width="60" height="28" fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="4" />
      <text x="150" y="213" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">B (2)</text>

      {/* Q lines to C */}
      <path d="M 240 163 L 240 195" fill="none" stroke="#64748b" strokeWidth="1.5" />
      <rect x="210" y="195" width="60" height="28" fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="4" />
      <text x="240" y="213" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">C (4)</text>

      {/* R lines to A */}
      <path d="M 370 163 L 370 195" fill="none" stroke="#64748b" strokeWidth="1.5" />
      <rect x="340" y="195" width="60" height="28" fill={highlightRoute ? "#881337" : "#1e1b4b"} stroke={highlightRoute ? "#f43f5e" : "#4f46e5"} strokeWidth="2" rx="4" />
      <text x="370" y="213" fill={highlightRoute ? "#fecdd3" : "#c7d2fe"} className="text-[10px] font-bold" textAnchor="middle">A (2)</text>

      {/* S lines to A, B */}
      <path d="M 470 163 L 470 178 L 430 178 L 430 195" fill="none" stroke="#64748b" strokeWidth="1.5" />
      <path d="M 470 163 L 470 178 L 510 178 L 510 195" fill="none" stroke="#64748b" strokeWidth="1.5" />
      
      {/* A(2) */}
      <rect x="400" y="195" width="60" height="28" fill={highlightRoute ? "#881337" : "#1e1b4b"} stroke={highlightRoute ? "#ef4444" : "#4f46e5"} strokeWidth="2" rx="4" />
      <text x="430" y="213" fill={highlightRoute ? "#fecdd3" : "#c7d2fe"} className="text-[10px] font-bold" textAnchor="middle">A (2)</text>

      {/* B(1) */}
      <rect x="480" y="195" width="60" height="28" fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="4" />
      <text x="510" y="213" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">B (1)</text>

      {/* T lines to A, B, C */}
      <path d="M 670 163 L 670 178 L 610 178 L 610 195" fill="none" stroke="#64748b" strokeWidth="1.5" />
      <path d="M 670 163 L 670 195" fill="none" stroke="#64748b" strokeWidth="1.5" />
      <path d="M 670 163 L 670 178 L 730 178 L 730 195" fill="none" stroke="#64748b" strokeWidth="1.5" />

      {/* A(5) */}
      <rect x="580" y="195" width="60" height="28" fill={highlightRoute ? "#881337" : "#1e1b4b"} stroke={highlightRoute ? "#ef4444" : "#4f46e5"} strokeWidth="2" rx="4" />
      <text x="610" y="213" fill={highlightRoute ? "#fecdd3" : "#c7d2fe"} className="text-[10px] font-bold" textAnchor="middle">A (5)</text>

      {/* B(2) */}
      <rect x="650" y="195" width="60" height="28" fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="4" />
      <text x="680" y="213" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">B (2)</text>

      {/* C(3) */}
      <rect x="710" y="195" width="60" height="28" fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="4" />
      <text x="740" y="213" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">C (3)</text>
    </svg>
  );
};

// 問題3解説用 ストラクチャ型部品表ツリー
const StructureBOMTreeSVG = () => {
  return (
    <svg viewBox="0 0 600 240" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 shadow-inner">
      {/* X node */}
      <rect x="260" y="15" width="80" height="28" fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="4" />
      <text x="300" y="32" fill="#f8fafc" className="text-xs font-bold" textAnchor="middle">製品 X</text>

      {/* X lines to A, B, C, D */}
      <path d="M 300 43 L 300 60 L 100 60 L 100 80" fill="none" stroke="#64748b" strokeWidth="1.5" />
      <path d="M 300 43 L 300 60 L 230 60 L 230 80" fill="none" stroke="#64748b" strokeWidth="1.5" />
      <path d="M 300 43 L 300 60 L 370 60 L 370 80" fill="none" stroke="#64748b" strokeWidth="1.5" />
      <path d="M 300 43 L 300 60 L 500 60 L 500 80" fill="none" stroke="#64748b" strokeWidth="1.5" />

      {/* A node */}
      <rect x="60" y="80" width="80" height="28" fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="4" />
      <text x="100" y="97" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">部品 A</text>
      <text x="100" y="123" fill="#cbd5e1" className="text-[9px]" textAnchor="middle">1</text>

      {/* B node */}
      <rect x="190" y="80" width="80" height="28" fill="#1e293b" stroke="#ef4444" strokeWidth="2" rx="4" />
      <text x="230" y="97" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">部品 B</text>
      <text x="230" y="123" fill="#ef4444" className="text-[9px] font-bold" textAnchor="middle">2</text>

      {/* C node */}
      <rect x="330" y="80" width="80" height="28" fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="4" />
      <text x="370" y="97" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">部品 C</text>
      <text x="370" y="123" fill="#cbd5e1" className="text-[9px]" textAnchor="middle">2</text>

      {/* D node */}
      <rect x="460" y="80" width="80" height="28" fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="4" />
      <text x="500" y="97" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">部品 D</text>
      <text x="500" y="123" fill="#cbd5e1" className="text-[9px]" textAnchor="middle">2</text>

      {/* B lines to child C, D */}
      <path d="M 230 128 L 230 143 L 170 143 L 170 160" fill="none" stroke="#ef4444" strokeWidth="1.5" />
      <path d="M 230 128 L 230 143 L 290 143 L 290 160" fill="none" stroke="#ef4444" strokeWidth="1.5" />

      {/* Child C under B */}
      <rect x="130" y="160" width="80" height="28" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" rx="4" />
      <text x="170" y="177" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">部品 C</text>
      <text x="170" y="202" fill="#cbd5e1" className="text-[9px]" textAnchor="middle">2 (1 × 2)</text>

      {/* Child D under B */}
      <rect x="250" y="160" width="80" height="28" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" rx="4" />
      <text x="290" y="177" fill="#f8fafc" className="text-[10px] font-bold" textAnchor="middle">部品 D</text>
      <text x="290" y="202" fill="#cbd5e1" className="text-[9px]" textAnchor="middle">4 (2 × 2)</text>
    </svg>
  );
};

// 問題6用数式コンポーネント (HTML/CSS)
const MathFormula = ({ prefix, numerator, denominator, simpleTerm }) => {
  return (
    <div className="flex items-center gap-1 text-slate-100 font-serif text-sm">
      <span className="font-bold font-sans mr-2 text-slate-400">{prefix}</span>
      <span>Q</span>
      <span className="mx-1 font-sans text-xs">=</span>
      <div className="flex items-center gap-0.5">
        <span className="text-2xl font-light text-slate-400">√</span>
        {simpleTerm ? (
          <span className="border-t border-slate-400 pl-1 pt-0.5">{simpleTerm}</span>
        ) : (
          <div className="border-t border-slate-400 pl-1 pt-0.5 flex flex-col items-center leading-none">
            <span className="border-b border-slate-600 pb-0.5 px-1 text-xs">{numerator}</span>
            <span className="pt-0.5 px-1 text-xs">{denominator}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// 定量発注方式イメージ図 (問題7解説用)
const ConstantOrderQuantitySVG = () => {
  return (
    <svg viewBox="0 0 620 380" className="w-full max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-inner">
      <text x="310" y="25" fill="#f8fafc" className="text-sm font-black" textAnchor="middle">◆ 経済的発注量 (コスト曲線)</text>

      {/* 軸 */}
      <line x1="120" y1="60" x2="120" y2="300" stroke="#f1f5f9" strokeWidth="2" />
      <path d="M 120 50 L 116 62 L 124 62 Z" fill="#f1f5f9" />
      <text x="110" y="65" fill="#f1f5f9" className="text-[10px] font-bold" textAnchor="end">費用</text>

      <line x1="120" y1="300" x2="520" y2="300" stroke="#f1f5f9" strokeWidth="2" />
      <path d="M 530 300 L 518 296 L 518 304 Z" fill="#f1f5f9" />
      <text x="530" y="322" fill="#f1f5f9" className="text-[10px] font-bold" textAnchor="middle">発注量</text>

      {/* 在庫保管費用 (直線) */}
      <line x1="120" y1="300" x2="480" y2="150" stroke="#1d4ed8" strokeWidth="2" />
      <text x="490" y="162" fill="#3b82f6" className="text-[10px] font-bold">在庫保管費用</text>

      {/* 発注費用 (反比例曲線) */}
      <path d="M 150 90 Q 200 230 480 250" fill="none" stroke="#15803d" strokeWidth="2" />
      <text x="490" y="240" fill="#22c55e" className="text-[10px] font-bold">発注費用</text>

      {/* 在庫総費用 (U字曲線) */}
      <path d="M 157 70 Q 260 270 480 190" fill="none" stroke="#b91c1c" strokeWidth="2.5" />
      <text x="490" y="180" fill="#f87171" className="text-[10px] font-bold">在庫総費用</text>

      {/* 交点 */}
      <line x1="260" y1="180" x2="260" y2="300" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3,3" />
      <text x="260" y="322" fill="#cbd5e1" className="text-[10px] font-bold" textAnchor="middle">経済的発注量</text>
    </svg>
  );
};

// 定期発注方式イメージ図 (問題8解説用)
const PeriodicReplenishmentSVG = () => {
  return (
    <svg viewBox="0 0 620 380" className="w-full max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-inner">
      <text x="310" y="25" fill="#f8fafc" className="text-sm font-black" textAnchor="middle">◆ 定期発注方式の在庫推移</text>

      {/* 軸 */}
      <line x1="120" y1="60" x2="120" y2="300" stroke="#f1f5f9" strokeWidth="2" />
      <path d="M 120 50 L 116 62 L 124 62 Z" fill="#f1f5f9" />
      <text x="110" y="65" fill="#f1f5f9" className="text-[10px] font-bold" textAnchor="end">在庫量</text>

      <line x1="120" y1="300" x2="520" y2="300" stroke="#f1f5f9" strokeWidth="2" />
      <path d="M 530 300 L 518 296 L 518 304 Z" fill="#f1f5f9" />
      <text x="530" y="322" fill="#f1f5f9" className="text-[10px] font-bold" textAnchor="middle">時間</text>

      {/* 安全在庫点線 */}
      <line x1="120" y1="250" x2="500" y2="250" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
      <text x="110" y="254" fill="#cbd5e1" className="text-[10px] font-bold" textAnchor="end">安全在庫</text>

      {/* 在庫曲線 */}
      <path
        d="M 160 130 L 270 260 L 270 120 L 380 260 L 380 120 L 470 230"
        fill="none"
        stroke="#ef4444"
        strokeWidth="3.5"
      />

      {/* 定期発注点(三角マーカー) */}
      <polygon points="210,300 205,310 215,310" fill="#3b82f6" />
      <line x1="210" y1="188" x2="210" y2="300" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="210" cy="188" r="4" fill="#3b82f6" />

      {/* 吹き出し: 発注 */}
      <g transform="translate(130, 312)">
        <rect width="64" height="28" fill="#fcd34d" stroke="#f59e0b" rx="14" />
        <text x="32" y="18" fill="#78350f" className="text-[10px] font-black" textAnchor="middle">発注</text>
      </g>
      <path d="M 202 305 L 190 316 L 198 316 Z" fill="#fcd34d" stroke="#f59e0b" strokeWidth="1" />

      {/* x=320 で発注 */}
      <polygon points="320,300 315,310 325,310" fill="#3b82f6" />
      <line x1="320" y1="180" x2="320" y2="300" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="320" cy="180" r="4" fill="#3b82f6" />

      {/* x=430 で発注 */}
      <polygon points="430,300 425,310 435,310" fill="#3b82f6" />
      <line x1="430" y1="180" x2="430" y2="300" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="430" cy="180" r="4" fill="#3b82f6" />

      {/* 納入縦線 */}
      <line x1="270" y1="120" x2="270" y2="300" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
      <line x1="380" y1="120" x2="380" y2="300" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />

      {/* 発注量の図示 */}
      <path d="M 255 120 L 250 120 L 250 260 L 255 260" fill="none" stroke="#cbd5e1" strokeWidth="1" />
      <text x="240" y="195" fill="#f1f5f9" className="text-[10px] font-black" textAnchor="end">発注量</text>

      {/* 各期間のブラケット */}
      <path d="M 210 205 L 210 200 L 320 200 L 320 205" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
      <text x="265" y="192" fill="#60a5fa" className="text-[9px] font-bold" textAnchor="middle">発注サイクル</text>

      <path d="M 320 205 L 320 200 L 380 200 L 380 205" fill="none" stroke="#10b981" strokeWidth="1.5" />
      <text x="350" y="192" fill="#34d399" className="text-[9px] font-bold" textAnchor="middle">調達リードタイム</text>

      {/* 在庫調整期間: 210 から 380 */}
      <path d="M 210 325 L 210 330 L 380 330 L 380 325" fill="none" stroke="#ef4444" strokeWidth="1.5" />
      <text x="295" y="348" fill="#f87171" className="text-[10px] font-black" textAnchor="middle">在庫調整期間</text>
    </svg>
  );
};

// 経済的発注量の数式解説用
const FormulaEoqBig = () => (
  <div className="flex items-center justify-center gap-2 text-slate-200 font-sans my-4 p-3 bg-slate-900 border border-slate-800 rounded-lg max-w-md mx-auto">
    <span className="font-bold text-sm">経済的発注量</span>
    <span className="text-sm font-bold">=</span>
    <div className="flex items-center gap-0.5">
      <span className="text-2xl font-light text-slate-400">√</span>
      <div className="border-t border-slate-400 pl-1 pt-1 flex flex-col items-center">
        <span className="text-[10px] border-b border-slate-600 pb-0.5 px-2">2 × 1回あたりの発注費用 × 年間需要量</span>
        <span className="text-[10px] pt-0.5 px-2">1個あたりの年間在庫維持費用</span>
      </div>
    </div>
  </div>
);

// --- APP COMPONENT ---
export default function App() {
  // 状態管理
  const [userId, setUserId] = useState("");
  const [inputUserId, setInputUserId] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [screen, setScreen] = useState("dashboard"); // "dashboard" | "quiz" | "summary"
  const [currentMode, setCurrentMode] = useState("all"); // "all" | "wrong" | "review"
  
  // クイズ回答用状態
  const [quizList, setQuizList] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // 学習履歴同期用状態
  const [progress, setProgress] = useState({
    progressIndex: 0,
    progressMode: "all",
    history: {}, // { questionId: { correct: boolean, timestamp: string } }
    reviews: {}  // { questionId: boolean }
  });

  // 途中再開モーダルの割り込みガードレール用
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pendingProgress, setPendingProgress] = useState(null);

  // screenRef の定義 (回答中の途中再開ダイアログ再割り込みバグを防止)
  const screenRef = useRef(screen);
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  // 初回読み込み判定 Ref
  const isFirstLoad = useRef(true);
  useEffect(() => {
    if (userId) {
      isFirstLoad.current = true;
    }
  }, [userId]);

  // Firebaseの匿名認証
  useEffect(() => {
    const runAuth = async () => {
      if (auth) {
        try {
          console.log("Starting anonymous auth...");
          await signInAnonymously(auth);
          console.log("Anonymous auth succeeded");
        } catch (e) {
          console.error("Anonymous authentication error:", e);
        }
      }
      setIsAuthLoading(false);
    };
    runAuth();
  }, []);

  // 履歴復元 (ユーザーが合言葉を入力したタイミングでFirestoreまたはLocalStorageから取得)
  const loadUserData = async (targetUserId) => {
    if (!targetUserId.trim()) return;
    setIsAuthLoading(true);
    console.log(`Fetching progress data for user: ${targetUserId}`);
    
    let dbData = null;
    
    // 1. Firestore からの取得試行
    if (db) {
      try {
        const docRef = doc(db, "users", `${APP_ID}_${targetUserId}`);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          dbData = snap.data();
          console.log("Firestore progress data successfully fetched:", dbData);
        } else {
          console.log("No data found in Firestore for this user, fallback to initial state.");
        }
      } catch (e) {
        console.error("Firestore read error. Attempting Local Storage fallback.", e);
      }
    }

    // 2. ローカルストレージからのフォールバック
    if (!dbData) {
      try {
        const localKey = `${APP_ID}_${targetUserId}_progress`;
        const localDataRaw = localStorage.getItem(localKey);
        if (localDataRaw) {
          dbData = JSON.parse(localDataRaw);
          console.log("Local Storage progress data successfully fetched:", dbData);
        }
      } catch (e) {
        console.error("Local Storage read error:", e);
      }
    }

    // 3. データ適用と画面切り替え
    const loadedProgress = {
      progressIndex: Number(dbData?.progressIndex || 0),
      progressMode: dbData?.progressMode || "all",
      history: dbData?.history || {},
      reviews: dbData?.reviews || {}
    };

    setProgress(loadedProgress);
    setUserId(targetUserId);
    setIsAuthenticated(true);
    setIsAuthLoading(false);

    // 初回ロード時かつダッシュボードにいるときだけ途中再開ダイアログのポップアップ判断
    if (loadedProgress.progressIndex > 0) {
      console.log(`Pending progress index ${loadedProgress.progressIndex} detected for restore.`);
      setPendingProgress(loadedProgress);
      setShowResumeModal(true);
    }

    // 4. Firestore リアルタイム同期監視の開始
    if (db) {
      const docRef = doc(db, "users", `${APP_ID}_${targetUserId}`);
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data();
          const parsed = {
            progressIndex: Number(remoteData.progressIndex || 0),
            progressMode: remoteData.progressMode || "all",
            history: remoteData.history || {},
            reviews: remoteData.reviews || {}
          };
          
          // ガードレール：初回かつダッシュボード画面のときのみポップアップ起動
          if (isFirstLoad.current && screenRef.current === "dashboard") {
            isFirstLoad.current = false;
            if (parsed.progressIndex > 0) {
              console.log("onSnapshot triggering restore modal popup.");
              setPendingProgress(parsed);
              setShowResumeModal(true);
              return;
            }
          }
          // すでに画面遷移している場合や初回起動以外は、再割り込みダイアログを表示せず、進捗のみを更新する
          setProgress(parsed);
        }
      }, (err) => {
        console.error("onSnapshot error:", err);
      });

      return () => unsubscribe();
    }
  };

  // 進捗データを保存する共通ロジック
  const saveProgress = async (newProgress) => {
    if (!userId) return;
    
    // ローカル状態への即時反映
    setProgress(newProgress);

    // ローカルストレージへの書き込み
    try {
      localStorage.setItem(`${APP_ID}_${userId}_progress`, JSON.stringify(newProgress));
    } catch (e) {
      console.error("LocalStorage write error:", e);
    }

    // Firestoreへの書き込み
    if (db) {
      try {
        const docRef = doc(db, "users", `${APP_ID}_${userId}`);
        await setDoc(docRef, newProgress, { merge: true });
        console.log("Progress saved to Firestore:", newProgress);
      } catch (e) {
        console.error("Firestore write error:", e);
      }
    }
  };

  // 出題クイズリストの構築
  const startQuiz = (mode) => {
    let filteredList = [];
    if (mode === "all") {
      filteredList = [...QUESTIONS];
    } else if (mode === "wrong") {
      filteredList = QUESTIONS.filter(q => {
        const hist = progress.history[q.id];
        return hist && hist.correct === false;
      });
    } else if (mode === "review") {
      filteredList = QUESTIONS.filter(q => progress.reviews[q.id] === true);
    }

    if (filteredList.length === 0) {
      alert("該当する問題がありません。別モードを選択してください。");
      return;
    }

    console.log(`Starting quiz with mode: ${mode}, size: ${filteredList.length}`);
    setQuizList(filteredList);
    setCurrentMode(mode);
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScreen("quiz");
  };

  // 途中再開の確認
  const handleResume = (shouldResume) => {
    setShowResumeModal(false);
    if (!pendingProgress) return;

    if (shouldResume) {
      console.log("Restoring from pending progress.");
      const restoredMode = pendingProgress.progressMode;
      let filteredList = [];
      if (restoredMode === "all") {
        filteredList = [...QUESTIONS];
      } else if (restoredMode === "wrong") {
        filteredList = QUESTIONS.filter(q => {
          const hist = pendingProgress.history[q.id];
          return hist && hist.correct === false;
        });
      } else if (restoredMode === "review") {
        filteredList = QUESTIONS.filter(q => pendingProgress.reviews[q.id] === true);
      }

      // インデックスの境界チェック
      const targetIdx = pendingProgress.progressIndex;
      if (filteredList.length > 0 && targetIdx < filteredList.length) {
        setQuizList(filteredList);
        setCurrentMode(restoredMode);
        setCurrentQuizIndex(targetIdx);
        setSelectedOption(null);
        setIsAnswered(false);
        setScreen("quiz");
        console.log(`Restored successfully at Mode: ${restoredMode}, Index: ${targetIdx}`);
      } else {
        console.log("Failed to restore: filtered list size was smaller than index. Resetting.");
        startQuiz("all");
      }
    } else {
      console.log("User chose to start from beginning. Resetting progress index.");
      const resetProgress = {
        ...progress,
        progressIndex: 0,
        progressMode: "all"
      };
      saveProgress(resetProgress);
    }
    setPendingProgress(null);
  };

  // 解答処理
  const handleOptionClick = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const question = quizList[currentQuizIndex];
    const isCorrect = idx === question.answerIndex;
    
    // 進捗の更新
    const updatedHistory = {
      ...progress.history,
      [question.id]: {
        correct: isCorrect,
        timestamp: new Date().toISOString()
      }
    };

    const nextIndex = currentQuizIndex + 1;
    // 完走した場合は進捗インデックスを 0 にリセット
    const finalProgressIndex = nextIndex >= quizList.length ? 0 : nextIndex;

    const newProgress = {
      ...progress,
      progressIndex: finalProgressIndex,
      progressMode: currentMode,
      history: updatedHistory
    };

    saveProgress(newProgress);
  };

  // 要復習フラグ切り替え
  const toggleReview = (questionId) => {
    const currentVal = progress.reviews[questionId] || false;
    const newProgress = {
      ...progress,
      reviews: {
        ...progress.reviews,
        [questionId]: !currentVal
      }
    };
    saveProgress(newProgress);
  };

  // 次の問題へ
  const handleNextQuestion = () => {
    if (currentQuizIndex + 1 < quizList.length) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // 終了画面へ
      setScreen("summary");
    }
  };

  // ホームに戻る処理
  const handleGoHome = () => {
    setScreen("dashboard");
    setSelectedOption(null);
    setIsAnswered(false);
  };

  // 学習統計指標の算出
  const stats = useMemo(() => {
    const totalCount = QUESTIONS.length;
    const solvedCount = Object.keys(progress.history).length;
    
    // 1. 総合進捗率 (全10問中何問着手したか)
    const progressRate = Math.round((solvedCount / totalCount) * 100) || 0;

    // 2. 全問正解率 (全10問中の正答数)
    const correctCount = QUESTIONS.filter(q => progress.history[q.id]?.correct === true).length;
    const correctRate = Math.round((correctCount / totalCount) * 100) || 0;

    // 3. 回答正確性 (正答数 / 着手済数)
    const accuracy = solvedCount > 0 ? Math.round((correctCount / solvedCount) * 100) : 0;

    // 4. カテゴリ別進捗率
    const cat1Questions = QUESTIONS.filter(q => q.category === "資材管理");
    const cat2Questions = QUESTIONS.filter(q => q.category === "在庫管理");

    const cat1Solved = cat1Questions.filter(q => progress.history[q.id] !== undefined).length;
    const cat2Solved = cat2Questions.filter(q => progress.history[q.id] !== undefined).length;

    const cat1Rate = Math.round((cat1Solved / cat1Questions.length) * 100) || 0;
    const cat2Rate = Math.round((cat2Solved / cat2Questions.length) * 100) || 0;

    return {
      progressRate,
      correctRate,
      accuracy,
      cat1Rate,
      cat2Rate,
      solvedCount,
      correctCount,
      totalCount
    };
  }, [progress]);

  // レーダーチャート用のデータ構築
  const chartData = useMemo(() => {
    return [
      { subject: "総合進捗率", A: stats.progressRate, fullMark: 100 },
      { subject: "全問正解率", A: stats.correctRate, fullMark: 100 },
      { subject: "回答正確性", A: stats.accuracy, fullMark: 100 },
      { subject: "資材管理", A: stats.cat1Rate, fullMark: 100 },
      { subject: "在庫管理", A: stats.cat2Rate, fullMark: 100 }
    ];
  }, [stats]);

  // ローディング画面
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-100 font-sans">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold tracking-wider text-slate-400">進捗を読み込んでいます...</p>
      </div>
    );
  }

  // A. 合言葉入力画面 (未認証時は強制分離してメイン画面を描画させない)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-100 font-sans px-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* 背景の装飾光 */}
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-sky-600/20 rounded-full blur-3xl"></div>

          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <BookOpen className="w-8 h-8 text-indigo-400" />
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-center text-slate-50 tracking-tight mb-2">3-4 過去問セレクト演習</h2>
            <p className="text-xs text-center text-slate-400 mb-8 font-medium">資材・在庫管理 同期システム</p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                loadUserData(inputUserId);
              }}
              className="space-y-5"
            >
              <div>
                <label htmlFor="passphrase" className="block text-xs font-semibold text-slate-400 mb-2 tracking-wider">
                  同期用の合言葉（ユーザーID）
                </label>
                <input
                  id="passphrase"
                  type="text"
                  required
                  placeholder="例: my-study-room"
                  value={inputUserId}
                  onChange={(e) => setInputUserId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold text-sm rounded-xl transition duration-200 transform hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                学習室に入る
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-12">
      {/* ナビゲーションバー */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-indigo-500 to-sky-500 text-transparent bg-clip-text font-black text-lg tracking-wider uppercase">
              3-4 過去問セレクト演習
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              ID: <span className="text-slate-200 font-bold">{userId}</span>
            </span>
            <button 
              onClick={() => {
                setIsAuthenticated(false);
                setUserId("");
                setInputUserId("");
              }}
              className="hover:text-slate-200 flex items-center gap-1 transition"
            >
              閉じる
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {/* B-1. 途中再開モーダル */}
        {showResumeModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center px-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl relative">
              <h3 className="text-lg font-bold text-slate-50 mb-2 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                学習データが見つかりました
              </h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                前回は <span className="text-indigo-400 font-bold">問題{Number(pendingProgress?.progressIndex || 0) + 1}</span> まで進んでいます。<br />
                中断したモードの続きから再開しますか？
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleResume(true)}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-50 text-xs font-semibold rounded-lg transition"
                >
                  続きから再開する
                </button>
                <button
                  onClick={() => handleResume(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
                >
                  最初から始める
                </button>
              </div>
            </div>
          </div>
        )}

        {/* B-2. メインダッシュボード画面 */}
        {screen === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            {/* 上部ウェルカムボード */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 進捗パネルカード */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-50">学習ダッシュボード</h2>
                  <p className="text-xs text-slate-400 mt-1">資材・在庫管理の過去問（令和期中心）を網羅した演習システム</p>
                </div>
                
                {/* 3連カード */}
                <div className="grid grid-cols-3 gap-4 my-6">
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                    <span className="block text-[10px] font-bold text-slate-500 tracking-wider">進捗率</span>
                    <span className="block text-xl font-black text-slate-200 mt-1">{stats.progressRate}%</span>
                    <span className="text-[9px] text-slate-500 mt-1 block">着手済: {stats.solvedCount} / {stats.totalCount}問</span>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                    <span className="block text-[10px] font-bold text-slate-500 tracking-wider">正解率</span>
                    <span className="block text-xl font-black text-indigo-400 mt-1">{stats.correctRate}%</span>
                    <span className="text-[9px] text-slate-500 mt-1 block">正解数: {stats.correctCount} / {stats.totalCount}問</span>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                    <span className="block text-[10px] font-bold text-slate-500 tracking-wider">回答正確性</span>
                    <span className="block text-xl font-black text-sky-400 mt-1">{stats.accuracy}%</span>
                    <span className="text-[9px] text-slate-500 mt-1 block">正答割合</span>
                  </div>
                </div>

                {/* モード選択エリア */}
                <div className="space-y-3">
                  <span className="block text-xs font-bold text-slate-400 tracking-wider">出題モード選択</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => startQuiz("all")}
                      className="py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg transition duration-200 transform hover:scale-[1.01]"
                    >
                      すべての問題 ({stats.totalCount})
                    </button>
                    <button
                      onClick={() => startQuiz("wrong")}
                      className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
                    >
                      前回不正解の問題のみ
                    </button>
                    <button
                      onClick={() => startQuiz("review")}
                      className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
                    >
                      要復習の問題のみ
                    </button>
                  </div>
                </div>
              </div>

              {/* レーダーチャートカード */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
                <h3 className="text-sm font-bold text-slate-400 tracking-wider mb-4 self-start">学習バランス分析</h3>
                <div className="w-full h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" radius="70%" data={chartData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569' }} />
                      <Radar
                        name="進捗"
                        dataKey="A"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 問題一覧グリッド */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-400 tracking-wider mb-6">収録問題一覧と進捗状況</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUESTIONS.map((q, idx) => {
                  const hist = progress.history[q.id];
                  const isReview = progress.reviews[q.id] || false;
                  
                  let badgeColor = "bg-slate-950 text-slate-500 border border-slate-800";
                  let badgeText = "未着手";
                  if (hist) {
                    if (hist.correct) {
                      badgeColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                      badgeText = "正解";
                    } else {
                      badgeColor = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                      badgeText = "不正解";
                    }
                  }

                  return (
                    <div 
                      key={q.id}
                      className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between hover:border-slate-700 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${badgeColor}`}>
                            {badgeText}
                          </span>
                          {isReview && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              要復習
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-bold">{q.source}</span>
                        </div>
                        <span className="block text-xs font-bold text-slate-200 mt-1">
                          {q.title}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setQuizList([q]);
                          setCurrentMode("all");
                          setCurrentQuizIndex(0);
                          setSelectedOption(null);
                          setIsAnswered(false);
                          setScreen("quiz");
                        }}
                        className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-indigo-500/50 hover:bg-slate-800/50 text-slate-400 hover:text-slate-100 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* B-3. 出題クイズ画面 */}
        {screen === "quiz" && quizList.length > 0 && (
          <div className="max-w-3xl mx-auto animate-fadeIn">
            {/* 上部ヘッダー（問題番号、出典） */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-1 rounded-full font-bold">
                  {currentMode === "all" ? "すべての問題" : currentMode === "wrong" ? "不正解の問題" : "要復習の問題"}
                </span>
                <span className="bg-slate-900 text-slate-400 border border-slate-800 text-[10px] px-2.5 py-1 rounded-full font-bold">
                  過去問 {quizList[currentQuizIndex].source}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-bold">
                {currentQuizIndex + 1} / {quizList.length} 問中
              </span>
            </div>

            {/* 問題カード */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
              {/* 問題文 */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-50 leading-relaxed whitespace-pre-wrap">
                  {quizList[currentQuizIndex].title}<br />
                  {quizList[currentQuizIndex].text}
                </h2>
              </div>

              {/* 問題2用：問題文の下に表示するツリー図 */}
              {quizList[currentQuizIndex].id === "q_2" && (
                <div className="my-4">
                  <BOMTreeSVG highlightRoute={isAnswered} />
                </div>
              )}

              {/* 問題3用：問題文の下に表示するテーブル (表1・表2) */}
              {quizList[currentQuizIndex].id === "q_3" && (
                <div className="space-y-4 my-4">
                  {/* 表1 */}
                  <div className="max-w-xs mx-auto">
                    <h5 className="text-[10px] font-bold text-slate-400 mb-1 text-center">表1　製品Xの部品構成</h5>
                    <table className="min-w-full text-[11px] text-slate-300 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-slate-900/60 font-bold border-b border-slate-800">
                          <th className="px-2 py-1 text-center border-r border-slate-800">最終製品</th>
                          <th className="px-2 py-1 text-center border-r border-slate-800">子部品</th>
                          <th className="px-2 py-1 text-center">数量（個）</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-800/60">
                          <td rowSpan={4} className="px-2 py-1 text-center font-bold border-r border-slate-800 bg-slate-900/10">X</td>
                          <td className="px-2 py-1 text-center border-r border-slate-800">A</td>
                          <td className="px-2 py-1 text-center">1</td>
                        </tr>
                        <tr className="border-b border-slate-800/60">
                          <td className="px-2 py-1 text-center border-r border-slate-800">B</td>
                          <td className="px-2 py-1 text-center">2</td>
                        </tr>
                        <tr className="border-b border-slate-800/60">
                          <td className="px-2 py-1 text-center border-r border-slate-800">C</td>
                          <td className="px-2 py-1 text-center">2</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-1 text-center border-r border-slate-800">D</td>
                          <td className="px-2 py-1 text-center">2</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 表2 */}
                  <div className="max-w-xs mx-auto">
                    <h5 className="text-[10px] font-bold text-slate-400 mb-1 text-center">表2　部品Bの部品構成</h5>
                    <table className="min-w-full text-[11px] text-slate-300 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-slate-900/60 font-bold border-b border-slate-800">
                          <th className="px-2 py-1 text-center border-r border-slate-800">部品</th>
                          <th className="px-2 py-1 text-center border-r border-slate-800">子部品</th>
                          <th className="px-2 py-1 text-center">数量（個）</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-800/60">
                          <td rowSpan={2} className="px-2 py-1 text-center font-bold border-r border-slate-800 bg-slate-900/10">B</td>
                          <td className="px-2 py-1 text-center border-r border-slate-800">C</td>
                          <td className="px-2 py-1 text-center">1</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-1 text-center border-r border-slate-800">D</td>
                          <td className="px-2 py-1 text-center">2</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 選択肢ボタン群 */}
              <div className="grid grid-cols-1 gap-3">
                {quizList[currentQuizIndex].options.map((opt, idx) => {
                  const isCorrectAnswer = idx === quizList[currentQuizIndex].answerIndex;
                  const isSelected = idx === selectedOption;
                  
                  let buttonStyle = "border-slate-800 bg-slate-950/40 hover:bg-slate-800/30 hover:border-slate-700 text-slate-200";
                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      buttonStyle = "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
                    } else if (isSelected) {
                      buttonStyle = "border-rose-500/30 bg-rose-500/10 text-rose-300";
                    } else {
                      buttonStyle = "border-slate-900 bg-slate-950/10 text-slate-500 opacity-60";
                    }
                  }

                  const renderOptionContent = () => {
                    if (quizList[currentQuizIndex].id === "q_6") {
                      if (idx === 0) return <MathFormula prefix="ア" numerator="2dh" denominator="c" />;
                      if (idx === 1) return <MathFormula prefix="イ" simpleTerm="2dch" />;
                      if (idx === 2) return <MathFormula prefix="ウ" numerator="2ch" denominator="d" />;
                      if (idx === 3) return <MathFormula prefix="エ" numerator="2dc" denominator="h" />;
                    }
                    return <span>{opt}</span>;
                  };

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={isAnswered}
                      className={`w-full py-3 px-4 border rounded-xl text-left text-xs font-bold transition flex items-center justify-between ${buttonStyle}`}
                    >
                      {renderOptionContent()}
                      {isAnswered && isCorrectAnswer && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      )}
                      {isAnswered && isSelected && !isCorrectAnswer && (
                        <X className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 回答・解説展開エリア */}
              {isAnswered && (
                <div className="border-t border-slate-800 pt-6 mt-6 space-y-6 animate-slideUp">
                  {/* 正誤結果判定バッジ */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedOption === quizList[currentQuizIndex].answerIndex ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                          <Check className="w-3.5 h-3.5" /> 正解
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
                          <X className="w-3.5 h-3.5" /> 不正解
                        </span>
                      )}
                    </div>

                    {/* 要復習のチェックマーク */}
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-400 cursor-pointer hover:text-slate-200 select-none">
                      <input
                        type="checkbox"
                        checked={progress.reviews[quizList[currentQuizIndex].id] || false}
                        onChange={() => toggleReview(quizList[currentQuizIndex].id)}
                        className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                      />
                      要復習リストに追加
                    </label>
                  </div>

                  {/* 解説レジュメ表示 */}
                  <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-xl text-xs text-slate-300 leading-relaxed space-y-4">
                    <div className="flex items-center gap-1 text-slate-100 font-bold border-b border-slate-800 pb-2 mb-2">
                      <HelpCircle className="w-4 h-4 text-indigo-400" />
                      <span>解説レジュメ</span>
                    </div>

                    {/* 問題別の図表のインラインSVG/テーブル再現 */}
                    {quizList[currentQuizIndex].id === "q_2" && (
                      <div className="my-4">
                        <BOMTreeSVG highlightRoute={true} />
                      </div>
                    )}

                    {quizList[currentQuizIndex].id === "q_3" && (
                      <div className="my-4 space-y-4">
                        <h5 className="text-[10px] font-bold text-slate-500 text-center">【製品Xのストラクチャ型部品表ツリー】</h5>
                        <StructureBOMTreeSVG />
                      </div>
                    )}

                    {quizList[currentQuizIndex].id === "q_4" && (
                      <div className="my-4 overflow-x-auto">
                        <table className="min-w-full text-[11px] text-slate-300 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                          <thead>
                            <tr className="bg-slate-950 font-bold border-b border-slate-800">
                              <th className="px-3 py-2 text-left border-r border-slate-800">発注方式</th>
                              <th className="px-3 py-2 text-left border-r border-slate-800">発注点と発注量</th>
                              <th className="px-3 py-2 text-left">対象品目・特徴</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-slate-800/60">
                              <td className="px-3 py-2 font-bold border-r border-slate-800">ダブルビン方式</td>
                              <td className="px-3 py-2 border-r border-slate-800">2つの入れ物を用意し、一方が空になったら1つの容量分を発注する。</td>
                              <td className="px-3 py-2">単価が安い小物などに適している。簡易的な管理方法。</td>
                            </tr>
                            <tr className="border-b border-slate-800/60">
                              <td className="px-3 py-2 font-bold border-r border-slate-800">定量発注方式</td>
                              <td className="px-3 py-2 border-r border-slate-800">在庫量が発注点を下回ったら、毎回同じ量（経済発注量）を発注する。</td>
                              <td className="px-3 py-2">需要が安定しており、単価が低い品目に適している。</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 font-bold border-r border-slate-800">定期発注方式</td>
                              <td className="px-3 py-2 border-r border-slate-800">一定期間ごとにその都度、必要な発注量を計算して発注する。</td>
                              <td className="px-3 py-2">単価が高く、在庫調整の必要性が高い品目に適している。</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    {quizList[currentQuizIndex].id === "q_6" && (
                      <div className="my-4">
                        <h5 className="text-[10px] font-bold text-slate-500 text-center mb-1">【経済的発注量(EOQ)の公式】</h5>
                        <FormulaEoqBig />
                      </div>
                    )}

                    {quizList[currentQuizIndex].id === "q_7" && (
                      <div className="my-4">
                        <ConstantOrderQuantitySVG />
                      </div>
                    )}

                    {quizList[currentQuizIndex].id === "q_8" && (
                      <div className="my-4">
                        <PeriodicReplenishmentSVG />
                      </div>
                    )}

                    <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-sans mt-2">
                      {quizList[currentQuizIndex].explanation}
                    </div>
                  </div>

                  {/* 次へ進むアクションエリア */}
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleNextQuestion}
                      className="py-3 px-6 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition animate-pulse"
                    >
                      {currentQuizIndex + 1 === quizList.length ? "結果を確認する" : "次の問題に進む"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ホームへ戻るアクションボタン */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleGoHome}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-300 transition"
              >
                <Home className="w-4 h-4" />
                ダッシュボード（ホーム）に戻る
              </button>
            </div>
          </div>
        )}

        {/* B-4. クイズ完走後のサマリー画面 */}
        {screen === "summary" && (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden animate-fadeIn">
            {/* 装飾 */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-sky-600/20 rounded-full blur-3xl"></div>

            <div className="relative text-center space-y-6">
              <div className="inline-flex p-4 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-2">
                <BarChart2 className="w-10 h-10 text-indigo-400 animate-pulse" />
              </div>

              <h2 className="text-xl font-extrabold text-slate-50 tracking-tight">お疲れ様でした！</h2>
              <p className="text-xs text-slate-400 leading-relaxed px-4">
                今回の出題モードに登録されたすべての問題を解き終えました。
              </p>

              {/* 簡単な結果統計 */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 grid grid-cols-2 gap-4">
                <div className="text-center border-r border-slate-800">
                  <span className="block text-[9px] font-bold text-slate-500 tracking-wider">今回解いた数</span>
                  <span className="block text-lg font-black text-slate-200 mt-1">{quizList.length}問</span>
                </div>
                <div className="text-center">
                  <span className="block text-[9px] font-bold text-slate-500 tracking-wider">現在の総進捗</span>
                  <span className="block text-lg font-black text-indigo-400 mt-1">{stats.progressRate}%</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={handleGoHome}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs rounded-xl transition duration-200 transform hover:scale-[1.01] flex items-center justify-center gap-1.5"
                >
                  <Home className="w-4 h-4" />
                  ダッシュボードに戻る
                </button>
                <button
                  onClick={() => startQuiz(currentMode)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  同じモードで再挑戦
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
