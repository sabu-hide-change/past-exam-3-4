// npm install lucide-react recharts

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Check, 
  X, 
  Home, 
  RotateCcw, 
  BookOpen, 
  AlertCircle, 
  Trophy, 
  ChevronRight, 
  List, 
  Flag 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// -----------------------------------------------------------------------------
// データ定義 (Data Definition)
// -----------------------------------------------------------------------------

const QUESTIONS = [
  {
    id: 1,
    year: "令和4年 第6問",
    title: "資材所要量計画 (MRP)",
    question: "資材所要量計画に関する記述として、最も適切なものはどれか。",
    options: [
      "従属需要品目とは、資材調達先企業からの要望に従い、生産する時期と数量が決定される品目のことである。",
      "タイムバケットとは、外部企業からの資材の調達にかかる所要時間のことである。",
      "独立需要品目とは、営業部門とは無関係に、生産部門や資材調達部門が独自の需要予測に基づいて、生産する時期と必要量を決定する品目のことである。",
      "部品構成表とは、購買部門が調達する資材と部品をリスト化した表のことである。",
      "部品展開とは、計画期間内に生産する最終製品の種類と数量が決まったとき、それらを生産するのに必要な構成部品の種類とその数量を求めることである。"
    ],
    answer: 4, // 0-indexed, so 4 is オ
    explanation: (
      <div className="space-y-2 text-sm">
        <p><strong>正解：オ</strong></p>
        <p>各選択肢の解説は以下の通りです：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>ア：不適切。</strong>従属需要品目は、上位品目（親製品）の生産計画に基づいて必要量が計算される品目です。調達先の要望で決まるものではありません。</li>
          <li><strong>イ：不適切。</strong>タイムバケットとは、生産計画における「期間の区切り」（1週間、1日など）のことです。調達時間（リードタイム）ではありません。</li>
          <li><strong>ウ：不適切。</strong>独立需要品目（最終製品など）の需要予測に営業部門は深く関わります。「無関係」ではありません。</li>
          <li><strong>エ：不適切。</strong>部品構成表（BOM）は、製品の親子関係や必要数量を定義した技術情報であり、単なる購買リストではありません。</li>
          <li><strong>オ：適切。</strong>部品展開（BOM展開）の正しい定義です。最終製品の計画数から、必要な子部品の総量を計算するプロセスを指します。</li>
        </ul>
      </div>
    )
  },
  {
    id: 2,
    year: "令和3年 第9問",
    title: "部品構成表 (BOM計算)",
    question: "最終製品Zの部品構成表が下図に与えられている。（　）内の数は親1個に対して必要な子部品の個数を示している。製品Zを10個生産するのに必要な部品Aの数量の範囲として、最も適切なものを選べ。",
    hasDiagram: true,
    diagramType: "bom_tree_z",
    options: [
      "100 未満",
      "100 以上 200 未満",
      "200 以上 800 未満",
      "800 以上"
    ],
    answer: 3, // エ
    explanation: (
      <div className="space-y-2 text-sm">
        <p><strong>正解：エ (820個)</strong></p>
        <p>製品Zを1個作るために必要なAの個数を計算します。</p>
        <div className="bg-gray-100 p-2 rounded font-mono text-xs overflow-x-auto">
          <p>ルート1: Z → X(2) → P(1) → A(5) ... 2*1*5 = 10</p>
          <p>ルート2: Z → X(2) → R(3) → A(2) ... 2*3*2 = 12</p>
          <p>ルート3: Z → Y(1) → S(5) → A(2) ... 1*5*2 = 10</p>
          <p>ルート4: Z → Y(1) → T(10)→ A(5) ... 1*10*5 = 50</p>
          <hr className="my-1 border-gray-400"/>
          <p>合計(Z1個あたり) = 10 + 12 + 10 + 50 = 82個</p>
        </div>
        <p>Zを10個生産するため、必要なAは <strong>82 × 10 = 820個</strong> となります。</p>
      </div>
    )
  },
  {
    id: 3,
    year: "令和5年 第7問",
    title: "ストラクチャ型部品表",
    question: "以下のストラクチャ型部品表に基づいた記述として、最も適切なものを選べ。",
    hasDiagram: true,
    diagramType: "bom_table_x",
    options: [
      "製品Ｘを10個生産するために、部品Ｂは10個必要である。",
      "製品Ｘを10個生産するために、部品Ｃは40個必要である。",
      "製品Ｘを10個生産するために、部品Ｄは40個必要である。",
      "部品Ｂを20個生産するために、部品Ｃは40個必要である。",
      "部品Ｂを20個生産するために、部品Ｄは60個必要である。"
    ],
    answer: 1, // イ
    explanation: (
      <div className="space-y-2 text-sm">
        <p><strong>正解：イ</strong></p>
        <p>製品X 1個あたりの所要量を計算します。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>部品B:</strong> 直接2個必要。(X10個なら20個) → アは誤り。</li>
          <li><strong>部品C:</strong>
            <ul className="pl-4 list-circle">
              <li>直下: 2個</li>
              <li>B経由: B(2個) × Bの子C(1個) = 2個</li>
              <li>合計: 4個。X10個なら <strong>40個</strong>。 → <strong>イは正解。</strong></li>
            </ul>
          </li>
          <li><strong>部品D:</strong>
            <ul className="pl-4 list-circle">
              <li>直下: 2個</li>
              <li>B経由: B(2個) × Bの子D(2個) = 4個</li>
              <li>合計: 6個。X10個なら 60個。 → ウは誤り。</li>
            </ul>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 4,
    year: "令和3年 第12問",
    title: "発注方式の基礎",
    question: "発注方式における発注点あるいは発注量の決定に関する記述として、最も適切なものはどれか。",
    options: [
      "ダブルビン方式における発注量として、発注点の2倍を用いた。",
      "定量発注方式における発注点として、調達期間中の平均的な払い出し量を用いた。",
      "定量発注方式における発注量として、経済発注量を用いた。",
      "定期発注方式における発注量として、（発注間隔＋調達期間）中の需要量の推定値に安全在庫を加えた量を用いた。"
    ],
    answer: 2, // ウ
    explanation: (
      <div className="space-y-2 text-sm">
        <p><strong>正解：ウ</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>ア：不適切。</strong>ダブルビン方式は「箱が空になったら、その箱の分（1箱分）を発注する」方式です。発注点の2倍ではありません。</li>
          <li><strong>イ：不適切。</strong>発注点は「(調達期間中の需要) + 安全在庫」で計算します。安全在庫が抜けています。</li>
          <li><strong>ウ：適切。</strong>定量発注方式では、毎回決まった量を発注します。この量は通常、コストを最小化する「経済的発注量(EOQ)」を用います。</li>
          <li><strong>エ：不適切。</strong>定期発注方式の発注量は「(発注間隔+調達期間)の需要予測 + 安全在庫 - 現在庫 - 発注残」です。現在庫などの引き算が抜けています。</li>
        </ul>
      </div>
    )
  },
  {
    id: 5,
    year: "令和4年 第10問",
    title: "安全在庫と発注点",
    question: "発注方式における発注点あるいは発注量の決定に関する記述として、最も適切なものはどれか。",
    options: [
      "安全在庫は欠品を起こさないために決めるものであるが、保有在庫は安全在庫として決めた量を下回ることがある。",
      "経済的発注量は、累積入荷数量と累積出荷数量に基づいて決まる。",
      "ダブルビン方式の発注量は、納入リードタイムを考慮して、その都度、決める。",
      "内示とは、発注後に納入日を提示することである。",
      "発注点とは、発注をする時点を示し、通常、日付のことである。"
    ],
    answer: 0, // ア
    explanation: (
      <div className="space-y-2 text-sm">
        <p><strong>正解：ア</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>ア：適切。</strong>需要の急増や納入遅れが発生した場合、安全在庫を取り崩して対応するため、一時的に安全在庫を下回ることはあります。</li>
          <li><strong>イ：不適切。</strong>経済的発注量は「発注費用」と「保管費用」のバランスで決まります。</li>
          <li><strong>ウ：不適切。</strong>ダブルビン方式は定量（ビン1個分）を発注する方式で、その都度計算はしません。</li>
          <li><strong>エ：不適切。</strong>内示は、正式発注の前にあらかじめ予定数量などを伝えることです。</li>
          <li><strong>オ：不適切。</strong>発注点は日付ではなく、「在庫量（基準在庫水準）」を指します。</li>
        </ul>
      </div>
    )
  },
  {
    id: 6,
    year: "令和元年 第10問",
    title: "経済的発注量(EOQ)の式",
    question: "経済的発注量Qを表す数式として、最も適切なものはどれか。ただし、dを1期当たりの推定所要量、cを1回当たりの発注費、hを1個1期当たりの保管費とする。",
    hasDiagram: true,
    diagramType: "eoq_formula",
    options: [
      "Formula A", // Placeholder, rendered visually in component
      "Formula B",
      "Formula C",
      "Formula D"
    ],
    answer: 3, // エ
    explanation: (
      <div className="space-y-2 text-sm">
        <p><strong>正解：エ</strong></p>
        <p>経済的発注量(EOQ)の公式は以下の通りです。</p>
        <div className="flex justify-center my-4">
           <div className="flex items-center text-lg font-serif">
            <span className="mr-2 italic">Q</span>
            <span className="mr-2">=</span>
            <span className="text-2xl mr-1">√</span>
            <span className="border-t border-black pt-1">
              <div className="text-center border-b border-black pb-1 mb-1">2dc</div>
              <div className="text-center">h</div>
            </span>
          </div>
        </div>
        <p><strong>覚え方：</strong>発注費(c)が高いとまとめて発注した方が得なので分子。需要(d)が多いと沢山必要なので分子。保管費(h)が高いと在庫を持ちたくないので分母。</p>
      </div>
    )
  },
  {
    id: 7,
    year: "令和5年 第11問",
    title: "経済的発注量の特性",
    question: "経済的発注量に関する記述として、最も適切なものはどれか。",
    options: [
      "１個１期当たりの在庫保管費が増え、１回当たりの発注費が減少した場合、経済的発注量は増える。",
      "１個１期当たりの在庫保管費が変化せず、１回当たりの発注費が増えた場合、経済的発注量は減る。",
      "経済的発注量で発注する場合、在庫保管費用と発注費用が等しくなる。",
      "経済的発注量で発注する場合、在庫保管費用より発注費用が高くなる。"
    ],
    answer: 2, // ウ
    explanation: (
      <div className="space-y-2 text-sm">
        <p><strong>正解：ウ</strong></p>
        <p>経済的発注量(EOQ)は、<strong>「発注費用」と「在庫保管費用」の総和が最小になる点</strong>であり、このとき2つの費用は等しくなります。</p>
        <div className="h-48 w-full mt-2">
          {/* Chart rendered in UI component */}
          <p className="text-xs text-gray-500 text-center">（解説用グラフは詳細画面に表示されます）</p>
        </div>
      </div>
    )
  },
  {
    id: 8,
    year: "平成30年 第13問",
    title: "資材管理全般",
    question: "資材の発注に関する記述として、最も適切なものはどれか。",
    options: [
      "MRPでは、発注量と発注時期を生産計画と独立に決定できる。",
      "定期発注方式における発注量は、（発注間隔+調達期間）中の需要推定量-発注残-手持在庫量-安全在庫量で求められる。",
      "発注間隔を長くすることにより、きめの細かい在庫管理ができ在庫量が減少する。",
      "発注点は、調達期間中の払出量の大きさと不確実性を考慮して決定される。"
    ],
    answer: 3, // エ
    explanation: (
      <div className="space-y-2 text-sm">
        <p><strong>正解：エ</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>ア：不適切。</strong>MRPは生産計画に基づいて計算されるため、独立して決定できません。</li>
          <li><strong>イ：不適切。</strong>定期発注方式の計算式では、安全在庫量は「引く」のではなく「足す」必要があります。</li>
          <li><strong>ウ：不適切。</strong>発注間隔を長くすると、1回の発注量が増え、平均在庫量は増加します。</li>
          <li><strong>エ：適切。</strong>発注点は「調達期間中の需要予測」＋「安全在庫（不確実性への対応）」で決まります。</li>
        </ul>
      </div>
    )
  },
  {
    id: 9,
    year: "令和元年 第15問",
    title: "内外作区分（計算）",
    question: "製品Aの標準作業時間0.3時間/個、適合品率90%。作業者5人、1日6時間稼働、稼働率90%。残り10日間で適合品900個が必要。とるべき施策は？",
    options: [
      "一部作業の外注化を行う。",
      "次期の仕事を前倒しして行う。",
      "終業時刻を早めて小集団活動を行う。",
      "特別な施策は必要ない。"
    ],
    answer: 0, // ア
    explanation: (
      <div className="space-y-2 text-sm">
        <p><strong>正解：ア</strong></p>
        <div className="bg-gray-100 p-2 rounded text-xs font-mono">
          <p>1. 供給能力の計算:</p>
          <p>1人1日 = 6時間 × 稼働率0.9 = 5.4時間</p>
          <p>5人10日 = 5.4 × 5 × 10 = 270時間(総稼働時間)</p>
          <p>生産可能数 = 270 ÷ 0.3 = 900個(投入ベース)</p>
          <p>適合品(良品)数 = 900 × 0.9 = 810個</p>
          <br/>
          <p>2. 需給バランス:</p>
          <p>必要数 900個 ＞ 生産可能 810個</p>
          <p>不足分 90個</p>
        </div>
        <p className="mt-2">自社能力では足りないため、外注化などの対策が必要です。</p>
      </div>
    )
  },
  {
    id: 10,
    year: "平成28年 第12問",
    title: "内外作区分（判断）",
    question: "内外作区分に関連する記述として、最も不適切なものはどれか。",
    options: [
      "一過性の需要に対応するためには、生産設備を増強して、内作で対応することが好ましい。",
      "自社が特殊な技術を持っており、その優位性を維持するためには、該当する部品を継続的に内作することが好ましい。",
      "特許技術のような特に優れた技術を他社が持っている場合には、外作することが好ましい。",
      "秘密性や重要性が低い部品で、自社において稼働率が低く、コストが引き合わないときには外作することが好ましい。"
    ],
    answer: 0, // ア
    explanation: (
      <div className="space-y-2 text-sm">
        <p><strong>正解：ア（不適切）</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>ア：不適切。</strong>一過性の需要のために設備投資（固定費増）を行うと、需要終了後に過剰設備となり経営を圧迫します。このような場合は外注が適しています。</li>
          <li><strong>イ、ウ、エ：</strong>これらは内外作決定の一般的なセオリー通りで適切です。</li>
        </ul>
      </div>
    )
  }
];

// -----------------------------------------------------------------------------
// UI Components
// -----------------------------------------------------------------------------

const BOMDiagramQ2 = () => (
  <div className="border p-4 my-4 overflow-x-auto bg-white rounded shadow-inner">
    <div className="min-w-[500px] flex flex-col items-center text-xs font-bold">
      <div className="border border-black px-3 py-1 mb-2">Z</div>
      <div className="w-1/2 border-t border-black h-4 relative">
        <div className="absolute left-0 w-px h-4 bg-black top-0"></div>
        <div className="absolute right-0 w-px h-4 bg-black top-0"></div>
        <div className="absolute left-1/2 w-px h-2 bg-black -top-2"></div>
      </div>
      <div className="flex justify-between w-3/4 mb-2">
        <div className="flex flex-col items-center">
          <div className="border border-black px-2 py-1 bg-blue-50">X(2)</div>
          <div className="w-full border-t border-black h-4 relative mt-2">
            <div className="absolute left-0 w-px h-4 bg-black top-0"></div>
            <div className="absolute right-0 w-px h-4 bg-black top-0"></div>
            <div className="absolute left-1/2 w-px h-4 bg-black top-0"></div>
            <div className="absolute left-1/2 w-px h-2 bg-black -top-2"></div>
          </div>
          <div className="flex gap-2">
             <div className="flex flex-col items-center">
                <div className="border border-blue-500 px-1 py-1">P(1)</div>
                <div className="h-2 border-l border-black"></div>
                <div className="border border-red-500 bg-red-50 px-1">A(5)</div>
             </div>
             <div className="flex flex-col items-center">
                <div className="border border-gray-400 px-1 py-1">Q(3)</div>
                <div className="h-2 border-l border-black"></div>
                <div className="border border-gray-300 px-1">C(4)</div>
             </div>
             <div className="flex flex-col items-center">
                <div className="border border-blue-500 px-1 py-1">R(3)</div>
                <div className="h-2 border-l border-black"></div>
                <div className="border border-red-500 bg-red-50 px-1">A(2)</div>
             </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="border border-black px-2 py-1 bg-blue-50">Y(1)</div>
          <div className="w-full border-t border-black h-4 relative mt-2">
            <div className="absolute left-1/4 w-px h-4 bg-black top-0"></div>
            <div className="absolute right-1/4 w-px h-4 bg-black top-0"></div>
            <div className="absolute left-1/2 w-px h-2 bg-black -top-2"></div>
          </div>
          <div className="flex gap-2">
             <div className="flex flex-col items-center">
                <div className="border border-blue-500 px-1 py-1">S(5)</div>
                <div className="h-2 border-l border-black"></div>
                <div className="flex gap-1">
                   <div className="border border-red-500 bg-red-50 px-1">A(2)</div>
                   <div className="border border-gray-300 px-1">B(1)</div>
                </div>
             </div>
             <div className="flex flex-col items-center">
                <div className="border border-blue-500 px-1 py-1">T(10)</div>
                <div className="h-2 border-l border-black"></div>
                <div className="flex gap-1">
                   <div className="border border-red-500 bg-red-50 px-1">A(5)</div>
                   <div className="border border-gray-300 px-1">...</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
    <div className="text-center text-xs text-gray-500 mt-2">※赤枠は集計対象の部品A</div>
  </div>
);

const BOMTableQ3 = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
    <div>
      <p className="text-sm font-bold text-center mb-1">表1 製品Xの部品構成</p>
      <table className="w-full text-sm border-collapse border border-gray-400">
        <thead className="bg-gray-100">
          <tr><th className="border border-gray-300 p-1">親</th><th className="border border-gray-300 p-1">子</th><th className="border border-gray-300 p-1">数</th></tr>
        </thead>
        <tbody>
          <tr><td rowSpan="4" className="border border-gray-300 p-1 text-center bg-white">X</td><td className="border border-gray-300 p-1 text-center">A</td><td className="border border-gray-300 p-1 text-center">1</td></tr>
          <tr><td className="border border-gray-300 p-1 text-center">B</td><td className="border border-gray-300 p-1 text-center">2</td></tr>
          <tr><td className="border border-gray-300 p-1 text-center">C</td><td className="border border-gray-300 p-1 text-center">2</td></tr>
          <tr><td className="border border-gray-300 p-1 text-center">D</td><td className="border border-gray-300 p-1 text-center">2</td></tr>
        </tbody>
      </table>
    </div>
    <div>
      <p className="text-sm font-bold text-center mb-1">表2 部品Bの部品構成</p>
      <table className="w-full text-sm border-collapse border border-gray-400">
        <thead className="bg-gray-100">
          <tr><th className="border border-gray-300 p-1">親</th><th className="border border-gray-300 p-1">子</th><th className="border border-gray-300 p-1">数</th></tr>
        </thead>
        <tbody>
          <tr><td rowSpan="2" className="border border-gray-300 p-1 text-center bg-white">B</td><td className="border border-gray-300 p-1 text-center">C</td><td className="border border-gray-300 p-1 text-center">1</td></tr>
          <tr><td className="border border-gray-300 p-1 text-center">D</td><td className="border border-gray-300 p-1 text-center">2</td></tr>
        </tbody>
      </table>
    </div>
  </div>
);

const EOQChart = () => {
  const data = Array.from({ length: 20 }, (_, i) => {
    const q = i + 2; // avoid div by 0
    const ordering = 200 / q; 
    const holding = q * 2;
    const total = ordering + holding;
    return { name: q, holding, ordering, total };
  });

  return (
    <div className="w-full h-48 text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip 
             labelFormatter={() => ''}
             formatter={(value, name) => [Math.round(value), name === 'total' ? '総費用' : name === 'holding' ? '保管費' : '発注費']}
          />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#ff0000" name="在庫総費用" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="holding" stroke="#0000ff" name="在庫保管費用" dot={false} />
          <Line type="monotone" dataKey="ordering" stroke="#008000" name="発注費用" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Helper: Formula Renderer for Q6
// -----------------------------------------------------------------------------
const FormulaOption = ({ type }) => {
  // Common styles
  const Root = ({ children }) => (
    <div className="flex items-center space-x-2">
      <span className="italic">Q</span><span>=</span>
      <span className="text-xl">√</span>
      {children}
    </div>
  );
  
  const Fraction = ({ num, den }) => (
    <div className="flex flex-col items-center border-t border-black pt-0.5">
      <div className="border-b border-black w-full text-center leading-none pb-0.5">{num}</div>
      <div className="w-full text-center leading-none pt-0.5">{den}</div>
    </div>
  );

  const SqrtContent = ({ children }) => (
     <div className="border-t border-black pt-1 px-1">{children}</div>
  );

  switch (type) {
    case 0: // A: sqrt(2dh / c)
      return <Root><Fraction num="2dh" den="c" /></Root>;
    case 1: // B: sqrt(2dch)
      return <Root><SqrtContent>2dch</SqrtContent></Root>;
    case 2: // C: sqrt(2ch / d)
      return <Root><Fraction num="2ch" den="d" /></Root>;
    case 3: // D: sqrt(2dc / h)
      return <Root><Fraction num="2dc" den="h" /></Root>;
    default: return null;
  }
};


// -----------------------------------------------------------------------------
// Main Application
// -----------------------------------------------------------------------------

export default function App() {
  // State
  const [mode, setMode] = useState('menu'); // menu, quiz, result
  const [filterType, setFilterType] = useState('all'); // all, miss, review
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [history, setHistory] = useState({}); // { id: { correct: bool, date: number } }
  const [reviewList, setReviewList] = useState([]); // [id, id, ...]

  // Load / Save Data
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('quizHistory');
      const savedReview = localStorage.getItem('reviewList');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      if (savedReview) setReviewList(JSON.parse(savedReview));
      console.log("Data loaded from localStorage");
    } catch (e) {
      console.error("Failed to load data", e);
      setHistory({});
      setReviewList([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('quizHistory', JSON.stringify(history));
    localStorage.setItem('reviewList', JSON.stringify(reviewList));
    console.log("Data saved to localStorage");
  }, [history, reviewList]);

  // Logic
  const startQuiz = (type) => {
    let qList = QUESTIONS;
    if (type === 'miss') {
      qList = QUESTIONS.filter(q => history[q.id] && !history[q.id].correct);
    } else if (type === 'review') {
      qList = QUESTIONS.filter(q => reviewList.includes(q.id));
    }
    
    if (qList.length === 0) {
      alert("該当する問題がありません。");
      return;
    }

    setFilterType(type);
    setFilteredQuestions(qList);
    setCurrentQIndex(0);
    setMode('quiz');
    resetQuestionState();
  };

  const resetQuestionState = () => {
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleOptionClick = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const currentQ = filteredQuestions[currentQIndex];
    const isCorrect = index === currentQ.answer;

    setHistory(prev => ({
      ...prev,
      [currentQ.id]: { correct: isCorrect, date: Date.now() }
    }));
  };

  const nextQuestion = () => {
    if (currentQIndex < filteredQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      resetQuestionState();
    } else {
      setMode('result');
    }
  };

  const toggleReview = (id) => {
    setReviewList(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });
  };

  const resetAllHistory = () => {
    if (confirm("履歴を全て消去しますか？")) {
      setHistory({});
      setReviewList([]);
    }
  };

  // Render Helpers
  const currentQuestion = filteredQuestions[currentQIndex];
  const isLastQuestion = currentQIndex === filteredQuestions.length - 1;

  // --- Screens ---

  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 p-6 text-white text-center">
            <h1 className="text-2xl font-bold mb-2">運営管理 過去問演習</h1>
            <p className="opacity-90 text-sm">資材・在庫管理 / 生産管理</p>
          </div>
          
          <div className="p-6 space-y-4">
            <button 
              onClick={() => startQuiz('all')}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="text-blue-600" />
                <div className="text-left">
                  <span className="block font-bold">すべての問題</span>
                  <span className="text-xs text-slate-500">全10問</span>
                </div>
              </div>
              <ChevronRight className="text-slate-400" />
            </button>

            <button 
              onClick={() => startQuiz('miss')}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-500" />
                <div className="text-left">
                  <span className="block font-bold">前回間違えた問題</span>
                  <span className="text-xs text-slate-500">復習モード</span>
                </div>
              </div>
              <ChevronRight className="text-slate-400" />
            </button>

            <button 
              onClick={() => startQuiz('review')}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <Flag className="text-amber-500" />
                <div className="text-left">
                  <span className="block font-bold">要復習リスト</span>
                  <span className="text-xs text-slate-500">{reviewList.length}問 登録済み</span>
                </div>
              </div>
              <ChevronRight className="text-slate-400" />
            </button>
            
            <div className="pt-4 border-t border-slate-100">
               <button onClick={resetAllHistory} className="text-xs text-slate-400 hover:text-red-500 underline w-full text-center">
                 履歴をリセット
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'quiz' && currentQuestion) {
    const isCorrect = selectedOption === currentQuestion.answer;
    const isReviewing = reviewList.includes(currentQuestion.id);

    return (
      <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <button onClick={() => setMode('menu')} className="flex items-center hover:text-blue-600">
              <Home size={16} className="mr-1" /> ホーム
            </button>
            <span>{currentQIndex + 1} / {filteredQuestions.length}</span>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-600 text-xs md:text-sm">{currentQuestion.year}</span>
              <span className="text-xs bg-white px-2 py-0.5 rounded border text-slate-500">{currentQuestion.title}</span>
            </div>
            
            <div className="p-5">
              <h2 className="text-lg font-bold leading-relaxed mb-4">{currentQuestion.question}</h2>
              
              {/* Custom Diagrams */}
              {currentQuestion.diagramType === 'bom_tree_z' && <BOMDiagramQ2 />}
              {currentQuestion.diagramType === 'bom_table_x' && <BOMTableQ3 />}
              
              <div className="space-y-3">
                {currentQuestion.options.map((opt, idx) => {
                  // Special rendering for Q6 (Formulas)
                  const content = currentQuestion.diagramType === 'eoq_formula' 
                    ? <FormulaOption type={idx} /> 
                    : <span className="text-sm md:text-base">{opt}</span>;

                  let btnClass = "w-full text-left p-4 rounded-lg border-2 transition-all flex items-center ";
                  if (!isAnswered) {
                    btnClass += "border-slate-100 hover:border-blue-300 hover:bg-blue-50";
                  } else {
                    if (idx === currentQuestion.answer) {
                      btnClass += "border-green-500 bg-green-50";
                    } else if (idx === selectedOption) {
                      btnClass += "border-red-500 bg-red-50";
                    } else {
                      btnClass += "border-slate-100 opacity-50";
                    }
                  }

                  return (
                    <button 
                      key={idx} 
                      onClick={() => handleOptionClick(idx)}
                      disabled={isAnswered}
                      className={btnClass}
                    >
                      <div className="flex-shrink-0 w-8 font-bold text-slate-400">
                        {['ア', 'イ', 'ウ', 'エ', 'オ'][idx]}
                      </div>
                      <div className="flex-grow">{content}</div>
                      {isAnswered && idx === currentQuestion.answer && <Check className="text-green-600" />}
                      {isAnswered && idx === selectedOption && idx !== currentQuestion.answer && <X className="text-red-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback / Explanation */}
            {isAnswered && (
              <div className="border-t-2 border-slate-100 bg-slate-50 p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`text-lg font-bold flex items-center gap-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? <><Check size={24}/> 正解！</> : <><X size={24}/> 不正解...</>}
                  </div>
                  <button 
                    onClick={() => toggleReview(currentQuestion.id)}
                    className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border ${isReviewing ? 'bg-amber-100 border-amber-400 text-amber-700' : 'bg-white border-slate-300 text-slate-500'}`}
                  >
                    <Flag size={14} fill={isReviewing ? "currentColor" : "none"} />
                    {isReviewing ? '要復習リストから外す' : '要復習リストに追加'}
                  </button>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4 text-slate-700">
                  <div className="flex items-center gap-2 mb-2 text-slate-900 font-bold">
                    <BookOpen size={16} /> 解説
                  </div>
                  {currentQuestion.explanation}
                  {currentQuestion.id === 7 && <div className="mt-4"><EOQChart /></div>}
                </div>

                <button 
                  onClick={nextQuestion}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  {isLastQuestion ? '結果を見る' : '次の問題へ'} <ChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'result') {
    const correctCount = filteredQuestions.filter(q => history[q.id]?.correct).length;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-800">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-yellow-100 p-4 rounded-full">
              <Trophy size={48} className="text-yellow-600" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-1">お疲れ様でした！</h2>
            <p className="text-slate-500">今回の正解率</p>
            <div className="text-5xl font-bold text-blue-600 my-4">
              {Math.round((correctCount / filteredQuestions.length) * 100)}%
            </div>
            <p className="text-sm text-slate-500">
              {filteredQuestions.length}問中 {correctCount}問正解
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => startQuiz(filterType)}
              className="flex items-center justify-center gap-2 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-bold"
            >
              <RotateCcw size={18} /> 再挑戦
            </button>
            <button 
              onClick={() => setMode('menu')}
              className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
            >
              <Home size={18} /> ホームへ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}