// npm install lucide-react recharts firebase

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { 
  BookOpen, 
  Check, 
  X, 
  RefreshCw, 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  ChevronRight, 
  Home, 
  BarChart2, 
  User, 
  AlertCircle 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ==========================================
// CONFIGURATION & INITIALIZATION
// ==========================================
const APP_ID = "QuizApp_001_MaterialInventoryManagement";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// QUESTION DATA DEFINITION
// ==========================================
const QUESTIONS = [
  {
    id: 1,
    year: "令和4年　第6問",
    title: "資材所要量計画",
    text: "資材所要量計画に関する記述として、最も適切なものはどれか。",
    options: [
      { key: "ア", label: "従属需要品目とは、資材調達先企業からの要望に従い、生産する時期と数量が決定される品目のことである。" },
      { key: "イ", label: "タイムバケットとは、外部企業からの資材の調達にかかる所要時間のことである。" },
      { key: "ウ", label: "独立需要品目とは、営業部門とは無関係に、生産部門や資材調達部門が独自の需要予測に基づいて、生産する時期と必要量を決定する品目のことである。" },
      { key: "エ", label: "部品構成表とは、購買部門が調達する資材と部品をリスト化した表のことである。" },
      { key: "オ", label: "部品展開とは、計画期間内に生産する最終製品の種類と数量が決まったとき、それらを生産するのに必要な構成部品の種類とその数量を求めることである。" }
    ],
    answer: "オ",
    explanation: (
      <div className="space-y-3">
        <p>資材所要量計画（MRP：Material Requirement Planning）に関する問題です。</p>
        <p><strong>選択肢ア：不適切</strong><br />従属需要品目とは、「その品目に対する需要が、独立需要品目又は上位品目の需要から算定される品目」のことです（例：パソコンのCPUやメモリ）。上位の品目や独立需要品目の需要によって決定されるものであり、資材調達先企業からの要望で決まるわけではありません。</p>
        <p><strong>選択肢イ：不適切</strong><br />タイムバケットとは、生産計画を立てる際の各期間（1か月や1週間など）のことです。資材の調達にかかる所要時間（リードタイム）ではありません。</p>
        <p><strong>選択肢ウ：不適切</strong><br />独立需要品目とは、他の品目とは無関係に「受注又は予測に基づいて、その必要時期又は必要量を決定する品目」のことです（例：最終製品のパソコンやサービスパーツ）。需要予測において最も精度の高い情報を持つ営業部門は無関係ではなく、大きく関わります。</p>
        <p><strong>選択肢エ：不適切</strong><br />部品構成表（BOM）とは、「各部品（製品も含む）を生産するのに必要な子部品の種類と数量を示すリスト」のことです。生産設計による生産部品表や、計画部品表の情報を指し、購買部門が調達する資材と部品をリスト化したものではありません。</p>
        <p><strong>選択肢オ：適切</strong><br />部品展開とは、「計画期間内に生産しなければならない最終製品の種類と数量が決まったとき、それらの製品を作るために必要な構成部品又は資材の種類とその数量を求める行為」を指します。</p>
      </div>
    )
  },
  {
    id: 2,
    year: "令和3年　第9問",
    title: "部品構成表(BOM)",
    text: "最終製品Zの部品構成表が下図（テキスト再現構造）に与えられている。（ ）内の数は親1個に対して必要な子部品の個数を示している。製品Zを10個生産するのに必要な部品Aの数量の範囲として、最も適切なものを下記の解答群から選べ。",
    customLayout: (
      <div className="my-4 p-4 bg-gray-50 rounded border border-gray-200 font-mono text-xs overflow-x-auto">
        <div className="text-center font-bold text-sm text-blue-600 mb-2">[ストラクチャ型部品構成ツリー]</div>
        <div className="text-center mb-1">　　　　　　 [ Z ] </div>
        <div className="text-center mb-1">　　　　┌─────┴─────┐</div>
        <div className="text-center mb-1">　　　[ X(2) ]　　　　　　[ Y(1) ]</div>
        <div className="text-center mb-1">　┌───┼───┐　　　　┌───┴───┐</div>
        <div className="text-center mb-1">[ P(1) ] [ Q(3) ] [ R(3) ] [ S(5) ]　　 [ T(10) ]</div>
        <div className="text-center">┌─┴─┐　 │　　　│　 ┌─┴─┐　 ┌─┼─┐</div>
        <div className="text-center">[A(5)][B(2)] [C(4)]  [A(2)] [A(2)][B(1)] [A(5)][B(2)][C(3)]</div>
      </div>
    ),
    options: [
      { key: "ア", label: "100 未満" },
      { key: "イ", label: "100 以上 200 未満" },
      { key: "ウ", label: "200 以上 800 未満" },
      { key: "エ", label: "800 以上" }
    ],
    answer: "エ",
    explanation: (
      <div className="space-y-3">
        <p>製品Zを1個生産するために必要な部品Aを各ルートごとに計算して合算します。</p>
        <div className="bg-white p-3 rounded border border-gray-200 space-y-1 text-sm font-mono">
          <p>① Z → X(2) → P(1) → A(5) : 2 × 1 × 5 = 10個</p>
          <p>② Z → X(2) → R(3) → A(2) : 2 × 3 × 2 = 12個</p>
          <p>③ Z → Y(1) → S(5) → A(2) : 1 × 5 × 2 = 10個</p>
          <p>④ Z → Y(1) → T(10) → A(5) : 1 × 10 × 5 = 50個</p>
          <p className="font-bold text-blue-600">製品Zを1個作るための合計：10 + 12 + 10 + 50 = 82個</p>
        </div>
        <p>問題は<strong>製品Zを10個</strong>生産するための必要数なので：</p>
        <p className="font-bold text-lg text-red-600">82個 × 10 ＝ 820個</p>
        <p>したがって、「800 以上」である<strong>選択肢エ</strong>が正解です。</p>
      </div>
    )
  },
  {
    id: 3,
    year: "令和5年　第7問",
    title: "ストラクチャ型部品表",
    text: "以下のストラクチャ型部品表（表1・表2）に基づいた記述として、最も適切なものを下記の解答群から選べ。",
    customLayout: (
      <div className="my-4 space-y-4">
        <div>
          <div className="text-xs font-bold mb-1 text-gray-700">【表1 製品Xの部品構成】</div>
          <table className="w-full text-center border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">最終製品</th>
                <th className="border border-gray-300 p-2">子部品</th>
                <th className="border border-gray-300 p-2">数量（個）</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan="4" className="border border-gray-300 p-2 font-bold bg-white">X</td>
                <td className="border border-gray-300 p-2 bg-white">A</td>
                <td className="border border-gray-300 p-2 bg-white">1</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-white">B</td>
                <td className="border border-gray-300 p-2 bg-white">2</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-white">C</td>
                <td className="border border-gray-300 p-2 bg-white">2</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-white">D</td>
                <td className="border border-gray-300 p-2 bg-white">2</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <div className="text-xs font-bold mb-1 text-gray-700">【表2 部品Bの部品構成】</div>
          <table className="w-full text-center border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">部品</th>
                <th className="border border-gray-300 p-2">子部品</th>
                <th className="border border-gray-300 p-2">数量（個）</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan="2" className="border border-gray-300 p-2 font-bold bg-white">B</td>
                <td className="border border-gray-300 p-2 bg-white">C</td>
                <td className="border border-gray-300 p-2 bg-white">1</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-white">D</td>
                <td className="border border-gray-300 p-2 bg-white">2</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
    options: [
      { key: "ア", label: "製品Ｘを10個生産するために、部品Ｂは10個必要である。" },
      { key: "イ", label: "製品Ｘを10個生産するために、部品Ｃは40個必要である。" },
      { key: "ウ", label: "製品Ｘを10個生産するために、部品Ｄは40個必要である。" },
      { key: "エ", label: "部品Ｂを20個生産するために、部品Ｃは40個必要である。" },
      { key: "オ", label: "部品Ｂを20個生産するために、部品Ｄは60個必要である。" }
    ],
    answer: "イ",
    explanation: (
      <div className="space-y-3">
        <p>表1と表2の関係から、最終製品Xを1個生産するために必要な各構成部品の総数を展開します。</p>
        <div className="bg-white p-3 rounded border border-gray-200 text-sm space-y-1">
          <p>• <strong>部品A：</strong> 1個</p>
          <p>• <strong>部品B：</strong> 2個</p>
          <p>• <strong>部品C：</strong> 2個(直接) ＋ [部品B(2個) × 子部品C(1個)] ＝ 2 ＋ 2 ＝ 4個</p>
          <p>• <strong>部品D：</strong> 2個(直接) ＋ [部品B(2個) × 子部品D(2個)] ＝ 2 ＋ 4 ＝ 6個</p>
        </div>
        <p>製品Xを10個生産する場合：</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>部品B：2個 × 10 ＝ 20個 （アは不適切）</li>
          <li>部品C：4個 × 10 ＝ 40個 （<strong>イは適切・正解</strong>）</li>
          <li>部品D：6個 × 10 ＝ 60個 （ウは不適切）</li>
        </ul>
        <p>部品Bを20個単体で生産する場合（表2のみを参照）：</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>部品C：1個 × 20 ＝ 20個 （エは不適切）</li>
          <li>部品D：2個 × 20 ＝ 40個 （オは不適切）</li>
        </ul>
      </div>
    )
  },
  {
    id: 4,
    year: "令和3年　第12問",
    title: "発注方式1",
    text: "発注方式における発注点あるいは発注量の決定に関する記述として、最も適切なものはどれか。",
    options: [
      { key: "ア", label: "ダブルビン方式における発注量として、発注点の2倍を用いた。" },
      { key: "イ", label: "定量発注方式における発注点として、調達期間中の平均的な払い出し量を用いた。" },
      { key: "ウ", label: "定量発注方式における発注量として、経済発注量を用いた。" },
      { key: "エ", label: "定期発注方式における発注量として、（発注間隔＋調達期間）中の需要量の推定値に安全在庫を加えた量を用いた。" }
    ],
    answer: "ウ",
    explanation: (
      <div className="space-y-3">
        <p>各発注方式の特徴と計算ロジックに関する問題です。</p>
        <p><strong>選択肢ア：不適切</strong><br />ダブルビン方式（2槽法）では、2つの容器の片方が空になった時点で発注を行います。発注する量は「空になった容器1つ分」であり、発注点の2倍ではありません（過剰在庫になります）。</p>
        <p><strong>選択肢イ：不適切</strong><br />定量発注方式の発注点は「調達期間中の平均払い出し量 ＋ 安全在庫量」で求めます。安全在庫を考慮しないと高確率で欠品します。</p>
        <p><strong>選択肢ウ：適切</strong><br />定量発注方式の発注量には、発注費用と在庫保管費用の総和を最小化する「経済的発注量（EOQ）」が広く用いられます。</p>
        <p><strong>選択肢エ：不適切</strong><br />定期発注方式の発注量は「（発注間隔 ＋ 調達期間）中の需要予測量 － 発注残 － 手持在庫量 ＋ 安全在庫量」です。現在の手持在庫や発注残を差し引く必要があります。</p>
      </div>
    )
  },
  {
    id: 5,
    year: "令和4年　第10問",
    title: "発注方式2",
    text: "発注方式における発注点あるいは発注量の決定に関する記述として、最も適切なものはどれか。",
    options: [
      { key: "ア", label: "安全在庫は欠品を起こさないために決めるものであるが、保有在庫は安全在庫として決めた量を下回ることがある。" },
      { key: "イ", label: "経済的発注量は、累積入荷数量と累積出荷数量に基づいて決まる。" },
      { key: "ウ", label: "ダブルビン方式の発注量は、納入リードタイムを考慮して、その都度、決める。" },
      { key: "エ", label: "内示とは、発注後に納入日を提示することである。" },
      { key: "オ", label: "発注点とは、発注をする時点を示し、通常、日付のことである。" }
    ],
    answer: "ア",
    explanation: (
      <div className="space-y-3">
        <p><strong>選択肢ア：適切</strong><br />安全在庫は需要変動や補充期間の不確実性を吸収するためのものですが、予想を大きく上回る出荷や入荷遅延が発生した場合、実際の保有在庫が安全在庫を下回ることがあります。</p>
        <p><strong>選択肢イ：不適切</strong><br />経済的発注量（EOQ）は、「1回あたり発注費用」「年間需要量」「1個あたりの年間在庫維持費用」によって算出され、累積入荷・出荷数量で決まるものではありません。</p>
        <p><strong>選択肢ウ：不適切</strong><br />ダブルビン方式の発注量はあらかじめ決まった容器サイズ（一定量）であり、その都度決めるものではありません。</p>
        <p><strong>選択肢エ：不適切</strong><br />内示とは、正式な発注の前に、生産準備のために事前に口頭や非公式書面で行う「予測注文（予約）」を指します。</p>
        <p><strong>選択肢オ：不適切</strong><br />発注点とは日付ではなく、発注トリガーとなる「在庫水準（個数・残量）」のことです。</p>
      </div>
    )
  },
  {
    id: 6,
    year: "令和元年　第10問",
    title: "経済的発注量1",
    text: "経済的発注量Qを表す数式として、最も適切なものはどれか。ただし、dを1期当たりの推定所要量、cを1回当たりの発注費、hを1個1期当たりの保管費とする。",
    options: [
      { key: "ア", label: "Q = √ ( 2dh / c )" },
      { key: "イ", label: "Q = √ ( 2dch )" },
      { key: "ウ", label: "Q = √ ( 2ch / d )" },
      { key: "エ", label: "Q = √ ( 2dc / h )" }
    ],
    answer: "エ",
    explanation: (
      <div className="space-y-3">
        <p>経済的発注量（EOQ）の公式に関する問題です。</p>
        <p>経済的発注量の基本式は以下の通りです：</p>
        <p className="bg-gray-50 p-2 font-mono text-center border rounded">
          Q = 1回あたりの総費用を最小化する発注量 = √ ( 2 × 1回あたり発注費 × 需要量 / 1個あたり保管費 )
        </p>
        <p>本問の記号を当てはめると、分子に発注費(c)と推定所要量(d)が入り、分母に保管費(h)が入るため、</p>
        <p className="font-bold text-red-600 text-center text-lg">Q = √ ( 2dc / h )</p>
        <p>となり、<strong>選択肢エ</strong>が適切です。</p>
        <div className="bg-blue-50 p-3 rounded text-xs text-blue-800">
          <strong>覚え方のコツ：</strong><br />
          • 発注費(c)や需要量(d)が大きくなれば、まとめてたくさん発注した方が得なので【分子】<br />
          • 在庫保管費(h)が大きくなれば、在庫を溜めたくないので小まめに発注すべき＝発注量は小さくなるので【分母】
        </div>
      </div>
    )
  },
  {
    id: 7,
    year: "令和5年　第11問",
    title: "経済的発注量2",
    text: "経済的発注量に関する記述として、最も適切なものはどれか。",
    options: [
      { key: "ア", label: "1個1期当たりの在庫保管費が増え、1回当たりの発注費が減少した場合、経済的発注量は増える。" },
      { key: "イ", label: "1個1期当たりの在庫保管費が変化せず、1回当たりの発注費が増えた場合、経済的発注量は減る。" },
      { key: "ウ", label: "経済的発注量で発注する場合、在庫保管費用と発注費用が等しくなる。" },
      { key: "エ", label: "経済的発注量で発注する場合、在庫保管費用より発注費用が高くなる。" }
    ],
    answer: "ウ",
    explanation: (
      <div className="space-y-3">
        <p>経済的発注量の特性に関する重要問題です。</p>
        <p><strong>選択肢ア・イ：不適切</strong><br />公式 Q = √ ( 2dc / h ) より、分母の在庫保管費(h)が増えて分子の発注費(c)が減ればQは必ず「減少」します。また、hが変わらずcが増えればQは「増加」します。</p>
        <p><strong>選択肢ウ：適切 / 選択肢エ：不適切</strong><br />費用曲線において、右下がりの「発注費用曲線」と右上がりの「在庫保管費用曲線」がちょうど交差する（＝<strong>両方の費用が等しくなる</strong>）ポイントで、それらの合計である「在庫総費用」が最小になります。</p>
      </div>
    )
  },
  {
    id: 8,
    year: "平成30年　第13問",
    title: "資材管理",
    text: "資材の発注に関する記述として、最も適切なものはどれか。",
    options: [
      { key: "ア", label: "MRPでは、発注量と発注時期を生産計画と独立に決定できる。" },
      { key: "イ", label: "定期発注方式における発注量は、（発注間隔+調達期間）中の需要推定量-発注残-手持在庫量-安全在庫量で求められる。" },
      { key: "ウ", label: "発注間隔を長くすることにより、きめの細かい在庫管理ができ在庫量が減少する。" },
      { key: "エ", label: "発注点は、調達期間中の払出量の大きさと不確実性を考慮して決定される。" }
    ],
    answer: "エ",
    explanation: (
      <div className="space-y-3">
        <p><strong>選択肢ア：不適切</strong><br />MRP（資材所要量計画）は、製品の生産計画をベースに必要資材を割り出す仕組みであるため、生産計画と密接に連動します。独立に決定することは不可能です。</p>
        <p><strong>選択肢イ：不適切</strong><br />定期発注方式の計算式で、安全在庫量は引くのではなく「足す（＋）」必要があります。</p>
        <p><strong>選択肢ウ：不適切</strong><br />きめの細かい在庫管理を行い在庫量を削減するには、発注間隔を「短く」しなければなりません。長くすると1回あたりの発注量が増え過剰在庫や欠品リスクが増します。</p>
        <p><strong>選択肢エ：適切</strong><br />定量発注方式の発注点（発注点 ＝ 調達期間中の平均需要量 ＋ 安全在庫）は、調達期間中の払出量（需要の大きさ）と、不確実性（需要変動を吸収するための安全在庫）を考慮して決定されます。</p>
      </div>
    )
  },
  {
    id: 9,
    year: "令和元年　第15問",
    title: "内外作区分1",
    text: "ある工程における製品Ａの1個当たりの標準作業時間は0.3時間で、適合品率は90％である。この工程を担当する作業者は5人で、1人1日当たりの実働時間は6時間、稼働率は90％である。今期、残り10日間に適合品を900個生産しなければならないことが分かっている。この場合にとるべき施策として、最も適切なものはどれか。",
    options: [
      { key: "ア", label: "一部作業の外注化を行う。" },
      { key: "イ", label: "次期の仕事を前倒しして行う。" },
      { key: "ウ", label: "終業時刻を早めて小集団活動を行う。" },
      { key: "エ", label: "特別な施策は必要ない。" }
    ],
    answer: "ア",
    explanation: (
      <div className="space-y-3">
        <p>残り10日間で5人の作業者が生産可能な適合品数を計算し、必要数（900個）と比較します。</p>
        <div className="bg-white p-3 rounded border border-gray-200 text-sm font-mono space-y-1">
          <p>• 1人の1日あたりの実動総時間 ＝ 6時間 × 稼働率 0.9 ＝ 5.4時間</p>
          <p>• 1人の1日あたり適合品生産に寄与する実質時間 ＝ 5.4時間 × 適合品率 0.9 ＝ 4.86時間</p>
          <p>• 5人で10日間の総実質作業時間 ＝ 4.86時間 × 5人 × 10日 ＝ 243時間</p>
          <p>• 生産可能個数 ＝ 243時間 ÷ 標準作業時間 0.3時間 ＝ <strong>810個</strong></p>
        </div>
        <p>必要数は900個ですが、自社内では<strong>810個</strong>しか生産できず、<strong>90個不足</strong>します。</p>
        <p>したがって、不足分を補うために「一部作業の外注化を行う」とする<strong>選択肢ア</strong>が正解です。</p>
      </div>
    )
  },
  {
    id: 10,
    year: "平成28年　第12問",
    title: "内外作区分2",
    text: "内外作区分に関連する記述として、最も不適切なものはどれか。",
    options: [
      { key: "ア", label: "一過性の需要に対応するためには、生産設備を増強して、内作で対応することが好ましい。" },
      { key: "イ", label: "自社が特殊な技術を持っており、その優位性を維持するためには、該当する部品を継続的に内作することが好ましい。" },
      { key: "ウ", label: "特許技術のような特に優れた技術を他社が持っている場合には、外作することが好ましい。" },
      { key: "エ", label: "秘密性や重要性が低い部品で、自社において稼働率が低く、コストが引き合わないときには外作することが好ましい。" }
    ],
    answer: "ア",
    explanation: (
      <div className="space-y-3">
        <p><strong>選択肢ア：不適切（正解）</strong><br />一過性（一時的）な需要増加に対して生産設備を増強してしまうと、需要が去った後に設備の稼働率が低下し、固定費負担が増大して経営を圧迫します。このような場合は固定費化を避けるため外作（外注）で対応するのが鉄則です。</p>
        <p><strong>選択肢イ：適切</strong><br />コア技術や独自ノウハウの流出を防ぎ、競争優位性を維持するためには内作を維持すべきです。</p>
        <p><strong>選択肢ウ：適切</strong><br />他社が特許等で圧倒的に優位な技術を持つ場合は、自社で巨額の投資をして開発するより外作する方が合理的です。</p>
        <p><strong>選択肢エ：適切</strong><br />非コア部品であり、自社での生産コストが見合わない（スケールメリットが出ない等）場合は、専門業者へ外作することが推奨されます。</p>
      </div>
    )
  }
];

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function App() {
  // Authentication & Loading States
  const [userId, setUserId] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);

  // Application States
  const [viewMode, setViewMode] = useState('menu'); // 'menu' | 'quiz' | 'history' | 'analytics'
  const [selectedQuizMode, setSelectedQuizMode] = useState('all'); // 'all' | 'wrong' | 'review'
  
  // Quiz Engine States
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Resume Data States
  const [hasResumeData, setHasResumeData] = useState(false);
  const [resumeIndex, setResumeIndex] = useState(0);
  const [resumeMode, setResumeMode] = useState('all');

  // Firestore Synced User Records
  const [userRecords, setUserRecords] = useState({
    wrongQuestions: {}, // { questionId: boolean }
    reviewQuestions: {}, // { questionId: boolean }
    history: [] // Array of { questionId, timestamp, isCorrect, selected }
  });

  // Handle Anonymous Login and Input Validation
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;

    setLoading(true);
    console.log(`[Auth] Attempting login with Keyphrase: ${userId}`);
    try {
      await signInAnonymously(auth);
      console.log("[Auth] Anonymous signing success");
      
      // Fetch User Document
      const userDocRef = doc(db, APP_ID, userId.trim());
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        console.log("[Firestore] Existing user data found:", data);
        
        setUserRecords({
          wrongQuestions: data.wrongQuestions || {},
          reviewQuestions: data.reviewQuestions || {},
          history: data.history || []
        });

        // Check for saved progress index for resuming mid-session
        if (data.progressIndex !== undefined && data.progressIndex !== null && data.progressIndex >= 0) {
          const pMode = data.progressMode || 'all';
          // Calculate if the saved index is valid for that mode
          const list = buildQuestionList(pMode, data.wrongQuestions || {}, data.reviewQuestions || {});
          if (data.progressIndex < list.length) {
            setHasResumeData(true);
            setResumeIndex(data.progressIndex);
            setResumeMode(pMode);
            console.log(`[Resume] Interrupted state detected. Index: ${data.progressIndex}, Mode: ${pMode}`);
          }
        }
      } else {
        console.log("[Firestore] Creating a brand new record profile for keyphrase");
        await setDoc(userDocRef, {
          wrongQuestions: {},
          reviewQuestions: {},
          history: [],
          progressIndex: 0,
          progressMode: 'all'
        });
      }
      setIsAuth(true);
    } catch (error) {
      console.error("[Auth/Firestore Error] Failed to complete login pipeline:", error);
      alert("通信エラーが発生しました。設定値や接続を確認してください。");
    } finally {
      setLoading(false);
    }
  };

  // Helper to build list based on state parameters
  const buildQuestionList = (mode, wrongMap, reviewMap) => {
    return QUESTIONS.filter(q => {
      if (mode === 'wrong') return !!wrongMap[q.id];
      if (mode === 'review') return !!reviewMap[q.id];
      return true; // 'all'
    });
  };

  // Quiz initialization engine
  const startQuiz = (mode, resumeFromIdx = null) => {
    console.log(`[QuizEngine] Starting mode: ${mode}`);
    const targetList = buildQuestionList(mode, userRecords.wrongQuestions, userRecords.reviewQuestions);

    if (targetList.length === 0) {
      alert("該当する問題がありません。");
      return;
    }

    setFilteredQuestions(targetList);
    setSelectedQuizMode(mode);
    setIsAnswered(false);
    setSelectedAnswer(null);

    if (resumeFromIdx !== null && resumeFromIdx < targetList.length) {
      setCurrentIndex(resumeFromIdx);
      console.log(`[QuizEngine] Restored mid-session to index: ${resumeFromIdx}`);
    } else {
      setCurrentIndex(0);
      updateCloudProgress(0, mode);
    }
    
    setHasResumeData(false);
    setViewMode('quiz');
  };

  // Cloud Synchronization for Current Progress State
  const updateCloudProgress = async (idx, mode) => {
    if (!userId) return;
    try {
      const userDocRef = doc(db, APP_ID, userId.trim());
      await updateDoc(userDocRef, {
        progressIndex: idx,
        progressMode: mode
      });
      console.log(`[Cloud Sync] Progress index saved: ${idx}, Mode: ${mode}`);
    } catch (e) {
      console.error("[Cloud Sync Error] Progress tracking update failed:", e);
    }
  };

  // Reset Cloud Progress Indexes completely
  const resetCloudProgress = async () => {
    if (!userId) return;
    try {
      const userDocRef = doc(db, APP_ID, userId.trim());
      await updateDoc(userDocRef, {
        progressIndex: 0,
        progressMode: 'all'
      });
      setHasResumeData(false);
      console.log("[Cloud Sync] Progress markers dropped to origin zero");
    } catch (e) {
      console.error("[Cloud Sync Error] Progress resetting failed:", e);
    }
  };

  // Answer Submission Engine
  const handleAnswerSelection = async (optionKey) => {
    if (isAnswered) return;
    
    const currentQuestion = filteredQuestions[currentIndex];
    const isCorrect = currentQuestion.answer === optionKey;
    
    setSelectedAnswer(optionKey);
    setIsAnswered(true);

    // Deep Copy existing map sets
    const updatedWrongs = { ...userRecords.wrongQuestions };
    if (isCorrect) {
      delete updatedWrongs[currentQuestion.id];
    } else {
      updatedWrongs[currentQuestion.id] = true;
    }

    const newHistoryRecord = {
      questionId: currentQuestion.id,
      timestamp: Date.now(),
      isCorrect,
      selected: optionKey
    };
    const updatedHistory = [newHistoryRecord, ...userRecords.history];

    const nextState = {
      ...userRecords,
      wrongQuestions: updatedWrongs,
      history: updatedHistory
    };

    setUserRecords(nextState);

    // Fire off async cloud storage updates
    try {
      const userDocRef = doc(db, APP_ID, userId.trim());
      await updateDoc(userDocRef, {
        wrongQuestions: updatedWrongs,
        history: updatedHistory
      });
      console.log(`[Quiz Engine] Logged response. Question: ${currentQuestion.id}, Correct: ${isCorrect}`);
    } catch (err) {
      console.error("[Cloud Sync Error] Failed to upload answer metadata payload:", err);
    }
  };

  // Toggle Review Status Checkbox Flag
  const toggleReviewStatus = async (qId) => {
    const updatedReviews = { ...userRecords.reviewQuestions };
    if (updatedReviews[qId]) {
      delete updatedReviews[qId];
    } else {
      updatedReviews[qId] = true;
    }

    setUserRecords(prev => ({ ...prev, reviewQuestions: updatedReviews }));

    try {
      const userDocRef = doc(db, APP_ID, userId.trim());
      await updateDoc(userDocRef, { reviewQuestions: updatedReviews });
      console.log(`[Quiz Engine] Toggle review status flag. ItemID: ${qId}, State: ${!!updatedReviews[qId]}`);
    } catch (err) {
      console.error("[Cloud Sync Error] Failed to update review flag matrix:", err);
    }
  };

  // Handle Progression step or Completion
  const handleNextProgressStep = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx < filteredQuestions.length) {
      setCurrentIndex(nextIdx);
      setSelectedAnswer(null);
      setIsAnswered(false);
      updateCloudProgress(nextIdx, selectedQuizMode);
    } else {
      // Loop sequence terminal boundary reached
      console.log("[Quiz Engine] Session loop completed to final record");
      alert("このモードのすべての問題に解答しました！");
      resetCloudProgress();
      setViewMode('menu');
    }
  };

  // Compute Aggregations for Charts
  const getAnalyticsDataset = () => {
    return QUESTIONS.map(q => {
      const matchHistory = userRecords.history.filter(h => h.questionId === q.id);
      const totalAttempts = matchHistory.length;
      const correctAttempts = matchHistory.filter(h => h.isCorrect).length;
      return {
        name: `問${q.id}`,
        "正解数": correctAttempts,
        "試行数": totalAttempts
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-700 font-medium">クラウド同期中... Loading...</p>
      </div>
    );
  }

  // Authentication Portal Template
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <BookOpen className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">資材・在庫管理</h1>
          <p className="text-sm text-center text-gray-500 mb-6">過去問セレクト演習（運営管理）</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                学習データ同期用「合言葉」 / ユーザーID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="例: my-secret-token-2026"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                ※同じ合言葉を入力することで、PCやスマホなど複数端末で進捗を共通化・同期して再開できます。
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-lg transition shadow duration-150"
            >
              学習を開始する
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      {/* Global Application Header navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => { resetCloudProgress(); setViewMode('menu'); }}>
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-gray-900 tracking-tight">資材・在庫管理 演習</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-4 text-xs">
            <button 
              onClick={() => setViewMode('menu')}
              className={`p-2 rounded-md flex items-center space-x-1 ${viewMode === 'menu' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">メニュー</span>
            </button>
            <button 
              onClick={() => setViewMode('history')}
              className={`p-2 rounded-md flex items-center space-x-1 ${viewMode === 'history' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">履歴</span>
            </button>
            <button 
              onClick={() => setViewMode('analytics')}
              className={`p-2 rounded-md flex items-center space-x-1 ${viewMode === 'analytics' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">統計</span>
            </button>
            <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-gray-600">
              <User className="w-3 h-3" />
              <span className="max-w-[80px] truncate font-mono">{userId}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container workspace viewports */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        
        {/* VIEW: MAIN SELECTOR MENU */}
        {viewMode === 'menu' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Mid-session Restore Prompt HUD */}
            {hasResumeData && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 shadow-sm">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-amber-900 text-sm sm:text-base">前回の学習データが中断状態です</h3>
                    <p className="text-xs sm:text-sm text-amber-700 mt-0.5">
                      前回は【{resumeMode === 'all' ? 'すべての問題' : resumeMode === 'wrong' ? '前回不正解のみ' : '要復習のみ'}】の
                      <span className="font-bold underline ml-1">問題 {resumeIndex + 1}</span> まで進んでいます。続きから再開しますか？
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => startQuiz(resumeMode, resumeIndex)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition"
                  >
                    続きから再開
                  </button>
                  <button
                    onClick={() => resetCloudProgress()}
                    className="bg-white hover:bg-gray-100 text-gray-600 border border-gray-300 font-medium text-xs px-3 py-2 rounded-lg transition"
                  >
                    最初から
                  </button>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
              <h2 className="text-xl sm:text-3xl font-extrabold mb-2">資材・在庫管理 セレクト演習</h2>
              <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
                中小企業診断士 第1次試験の運営管理科目から、MRP、部品構成表(BOM)、発注方式、経済的発注量(EOQ)、内外作区分の頻出過去問を厳選収録。
              </p>
            </div>

            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">学習モードを選択する</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* All problems card */}
              <div 
                onClick={() => startQuiz('all')}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition transform hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center text-blue-600 mb-4 font-bold">全</div>
                  <h4 className="font-bold text-gray-900 text-lg">すべての問題</h4>
                  <p className="text-xs text-gray-500 mt-1">厳選された全10問の主要過去問題セットを一通り網羅して学習します。</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-semibold text-blue-600">
                  <span>収録数: {QUESTIONS.length}問</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Wrong filter problems card */}
              <div 
                onClick={() => startQuiz('wrong')}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition transform hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  <div className="bg-red-100 w-10 h-10 rounded-lg flex items-center justify-center text-red-600 mb-4 font-bold">✕</div>
                  <h4 className="font-bold text-gray-900 text-lg">前回不正解の問題</h4>
                  <p className="text-xs text-gray-500 mt-1">間違えたままになっている苦手な問題レコードを抽出し克服を目指します。</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-semibold text-red-600">
                  <span>現在の対象: {Object.keys(userRecords.wrongQuestions).length}問</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Review check flagged problems card */}
              <div 
                onClick={() => startQuiz('review')}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition transform hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  <div className="bg-amber-100 w-10 h-10 rounded-lg flex items-center justify-center text-amber-600 mb-4 font-bold">★</div>
                  <h4 className="font-bold text-gray-900 text-lg">要復習の問題</h4>
                  <p className="text-xs text-gray-500 mt-1">解説表示中に自分で「要復習」ブックマークマークを付けた要注意問題を復習します。</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-semibold text-amber-600">
                  <span>要復習数: {Object.keys(userRecords.reviewQuestions).length}問</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: LIVE QUIZ ACTIVE INTERFACE */}
        {viewMode === 'quiz' && filteredQuestions.length > 0 && (
          <div className="space-y-6">
            {/* Status bar overhead indicators */}
            <div className="flex justify-between items-center text-xs text-gray-500 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <span className="font-medium">
                モード: <span className="text-blue-600 font-bold">{selectedQuizMode === 'all' ? '全問' : selectedQuizMode === 'wrong' ? '前回不正解分' : '要復習分'}</span>
              </span>
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                問題 {currentIndex + 1} / {filteredQuestions.length}
              </span>
            </div>

            {/* Main Interactive card display workspace */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
              <div>
                <span className="inline-block bg-blue-100 text-blue-800 font-bold text-xs px-2.5 py-1 rounded-full mb-2">
                  {filteredQuestions[currentIndex].year}
                </span>
                <h2 className="text-lg font-bold text-gray-900">
                  問題 {filteredQuestions[currentIndex].id}：{filteredQuestions[currentIndex].title}
                </h2>
              </div>

              <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {filteredQuestions[currentIndex].text}
              </p>

              {/* Custom table layouts insertion check if any exist */}
              {filteredQuestions[currentIndex].customLayout}

              {/* Options selection stack elements */}
              <div className="space-y-2.5 pt-2">
                {filteredQuestions[currentIndex].options.map((opt) => {
                  const isSelectedThis = selectedAnswer === opt.key;
                  const isCorrectAnswer = filteredQuestions[currentIndex].answer === opt.key;
                  
                  let optStyle = "border-gray-200 hover:bg-gray-50 bg-white text-gray-800";
                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      optStyle = "border-green-500 bg-green-50 text-green-900 font-medium";
                    } else if (isSelectedThis) {
                      optStyle = "border-red-500 bg-red-50 text-red-900";
                    } else {
                      optStyle = "border-gray-100 bg-gray-50 opacity-60 text-gray-400";
                    }
                  }

                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleAnswerSelection(opt.key)}
                      disabled={isAnswered}
                      className={`w-full text-left p-3.5 border-2 rounded-xl text-xs sm:text-sm transition duration-150 flex items-start space-x-3 focus:outline-none ${optStyle}`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                        isAnswered && isCorrectAnswer ? 'bg-green-500 text-white' : isAnswered && isSelectedThis ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isAnswered && isCorrectAnswer ? <Check className="w-3 h-3" /> : isAnswered && isSelectedThis ? <X className="w-3 h-3" /> : opt.key}
                      </span>
                      <span className="flex-1">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expanding Post-Submission Explanatory Module */}
            {isAnswered && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6 space-y-4 animate-slideUp">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
                  <div className="flex items-center space-x-2">
                    {selectedAnswer === filteredQuestions[currentIndex].answer ? (
                      <span className="bg-green-100 text-green-800 font-bold px-2.5 py-1 rounded text-xs flex items-center space-x-1">
                        <Check className="w-3 h-3" /> <span>正解</span>
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded text-xs flex items-center space-x-1">
                        <X className="w-3 h-3" /> <span>不正解</span>
                      </span>
                    )}
                    <span className="text-sm font-semibold text-gray-700">
                      正解：<span className="text-red-600 text-base font-extrabold">{filteredQuestions[currentIndex].answer}</span>
                    </span>
                  </div>

                  {/* Bookmark Checklist trigger tool */}
                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs select-none bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                    <input
                      type="checkbox"
                      checked={!!userRecords.reviewQuestions[filteredQuestions[currentIndex].id]}
                      onChange={() => toggleReviewStatus(filteredQuestions[currentIndex].id)}
                      className="hidden"
                    />
                    {userRecords.reviewQuestions[filteredQuestions[currentIndex].id] ? (
                      <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="font-medium text-gray-600">この問題を要復習に設定</span>
                  </label>
                </div>

                {/* Explanatory Context Content markup template rendering */}
                <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-2">
                  <div className="font-bold text-gray-900 border-l-4 border-blue-500 pl-2 mb-2 text-sm">解説</div>
                  {filteredQuestions[currentIndex].explanation}
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleNextProgressStep}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center space-x-1 transition shadow-sm"
                  >
                    <span>{currentIndex + 1 === filteredQuestions.length ? '結果を確認して戻る' : '次の問題へ'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: LOGGED ATTEMPTS HISTORY MATRIX VIEWPORT */}
        {viewMode === 'history' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">解答状況・履歴確認</h2>
              <span className="text-xs bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full font-medium">
                総試行数: {userRecords.history.length}回
              </span>
            </div>

            {/* Static Snapshot metrics across items */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="font-bold text-sm text-gray-800 mb-3">各問題の最終ステータス一覧</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase font-mono">
                      <th className="p-3 font-semibold">問題番号</th>
                      <th className="p-3 font-semibold">テーマ</th>
                      <th className="p-3 font-semibold">前回正誤</th>
                      <th className="p-3 font-semibold">要復習フラグ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {QUESTIONS.map((q) => {
                      const isWrong = !!userRecords.wrongQuestions[q.id];
                      const isReview = !!userRecords.reviewQuestions[q.id];
                      const attempts = userRecords.history.filter(h => h.questionId === q.id);
                      
                      let statusBadge = <span className="text-gray-400">未解答</span>;
                      if (attempts.length > 0) {
                        statusBadge = isWrong ? (
                          <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-medium">不正解</span>
                        ) : (
                          <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded font-medium">正解</span>
                        );
                      }

                      return (
                        <tr key={q.id} className="hover:bg-gray-50 transition">
                          <td className="p-3 font-bold text-gray-900 font-mono">問 {q.id}</td>
                          <td className="p-3 text-gray-700">{q.title} <span className="text-xs text-gray-400 block sm:inline sm:ml-2">({q.year.split('　')[0]})</span></td>
                          <td className="p-3">{statusBadge}</td>
                          <td className="p-3">
                            {isReview ? (
                              <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">★ 要復習</span>
                            ) : (
                              <span className="text-gray-300">--</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Historical sequence stream tracking element lists */}
            <div className="space-y-2">
              <div className="font-bold text-sm text-gray-500 uppercase tracking-wider">タイムライン履歴（直近20件）</div>
              {userRecords.history.length === 0 ? (
                <div className="text-center p-8 bg-white border rounded-xl text-gray-400 text-sm">履歴はまだありません。</div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-sm max-h-[400px] overflow-y-auto">
                  {userRecords.history.slice(0, 20).map((hist, index) => {
                    const linkedQuestion = QUESTIONS.find(q => q.id === hist.questionId);
                    return (
                      <div key={index} className="p-3.5 flex items-center justify-between text-xs sm:text-sm hover:bg-gray-50">
                        <div className="space-y-0.5">
                          <div className="font-bold text-gray-900">
                            問題 {hist.questionId}：{linkedQuestion?.title || "未定義テーマ"}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            {new Date(hist.timestamp).toLocaleString()} に解答 (選択: {hist.selected})
                          </div>
                        </div>
                        <div>
                          {hist.isCorrect ? (
                            <span className="bg-green-500 text-white font-bold p-1 rounded-full w-5 h-5 flex items-center justify-center text-xs"><Check className="w-3 h-3" /></span>
                          ) : (
                            <span className="bg-red-500 text-white font-bold p-1 rounded-full w-5 h-5 flex items-center justify-center text-xs"><X className="w-3 h-3" /></span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: ANALYTICS GRAPH COMPONENT OVERVIEW */}
        {viewMode === 'analytics' && (
          <div className="space-y-6 anonymity-container animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900">問題別データ統計</h2>
            <p className="text-xs text-gray-500">各問題ごとの累計試行回数および正しい解答を選択できた正解数を比較可視化します。</p>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getAnalyticsDataset()}
                    margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="試行数" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="正解数" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-6 text-xs mt-2 font-medium">
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 bg-slate-300 rounded"></div>
                  <span className="text-gray-600">累計試行数</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">正解回数</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Global Application Footer layout */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400 mt-8">
        &copy; 2026 中小企業診断士 第1次試験対策支援ツール - 運営管理:資材・在庫管理
      </footer>
    </div>
  );
}