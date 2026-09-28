import type { Product } from "../types";

const gradients: Record<string, [string, string]> = {
  sand: ["#EFEBE3", "#C7BFAF"],
  sage: ["#E1E8DC", "#A2B896"],
  wine: ["#F6EBEA", "#C88E88"],
  ink: ["#DFD9CD", "#635B4F"],
  stone: ["#F7F4EF", "#A49B89"],
};

function img(label: string, key: keyof typeof gradients) {
  const [gradientFrom, gradientTo] = gradients[key];
  return { gradientFrom, gradientTo, label };
}

export const products: Product[] = [
  {
    slug: "maison-verlaine-quilted-tote-noir",
    category: "handbags",
    brand: "Maison Verlaine",
    name: { ja: "キルティング トートバッグ ノワール", zh: "菱格纹手提包 · 墨黑" },
    price: 328000,
    condition: "A",
    color: { ja: "ブラック", zh: "黑色" },
    colorKey: "black",
    material: { ja: "ラムスキン / ゴールド金具", zh: "小羊皮 / 金色五金" },
    size: { ja: "W28 × H20 × D10 cm", zh: "宽28 × 高20 × 厚10 cm" },
    accessories: { ja: "保存袋、カード", zh: "防尘袋、保卡" },
    itemNumber: "EA-HB-1042",
    channels: ["rakuten", "yahoo", "ebay"],
    images: [img("Front", "sand"), img("Side", "stone"), img("Interior", "ink")],
    description: {
      ja: "しなやかなラムスキンに施された上品なキルティングが特徴のトートバッグ。デイリーからフォーマルまで幅広く活躍します。",
      zh: "柔软小羊皮配以典雅菱格车线，日常与正式场合皆宜的百搭手提包。",
    },
    isNew: true,
  },
  {
    slug: "atelier-cendre-box-bag-camel",
    category: "handbags",
    brand: "Atelier Cendre",
    name: { ja: "ボックス ハンドバッグ キャメル", zh: "方形手提包 · 焦糖棕" },
    price: 198000,
    condition: "S",
    color: { ja: "キャメル", zh: "焦糖棕" },
    colorKey: "camel",
    material: { ja: "カーフレザー", zh: "小牛皮" },
    size: { ja: "W22 × H16 × D9 cm", zh: "宽22 × 高16 × 厚9 cm" },
    accessories: { ja: "ストラップ、保存袋", zh: "肩带、防尘袋" },
    itemNumber: "EA-HB-1088",
    channels: ["rakuten", "ebay"],
    images: [img("Front", "stone"), img("Handle detail", "sand")],
    description: {
      ja: "端正なボックスシルエットが目を引く一点。新品同様の美しい状態です。",
      zh: "利落方正的轮廓，近乎全新的完美状态，是通勤与约会皆合适的选择。",
    },
  },
  {
    slug: "belle-rivage-shoulder-flap-rouge",
    category: "shoulder-bags",
    brand: "Belle Rivage",
    name: { ja: "フラップ ショルダーバッグ ルージュ", zh: "翻盖单肩包 · 胭脂红" },
    price: 246000,
    condition: "AB",
    color: { ja: "レッド", zh: "红色" },
    colorKey: "red",
    material: { ja: "キャビアレザー / シルバー金具", zh: "鱼子纹皮革 / 银色五金" },
    size: { ja: "W24 × H15 × D7 cm", zh: "宽24 × 高15 × 厚7 cm" },
    accessories: { ja: "チェーンストラップ", zh: "链条肩带" },
    itemNumber: "EA-SB-2031",
    channels: ["yahoo", "ebay"],
    images: [img("Front", "wine"), img("Chain detail", "sand")],
    description: {
      ja: "季節を問わず活躍する差し色レッド。使用感はありますが状態は良好です。",
      zh: "四季皆宜的亮眼红，虽有轻微使用痕迹但整体状态良好。",
    },
  },
  {
    slug: "nord-atelier-mini-crossbody-sauge",
    category: "shoulder-bags",
    brand: "Nord Atelier",
    name: { ja: "ミニ クロスボディ セージ", zh: "迷你斜挎包 · 鼠尾草绿" },
    price: 156000,
    condition: "A",
    color: { ja: "セージグリーン", zh: "鼠尾草绿" },
    colorKey: "green",
    material: { ja: "スムースレザー", zh: "光面皮革" },
    size: { ja: "W18 × H12 × D6 cm", zh: "宽18 × 高12 × 厚6 cm" },
    accessories: { ja: "保存袋", zh: "防尘袋" },
    itemNumber: "EA-SB-2077",
    channels: ["rakuten", "yahoo", "ebay"],
    images: [img("Front", "sage"), img("Strap detail", "stone")],
    description: {
      ja: "落ち着いたセージグリーンが上品な印象のミニバッグ。軽やかに持てるサイズ感です。",
      zh: "沉静的鼠尾草绿，尺寸轻巧百搭，为日常穿搭增添细腻质感。",
    },
    isNew: true,
  },
  {
    slug: "maison-verlaine-long-wallet-ivoire",
    category: "small-leather-goods",
    brand: "Maison Verlaine",
    name: { ja: "長財布 アイボリー", zh: "长款钱包 · 象牙白" },
    price: 68000,
    condition: "B",
    color: { ja: "アイボリー", zh: "象牙白" },
    colorKey: "white",
    material: { ja: "ラムスキン", zh: "小羊皮" },
    size: { ja: "W19 × H10 × D2 cm", zh: "宽19 × 高10 × 厚2 cm" },
    accessories: { ja: "箱", zh: "外盒" },
    itemNumber: "EA-SLG-3012",
    channels: ["yahoo"],
    images: [img("Front", "sand"), img("Interior", "stone")],
    description: {
      ja: "使用感はございますが、内部の状態は良好です。日々の実用に。",
      zh: "外观有一定使用痕迹，内部状态良好，适合日常实用。",
    },
  },
  {
    slug: "atelier-cendre-card-case-noir",
    category: "small-leather-goods",
    brand: "Atelier Cendre",
    name: { ja: "カードケース ノワール", zh: "卡夹 · 墨黑" },
    price: 32000,
    condition: "S",
    color: { ja: "ブラック", zh: "黑色" },
    colorKey: "black",
    material: { ja: "カーフレザー", zh: "小牛皮" },
    size: { ja: "W11 × H8 × D1 cm", zh: "宽11 × 高8 × 厚1 cm" },
    accessories: { ja: "箱、カード", zh: "外盒、保卡" },
    itemNumber: "EA-SLG-3055",
    channels: ["rakuten", "ebay"],
    images: [img("Front", "ink")],
    description: {
      ja: "未使用に近い美しい状態のカードケース。ギフトにもおすすめです。",
      zh: "近乎未使用的精致状态，也很适合作为礼物。",
    },
  },
  {
    slug: "lumiere-co-solitaire-ring-diamant",
    category: "jewelry",
    brand: "Lumière & Co",
    name: { ja: "ソリテール リング ダイヤモンド", zh: "单钻戒指" },
    price: 458000,
    condition: "S",
    color: { ja: "プラチナ", zh: "铂金" },
    colorKey: "platinum",
    material: { ja: "Pt950 / ダイヤモンド 0.3ct", zh: "Pt950 / 钻石 0.3克拉" },
    size: { ja: "8号", zh: "8号圈" },
    accessories: { ja: "鑑別書、箱", zh: "鉴定证书、外盒" },
    itemNumber: "EA-JW-4001",
    channels: ["rakuten", "yahoo", "ebay"],
    images: [img("Front", "stone"), img("Detail", "sand")],
    description: {
      ja: "上品な輝きを放つソリテールリング。鑑別書付きで安心してお求めいただけます。",
      zh: "光泽典雅的单钻戒指，附鉴定证书，安心可靠。",
    },
    isNew: true,
  },
  {
    slug: "lumiere-co-pearl-necklace-classique",
    category: "jewelry",
    brand: "Lumière & Co",
    name: { ja: "パール ネックレス クラシック", zh: "珍珠项链 · 经典款" },
    price: 128000,
    condition: "A",
    color: { ja: "ホワイト", zh: "白色" },
    colorKey: "white",
    material: { ja: "あこや真珠 / K18", zh: "日本Akoya珍珠 / K18金" },
    size: { ja: "全長42cm", zh: "全长42cm" },
    accessories: { ja: "箱", zh: "外盒" },
    itemNumber: "EA-JW-4023",
    channels: ["yahoo", "ebay"],
    images: [img("Front", "sand")],
    description: {
      ja: "上質なあこや真珠を用いた定番デザイン。どんなシーンにも寄り添います。",
      zh: "选用优质Akoya珍珠的经典设计，百搭百场合。",
    },
  },
  {
    slug: "rive-noire-tennis-bracelet",
    category: "jewelry",
    brand: "Rive Noire",
    name: { ja: "テニスブレスレット", zh: "网球手链" },
    price: 216000,
    condition: "AB",
    color: { ja: "シルバー", zh: "银色" },
    colorKey: "silver",
    material: { ja: "K18WG / ダイヤモンド", zh: "K18白金 / 钻石" },
    size: { ja: "全長17cm", zh: "全长17cm" },
    accessories: { ja: "なし", zh: "无" },
    itemNumber: "EA-JW-4077",
    channels: ["rakuten"],
    images: [img("Front", "ink")],
    description: {
      ja: "煌びやかな輝きが手元を上品に彩ります。使用感はわずかです。",
      zh: "熠熠光泽点亮腕间，仅有极轻微使用痕迹。",
    },
  },
  {
    slug: "belle-rivage-hobo-taupe",
    category: "handbags",
    brand: "Belle Rivage",
    name: { ja: "ホーボーバッグ トープ", zh: "流线包 · 灰褐色" },
    price: 176000,
    condition: "A",
    color: { ja: "トープ", zh: "灰褐色" },
    colorKey: "taupe",
    material: { ja: "ソフトカーフ", zh: "软牛皮" },
    size: { ja: "W32 × H24 × D8 cm", zh: "宽32 × 高24 × 厚8 cm" },
    accessories: { ja: "保存袋", zh: "防尘袋" },
    itemNumber: "EA-HB-1120",
    channels: ["rakuten", "yahoo"],
    images: [img("Front", "stone"), img("Interior", "sand")],
    description: {
      ja: "柔らかなフォルムが魅力のホーボーバッグ。荷物が多い日にも便利です。",
      zh: "柔和线条设计，容量充足，是日常出行的实用之选。",
    },
  },
  {
    slug: "nord-atelier-bucket-ardoise",
    category: "shoulder-bags",
    brand: "Nord Atelier",
    name: { ja: "バケットバッグ アルドワーズ", zh: "水桶包 · 石板灰" },
    price: 138000,
    condition: "B",
    color: { ja: "グレー", zh: "灰色" },
    colorKey: "gray",
    material: { ja: "スエード", zh: "麂皮" },
    size: { ja: "W20 × H22 × D14 cm", zh: "宽20 × 高22 × 厚14 cm" },
    accessories: { ja: "巾着", zh: "束口内袋" },
    itemNumber: "EA-SB-2099",
    channels: ["yahoo", "ebay"],
    images: [img("Front", "ink")],
    description: {
      ja: "落ち着いたグレーが季節を問わず使いやすいバケットバッグです。",
      zh: "沉稳灰调，四季皆宜的实用水桶包。",
    },
  },
  {
    slug: "atelier-cendre-coin-purse-bordeaux",
    category: "small-leather-goods",
    brand: "Atelier Cendre",
    name: { ja: "コインパース ボルドー", zh: "零钱包 · 波尔多红" },
    price: 24000,
    condition: "S",
    color: { ja: "ボルドー", zh: "波尔多红" },
    colorKey: "bordeaux",
    material: { ja: "カーフレザー", zh: "小牛皮" },
    size: { ja: "W9 × H7 × D3 cm", zh: "宽9 × 高7 × 厚3 cm" },
    accessories: { ja: "箱", zh: "外盒" },
    itemNumber: "EA-SLG-3090",
    channels: ["rakuten", "yahoo", "ebay"],
    images: [img("Front", "wine")],
    description: {
      ja: "深みのあるボルドーカラーが上品なコインパース。新品同様の状態です。",
      zh: "深邃波尔多红，典雅精致，近乎全新的状态。",
    },
  },
];

export function getFeaturedProducts(count = 6): Product[] {
  return products.slice(0, count);
}

export function getProductsByCategory(category: Product["category"]): Product[] {
  return products.filter((product) => product.category === category);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product, count = 4): Product[] {
  return products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .concat(products.filter((p) => p.slug !== product.slug && p.category !== product.category))
    .slice(0, count);
}
