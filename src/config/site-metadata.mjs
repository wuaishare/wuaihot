export const DEFAULT_LOCALE = "zh-CN";

export const SUPPORTED_LOCALES = [
  {
    code: "zh-CN",
    routePrefix: "",
    routeParam: "zh-cn",
    htmlLang: "zh-CN",
    translateJs: "chinese_simplified",
    flag: "/flags/cn.svg",
    label: "简体中文",
    shortLabel: "简中",
  },
  {
    code: "en",
    routePrefix: "/en",
    routeParam: "en",
    htmlLang: "en",
    translateJs: "english",
    flag: "/flags/us.svg",
    label: "English",
    shortLabel: "EN",
  },
  {
    code: "zh-TW",
    routePrefix: "/zh-tw",
    routeParam: "zh-tw",
    htmlLang: "zh-TW",
    translateJs: "chinese_traditional",
    flag: "/flags/tw.svg",
    label: "繁體中文",
    shortLabel: "繁中",
  },
  {
    code: "ja",
    routePrefix: "/ja",
    routeParam: "ja",
    htmlLang: "ja",
    translateJs: "japanese",
    flag: "/flags/jp.svg",
    label: "日本語",
    shortLabel: "JP",
  },
  {
    code: "ko",
    routePrefix: "/ko",
    routeParam: "ko",
    htmlLang: "ko",
    translateJs: "korean",
    flag: "/flags/kr.svg",
    label: "한국어",
    shortLabel: "KR",
  },
];

export const BUILTIN_CATEGORIES = [
  {
    id: "general",
    name: "综合",
    slug: "general",
    navOrder: 0,
    navigation: false,
    role: "aggregate-view",
    labels: {
      "zh-CN": "综合",
      en: "General",
      "zh-TW": "綜合",
      ja: "総合",
      ko: "종합",
    },
  },
  {
    id: "news",
    name: "新闻",
    slug: "news",
    navOrder: 10,
    labels: {
      "zh-CN": "新闻",
      en: "News",
      "zh-TW": "新聞",
      ja: "ニュース",
      ko: "뉴스",
    },
  },
  {
    id: "news-domestic",
    name: "国内资讯",
    slug: "domestic-news",
    parentId: "news",
    labels: {
      "zh-CN": "国内资讯",
      en: "Domestic",
      "zh-TW": "國內資訊",
      ja: "国内ニュース",
      ko: "국내 뉴스",
    },
  },
  {
    id: "news-world",
    name: "国际资讯",
    slug: "world-news",
    parentId: "news",
    labels: {
      "zh-CN": "国际资讯",
      en: "World",
      "zh-TW": "國際資訊",
      ja: "国際ニュース",
      ko: "국제 뉴스",
    },
  },
  {
    id: "news-depth",
    name: "深度与观点",
    slug: "news-depth",
    parentId: "news",
    labels: {
      "zh-CN": "深度与观点",
      en: "Depth & Opinion",
      "zh-TW": "深度與觀點",
      ja: "深掘り・論評",
      ko: "심층·오피니언",
    },
  },
  {
    id: "tech",
    name: "科技",
    slug: "tech",
    navOrder: 20,
    labels: {
      "zh-CN": "科技",
      en: "Tech",
      "zh-TW": "科技",
      ja: "テック",
      ko: "기술",
    },
  },
  {
    id: "tech-digital",
    name: "数码与应用",
    slug: "digital-tech",
    parentId: "tech",
    labels: {
      "zh-CN": "数码与应用",
      en: "Digital & Apps",
      "zh-TW": "數碼與應用",
      ja: "デジタル・アプリ",
      ko: "디지털·앱",
    },
  },
  {
    id: "tech-industry",
    name: "互联网与产业",
    slug: "tech-industry",
    parentId: "tech",
    labels: {
      "zh-CN": "互联网与产业",
      en: "Internet & Industry",
      "zh-TW": "互聯網與產業",
      ja: "インターネット・産業",
      ko: "인터넷·산업",
    },
  },
  {
    id: "tech-developer",
    name: "开发者",
    slug: "developer",
    parentId: "tech",
    labels: {
      "zh-CN": "开发者",
      en: "Developers",
      "zh-TW": "開發者",
      ja: "開発者",
      ko: "개발자",
    },
  },
  {
    id: "tech-developer-security",
    name: "网络安全",
    slug: "security",
    parentId: "tech-developer",
    labels: {
      "zh-CN": "网络安全",
      en: "Security",
      "zh-TW": "網路安全",
      ja: "セキュリティ",
      ko: "보안",
    },
  },
  {
    id: "tech-science",
    name: "科学与前沿",
    slug: "science",
    parentId: "tech",
    labels: {
      "zh-CN": "科学与前沿",
      en: "Science",
      "zh-TW": "科學與前沿",
      ja: "科学・先端",
      ko: "과학·첨단",
    },
  },
  {
    id: "tech-design",
    name: "设计",
    slug: "design",
    parentId: "tech",
    labels: {
      "zh-CN": "设计",
      en: "Design",
      "zh-TW": "設計",
      ja: "デザイン",
      ko: "디자인",
    },
  },
  {
    id: "finance",
    name: "财经",
    slug: "finance",
    navOrder: 40,
    labels: {
      "zh-CN": "财经",
      en: "Finance",
      "zh-TW": "財經",
      ja: "金融",
      ko: "금융",
    },
  },
  {
    id: "finance-flash",
    name: "实时快讯",
    slug: "finance-flash",
    parentId: "finance",
    labels: {
      "zh-CN": "实时快讯",
      en: "Live Flash",
      "zh-TW": "即時快訊",
      ja: "リアルタイム速報",
      ko: "실시간 속보",
    },
  },
  {
    id: "finance-market",
    name: "市场热度",
    slug: "market-trends",
    parentId: "finance",
    labels: {
      "zh-CN": "市场热度",
      en: "Market Trends",
      "zh-TW": "市場熱度",
      ja: "市場トレンド",
      ko: "시장 동향",
    },
  },
  {
    id: "finance-indexes",
    name: "全球股指",
    slug: "global-indexes",
    parentId: "finance",
    labels: {
      "zh-CN": "全球股指",
      en: "Global Indexes",
      "zh-TW": "全球股指",
      ja: "世界株価指数",
      ko: "글로벌 주가지수",
    },
  },
  {
    id: "finance-exchanges",
    name: "交易所",
    slug: "exchanges",
    parentId: "finance",
    labels: {
      "zh-CN": "交易所",
      en: "Exchanges",
      "zh-TW": "交易所",
      ja: "取引所",
      ko: "거래소",
    },
  },
  {
    id: "life",
    name: "生活",
    slug: "life",
    navOrder: 80,
    labels: {
      "zh-CN": "生活",
      en: "Life",
      "zh-TW": "生活",
      ja: "生活",
      ko: "생활",
    },
  },
  {
    id: "life-deals",
    name: "优惠省钱",
    slug: "deals",
    parentId: "life",
    labels: {
      "zh-CN": "优惠省钱",
      en: "Deals & Savings",
      "zh-TW": "優惠省錢",
      ja: "お得・節約",
      ko: "할인·절약",
    },
  },
  {
    id: "life-auto",
    name: "汽车",
    slug: "auto",
    parentId: "life",
    labels: {
      "zh-CN": "汽车",
      en: "Auto",
      "zh-TW": "汽車",
      ja: "自動車",
      ko: "자동차",
    },
  },
  {
    id: "life-health",
    name: "健康",
    slug: "health",
    parentId: "life",
    labels: {
      "zh-CN": "健康",
      en: "Health",
      "zh-TW": "健康",
      ja: "健康",
      ko: "건강",
    },
  },
  {
    id: "life-education",
    name: "教育知识",
    slug: "education",
    parentId: "life",
    labels: {
      "zh-CN": "教育知识",
      en: "Education",
      "zh-TW": "教育知識",
      ja: "教育・知識",
      ko: "교육·지식",
    },
  },
  {
    id: "life-consumer",
    name: "消费生活",
    slug: "consumer-life",
    parentId: "life",
    labels: {
      "zh-CN": "消费生活",
      en: "Consumer Life",
      "zh-TW": "消費生活",
      ja: "消費生活",
      ko: "소비 생활",
    },
  },
  {
    id: "life-public",
    name: "公共生活",
    slug: "public-life",
    parentId: "life",
    labels: {
      "zh-CN": "公共生活",
      en: "Public Life",
      "zh-TW": "公共生活",
      ja: "公共生活",
      ko: "공공 생활",
    },
  },
  {
    id: "entertainment",
    name: "文娱",
    slug: "entertainment",
    navOrder: 50,
    labels: {
      "zh-CN": "文娱",
      en: "Entertainment",
      "zh-TW": "文娛",
      ja: "エンタメ",
      ko: "엔터테인먼트",
    },
  },
  {
    id: "entertainment-music",
    name: "音乐",
    slug: "music",
    parentId: "entertainment",
    labels: {
      "zh-CN": "音乐",
      en: "Music",
      "zh-TW": "音樂",
      ja: "音楽",
      ko: "음악",
    },
  },
  {
    id: "entertainment-music-songs",
    name: "歌曲",
    slug: "songs",
    parentId: "entertainment-music",
    labels: {
      "zh-CN": "歌曲",
      en: "Songs",
      "zh-TW": "歌曲",
      ja: "楽曲",
      ko: "노래",
    },
  },
  {
    id: "entertainment-music-albums",
    name: "专辑",
    slug: "albums",
    parentId: "entertainment-music",
    labels: {
      "zh-CN": "专辑",
      en: "Albums",
      "zh-TW": "專輯",
      ja: "アルバム",
      ko: "앨범",
    },
  },
  {
    id: "entertainment-music-artists",
    name: "歌手",
    slug: "artists",
    parentId: "entertainment-music",
    labels: {
      "zh-CN": "歌手",
      en: "Artists",
      "zh-TW": "歌手",
      ja: "アーティスト",
      ko: "아티스트",
    },
  },
  {
    id: "entertainment-music-playlists",
    name: "歌单",
    slug: "playlists",
    parentId: "entertainment-music",
    labels: {
      "zh-CN": "歌单",
      en: "Playlists",
      "zh-TW": "歌單",
      ja: "プレイリスト",
      ko: "플레이리스트",
    },
  },
  {
    id: "entertainment-audio",
    name: "音频",
    slug: "audio",
    parentId: "entertainment",
    labels: {
      "zh-CN": "音频",
      en: "Audio",
      "zh-TW": "音訊",
      ja: "オーディオ",
      ko: "오디오",
    },
  },
  {
    id: "entertainment-audio-podcasts",
    name: "播客",
    slug: "podcasts",
    parentId: "entertainment-audio",
    labels: {
      "zh-CN": "播客",
      en: "Podcasts",
      "zh-TW": "Podcast",
      ja: "ポッドキャスト",
      ko: "팟캐스트",
    },
  },
  {
    id: "entertainment-audio-audiobooks",
    name: "有声书",
    slug: "audiobooks",
    parentId: "entertainment-audio",
    labels: {
      "zh-CN": "有声书",
      en: "Audiobooks",
      "zh-TW": "有聲書",
      ja: "オーディオブック",
      ko: "오디오북",
    },
  },
  {
    id: "entertainment-audio-drama",
    name: "音频剧",
    slug: "audio-drama",
    parentId: "entertainment-audio",
    labels: {
      "zh-CN": "音频剧",
      en: "Audio Drama",
      "zh-TW": "音訊劇",
      ja: "オーディオドラマ",
      ko: "오디오 드라마",
    },
  },
  {
    id: "entertainment-audio-radio",
    name: "广播电台",
    slug: "radio",
    parentId: "entertainment-audio",
    labels: {
      "zh-CN": "广播电台",
      en: "Radio",
      "zh-TW": "廣播電台",
      ja: "ラジオ",
      ko: "라디오",
    },
  },
  {
    id: "entertainment-video",
    name: "影视",
    slug: "film-tv",
    parentId: "entertainment",
    labels: {
      "zh-CN": "影视",
      en: "Film & TV",
      "zh-TW": "影視",
      ja: "映画・TV",
      ko: "영화·TV",
    },
  },
  {
    id: "entertainment-video-movie",
    name: "电影",
    slug: "movies",
    parentId: "entertainment-video",
    labels: {
      "zh-CN": "电影",
      en: "Movies",
      "zh-TW": "電影",
      ja: "映画",
      ko: "영화",
    },
  },
  {
    id: "entertainment-video-tv",
    name: "电视剧",
    slug: "tv",
    parentId: "entertainment-video",
    labels: {
      "zh-CN": "电视剧",
      en: "TV Series",
      "zh-TW": "電視劇",
      ja: "ドラマ",
      ko: "드라마",
    },
  },
  {
    id: "entertainment-video-variety",
    name: "综艺",
    slug: "variety",
    parentId: "entertainment-video",
    labels: {
      "zh-CN": "综艺",
      en: "Variety",
      "zh-TW": "綜藝",
      ja: "バラエティ",
      ko: "예능",
    },
  },
  {
    id: "entertainment-video-shortdrama",
    name: "短剧",
    slug: "short-drama",
    parentId: "entertainment-video",
    labels: {
      "zh-CN": "短剧",
      en: "Short Drama",
      "zh-TW": "短劇",
      ja: "ショートドラマ",
      ko: "숏드라마",
    },
  },
  {
    id: "entertainment-video-animation",
    name: "动画",
    slug: "animation",
    parentId: "entertainment-video",
    labels: {
      "zh-CN": "动画",
      en: "Animation",
      "zh-TW": "動畫",
      ja: "アニメ",
      ko: "애니메이션",
    },
  },
  {
    id: "entertainment-reading",
    name: "阅读",
    slug: "reading",
    parentId: "entertainment",
    labels: {
      "zh-CN": "阅读",
      en: "Reading",
      "zh-TW": "閱讀",
      ja: "読書",
      ko: "독서",
    },
  },
  {
    id: "entertainment-reading-books",
    name: "图书",
    slug: "books",
    parentId: "entertainment-reading",
    labels: {
      "zh-CN": "图书",
      en: "Books",
      "zh-TW": "圖書",
      ja: "書籍",
      ko: "도서",
    },
  },
  {
    id: "entertainment-reading-novels",
    name: "网络小说",
    slug: "novels",
    parentId: "entertainment-reading",
    labels: {
      "zh-CN": "网络小说",
      en: "Web Novels",
      "zh-TW": "網路小說",
      ja: "ウェブ小説",
      ko: "웹소설",
    },
  },
  {
    id: "entertainment-reading-comics",
    name: "漫画",
    slug: "comics",
    parentId: "entertainment-reading",
    labels: {
      "zh-CN": "漫画",
      en: "Comics",
      "zh-TW": "漫畫",
      ja: "マンガ",
      ko: "만화",
    },
  },
  {
    id: "games",
    name: "游戏",
    slug: "games",
    navOrder: 60,
    labels: {
      "zh-CN": "游戏",
      en: "Games",
      "zh-TW": "遊戲",
      ja: "ゲーム",
      ko: "게임",
    },
  },
  {
    id: "games-ranking",
    name: "游戏榜单",
    slug: "game-rankings",
    parentId: "games",
    labels: {
      "zh-CN": "游戏榜单",
      en: "Game Rankings",
      "zh-TW": "遊戲榜單",
      ja: "ゲームランキング",
      ko: "게임 랭킹",
    },
  },
  {
    id: "games-content",
    name: "游戏内容",
    slug: "game-content",
    parentId: "games",
    labels: {
      "zh-CN": "游戏内容",
      en: "Game Content",
      "zh-TW": "遊戲內容",
      ja: "ゲームコンテンツ",
      ko: "게임 콘텐츠",
    },
  },
  {
    id: "games-community",
    name: "玩家社区",
    slug: "game-community",
    parentId: "games",
    labels: {
      "zh-CN": "玩家社区",
      en: "Game Community",
      "zh-TW": "玩家社群",
      ja: "ゲームコミュニティ",
      ko: "게임 커뮤니티",
    },
  },
  {
    id: "games-esports",
    name: "电竞",
    slug: "esports",
    parentId: "games",
    labels: {
      "zh-CN": "电竞",
      en: "Esports",
      "zh-TW": "電競",
      ja: "eスポーツ",
      ko: "e스포츠",
    },
  },
  {
    id: "games-deals",
    name: "游戏优惠",
    slug: "game-deals",
    parentId: "games",
    labels: {
      "zh-CN": "游戏优惠",
      en: "Game Deals",
      "zh-TW": "遊戲優惠",
      ja: "ゲームセール",
      ko: "게임 할인",
    },
  },
  {
    id: "sports",
    name: "体育",
    slug: "sports",
    navOrder: 70,
    labels: {
      "zh-CN": "体育",
      en: "Sports",
      "zh-TW": "體育",
      ja: "スポーツ",
      ko: "스포츠",
    },
  },
  {
    id: "sports-general",
    name: "综合体育",
    slug: "general-sports",
    parentId: "sports",
    labels: {
      "zh-CN": "综合体育",
      en: "General Sports",
      "zh-TW": "綜合體育",
      ja: "総合スポーツ",
      ko: "종합 스포츠",
    },
  },
  {
    id: "sports-football",
    name: "足球",
    slug: "football",
    parentId: "sports",
    labels: {
      "zh-CN": "足球",
      en: "Football",
      "zh-TW": "足球",
      ja: "サッカー",
      ko: "축구",
    },
  },
  {
    id: "sports-basketball",
    name: "篮球",
    slug: "basketball",
    parentId: "sports",
    labels: {
      "zh-CN": "篮球",
      en: "Basketball",
      "zh-TW": "籃球",
      ja: "バスケットボール",
      ko: "농구",
    },
  },
  {
    id: "community",
    name: "社区",
    slug: "community",
    navOrder: 90,
    labels: {
      "zh-CN": "社区",
      en: "Community",
      "zh-TW": "社群",
      ja: "コミュニティ",
      ko: "커뮤니티",
    },
  },
  {
    id: "community-general",
    name: "综合社区",
    slug: "general-community",
    parentId: "community",
    labels: {
      "zh-CN": "综合社区",
      en: "General Community",
      "zh-TW": "綜合社群",
      ja: "総合コミュニティ",
      ko: "종합 커뮤니티",
    },
  },
  {
    id: "community-tech",
    name: "技术社区",
    slug: "tech-community",
    parentId: "community",
    labels: {
      "zh-CN": "技术社区",
      en: "Tech Community",
      "zh-TW": "技術社群",
      ja: "技術コミュニティ",
      ko: "기술 커뮤니티",
    },
  },
  {
    id: "community-interest",
    name: "兴趣社区",
    slug: "interest-community",
    parentId: "community",
    labels: {
      "zh-CN": "兴趣社区",
      en: "Interest Community",
      "zh-TW": "興趣社群",
      ja: "趣味コミュニティ",
      ko: "관심사 커뮤니티",
    },
  },
  {
    id: "ai",
    name: "AI",
    slug: "ai",
    navOrder: 30,
    labels: {
      "zh-CN": "AI",
      en: "AI",
      "zh-TW": "AI",
      ja: "AI",
      ko: "AI",
    },
  },
  {
    id: "ai-models",
    name: "模型评测",
    slug: "ai-models",
    parentId: "ai",
    labels: {
      "zh-CN": "模型评测",
      en: "Model Benchmarks",
      "zh-TW": "模型評測",
      ja: "モデル評価",
      ko: "모델 평가",
    },
  },
  {
    id: "ai-products",
    name: "产品生态",
    slug: "ai-products",
    parentId: "ai",
    labels: {
      "zh-CN": "产品生态",
      en: "Products & Ecosystem",
      "zh-TW": "產品生態",
      ja: "製品・エコシステム",
      ko: "제품·생태계",
    },
  },
  {
    id: "ai-official",
    name: "官方动态",
    slug: "ai-official",
    parentId: "ai",
    labels: {
      "zh-CN": "官方动态",
      en: "Official Updates",
      "zh-TW": "官方動態",
      ja: "公式アップデート",
      ko: "공식 업데이트",
    },
  },
  {
    id: "ai-research-community",
    name: "研究社区",
    slug: "ai-research-community",
    parentId: "ai",
    labels: {
      "zh-CN": "研究社区",
      en: "Research & Community",
      "zh-TW": "研究社群",
      ja: "研究・コミュニティ",
      ko: "연구·커뮤니티",
    },
  },
  {
    id: "ai-chinese-news",
    name: "中文AI资讯",
    slug: "chinese-ai-news",
    parentId: "ai",
    labels: {
      "zh-CN": "中文AI资讯",
      en: "Chinese AI News",
      "zh-TW": "中文AI資訊",
      ja: "中国語AIニュース",
      ko: "중국어 AI 뉴스",
    },
  },
];

export const LOCALE_STORAGE_KEY = "dailyhot:locale";

export const WOOL_TOPIC_METADATA = {
  "zh-CN": {
    eyebrow: "实时机会",
    title: "现在值得马上领、抢、用的羊毛",
    description:
      "聚合红包、优惠券、外卖/闪购券、打车券、免单赠品与免费额度，优先展示当前仍值得行动的高信噪消费福利。",
    highlights: "来源精选",
    feedTitle: "实时机会",
    method:
      "排序综合来源可信度、时效与行动信号；不同平台原始热度不直接横向比较。",
    degraded: "部分来源暂时不可用，当前仍展示其余来源的最新机会。",
    empty: "当前筛选暂无机会",
    open: "查看机会",
    all: "全部",
    intents: {
      free: "免费 / 限免",
      red_packet: "红包",
      coupon: "优惠券",
      delivery: "外卖 / 闪购券",
      ride: "打车券",
      giveaway: "抽奖 / 赠送",
      ai: "AI 额度",
      deal: "其它优惠",
    },
    seoTitle: "实时羊毛专题 - 红包、优惠券、外卖闪购券与打车券 | 吾爱热榜",
    seoDescription:
      "实时羊毛专题聚合超级线报、豆瓣、0818团与 NodeLoc 等高时效消费福利，覆盖红包、优惠券、外卖/闪购券、打车券、免单赠品、抽奖与免费额度。",
    seoKeywords:
      "羊毛专题,实时羊毛,红包,优惠券,外卖券,闪购券,打车券,免单,免费福利,抽奖,免费额度,超级线报,豆瓣羊毛,豆瓣宠物羊毛,0818团,NodeLoc",
  },
  en: {
    eyebrow: "Live Opportunities",
    title: "Deals worth claiming right now",
    description:
      "A high-signal feed of red packets, coupons, delivery and instant-retail vouchers, ride coupons, freebies, giveaways and free AI credits.",
    highlights: "Source Highlights",
    feedTitle: "Live Opportunities",
    method:
      "Ranking combines source reliability, freshness and action signals; raw popularity values across platforms are not compared directly.",
    degraded:
      "Some sources are temporarily unavailable. Latest opportunities from the remaining sources are still shown.",
    empty: "No opportunities match this filter right now.",
    open: "View offer",
    all: "All",
    intents: {
      free: "Free / Limited",
      red_packet: "Red Packets",
      coupon: "Coupons",
      delivery: "Delivery / Instant Retail",
      ride: "Ride Coupons",
      giveaway: "Giveaways",
      ai: "AI Credits",
      deal: "Other Deals",
    },
    seoTitle:
      "Live Deals & Freebies - Red Packets, Coupons, Delivery & Ride Vouchers | wuaihot",
    seoDescription:
      "Live consumer deals from Super Deals, Douban, 0818 and NodeLoc, covering red packets, coupons, delivery and instant-retail vouchers, ride coupons, freebies, giveaways and AI credits.",
    seoKeywords:
      "live deals,red packets,coupons,delivery vouchers,instant retail vouchers,ride coupons,freebies,giveaways,free AI credits,Super Deals,Douban,0818,NodeLoc,wuaihot",
  },
  "zh-TW": {
    eyebrow: "即時機會",
    title: "現在值得馬上領、搶、用的優惠",
    description:
      "彙整紅包、優惠券、外賣/閃購券、叫車券、免單贈品與免費額度，優先顯示目前仍值得行動的高訊噪消費優惠。",
    highlights: "來源精選",
    feedTitle: "即時機會",
    method:
      "排序綜合來源可信度、時效與行動訊號；不同平台原始熱度不直接橫向比較。",
    degraded: "部分來源暫時無法使用，目前仍顯示其他來源的最新機會。",
    empty: "目前篩選沒有可用機會",
    open: "查看機會",
    all: "全部",
    intents: {
      free: "免費 / 限免",
      red_packet: "紅包",
      coupon: "優惠券",
      delivery: "外賣 / 閃購券",
      ride: "叫車券",
      giveaway: "抽獎 / 贈送",
      ai: "AI 額度",
      deal: "其他優惠",
    },
    seoTitle: "即時優惠專題 - 紅包、優惠券、外賣閃購券與叫車券 | 吾愛熱榜",
    seoDescription:
      "即時優惠專題彙整超級線報、豆瓣、0818團與 NodeLoc 等高時效消費福利，涵蓋紅包、優惠券、外賣/閃購券、叫車券、免單贈品、抽獎與免費額度。",
    seoKeywords:
      "即時優惠,紅包,優惠券,外賣券,閃購券,叫車券,免單,免費福利,抽獎,免費額度,超級線報,豆瓣優惠,0818團,NodeLoc,吾愛熱榜",
  },
  ja: {
    eyebrow: "リアルタイム特典",
    title: "今すぐ受け取りたいお得情報",
    description:
      "紅包、クーポン、デリバリー/即時小売クーポン、配車クーポン、無料特典、抽選、無料AIクレジットをまとめ、今すぐ使う価値のある情報を優先します。",
    highlights: "情報源ピックアップ",
    feedTitle: "リアルタイム特典",
    method:
      "情報源の信頼度・新しさ・行動シグナルで順位付けし、異なるプラットフォームの生の人気値は直接比較しません。",
    degraded:
      "一部の情報源が一時利用できません。利用可能な情報源の最新情報を表示しています。",
    empty: "この条件に一致する情報はありません",
    open: "詳細を見る",
    all: "すべて",
    intents: {
      free: "無料 / 期間限定",
      red_packet: "紅包",
      coupon: "クーポン",
      delivery: "デリバリー / 即時小売",
      ride: "配車クーポン",
      giveaway: "抽選 / プレゼント",
      ai: "AIクレジット",
      deal: "その他",
    },
    seoTitle:
      "リアルタイムお得情報 - 紅包・クーポン・デリバリー・配車特典 | wuaihot",
    seoDescription:
      "Super Deals、Douban、0818、NodeLoc などから、紅包、クーポン、デリバリー/即時小売、配車、無料特典、抽選、AIクレジットをまとめます。",
    seoKeywords:
      "お得情報,紅包,クーポン,デリバリークーポン,即時小売,配車クーポン,無料特典,抽選,AIクレジット,Douban,0818,NodeLoc,wuaihot",
  },
  ko: {
    eyebrow: "실시간 혜택",
    title: "지금 바로 챙길 만한 혜택",
    description:
      "홍바오, 쿠폰, 배달/즉시소매 쿠폰, 택시 쿠폰, 무료 혜택, 경품, 무료 AI 크레딧을 모아 지금 바로 쓸 가치가 높은 정보를 우선합니다.",
    highlights: "출처별 추천",
    feedTitle: "실시간 혜택",
    method:
      "출처 신뢰도, 최신성, 행동 신호를 함께 반영하며 플랫폼 간 원시 인기 수치를 직접 비교하지 않습니다.",
    degraded:
      "일부 출처를 일시적으로 사용할 수 없습니다. 나머지 출처의 최신 혜택을 계속 표시합니다.",
    empty: "현재 조건에 맞는 혜택이 없습니다",
    open: "혜택 보기",
    all: "전체",
    intents: {
      free: "무료 / 한정",
      red_packet: "홍바오",
      coupon: "쿠폰",
      delivery: "배달 / 즉시소매",
      ride: "택시 쿠폰",
      giveaway: "경품 / 증정",
      ai: "AI 크레딧",
      deal: "기타 혜택",
    },
    seoTitle: "실시간 혜택 - 홍바오·쿠폰·배달·택시 혜택 | wuaihot",
    seoDescription:
      "Super Deals, Douban, 0818, NodeLoc 등의 홍바오, 쿠폰, 배달/즉시소매 쿠폰, 택시 쿠폰, 무료 혜택, 경품, AI 크레딧을 한곳에서 확인합니다.",
    seoKeywords:
      "실시간 혜택,홍바오,쿠폰,배달 쿠폰,즉시소매,택시 쿠폰,무료 혜택,경품,AI 크레딧,Douban,0818,NodeLoc,wuaihot",
  },
};

export const GAME_DEALS_TOPIC_METADATA = {
  "zh-CN": {
    title: "实时游戏优惠与史低",
    description:
      "聚合 Steam、Epic、GOG、小黑盒、GG.deals 与 IT之家喜加一，优先展示免费领取、新史低、史低、90%+ 高折扣和 30 元以内的高价值游戏机会。",
    feedTitle: "游戏优惠雷达",
    open: "查看游戏优惠",
    empty: "当前筛选暂无游戏优惠",
    seoTitle: "实时游戏优惠与史低 - Steam 特惠、Epic 免费游戏 | 吾爱热榜",
    seoDescription:
      "实时聚合 Steam 特惠、Epic 免费游戏、GOG 折扣、小黑盒史低、GG.deals 与 IT之家喜加一，追踪免费领取、新史低、90%+ 折扣和 10/30 元低价游戏。",
    seoKeywords:
      "游戏优惠,游戏史低,Steam特惠,Epic免费游戏,GOG游戏折扣,小黑盒游戏折扣,GG.deals,喜加一,90%折扣,10元游戏,30元游戏,限时免费",
  },
  en: {
    title: "Live Game Deals & Historical Lows",
    description:
      "Track Steam, Epic, GOG, Xiaoheihe, GG.deals and ITHome for free games, new historical lows, 90%+ discounts and high-value games under CNY 30.",
    feedTitle: "Game Deal Radar",
    open: "View game deals",
    empty: "No game deals match this filter.",
    seoTitle:
      "Live Game Deals & Historical Lows - Steam Sales, Epic Free Games | wuaihot",
    seoDescription:
      "Track Steam sales, Epic free games, GOG deals, Xiaoheihe historical lows, GG.deals and ITHome for free games, deep discounts and low-price offers.",
    seoKeywords:
      "game deals,historical low,Steam sales,Epic free games,GOG deals,Xiaoheihe,GG.deals,free games,90% discount,cheap PC games,wuaihot",
  },
  "zh-TW": {
    title: "即時遊戲優惠與史低",
    description:
      "彙整 Steam、Epic、GOG、小黑盒、GG.deals 與 IT之家喜加一，優先顯示免費領取、新史低、史低、90%+ 折扣與 30 元以內高價值遊戲。",
    feedTitle: "遊戲優惠雷達",
    open: "查看遊戲優惠",
    empty: "目前篩選沒有遊戲優惠",
    seoTitle: "即時遊戲優惠與史低 - Steam 特惠、Epic 免費遊戲 | 吾愛熱榜",
    seoDescription:
      "即時追蹤 Steam 特惠、Epic 免費遊戲、GOG 折扣、小黑盒史低、GG.deals 與 IT之家喜加一，涵蓋免費、新史低、90%+ 折扣與低價遊戲。",
    seoKeywords:
      "遊戲優惠,遊戲史低,Steam特惠,Epic免費遊戲,GOG遊戲折扣,小黑盒遊戲折扣,GG.deals,喜加一,90%折扣,低價遊戲,吾愛熱榜",
  },
  ja: {
    title: "リアルタイムゲームセール・史上最安",
    description:
      "Steam、Epic、GOG、Xiaoheihe、GG.deals、ITHome を集約し、無料配布、新たな史上最安、90%以上の割引、30元以下の高価値ゲームを優先表示します。",
    feedTitle: "ゲームセールレーダー",
    open: "ゲームセールを見る",
    empty: "条件に一致するゲームセールはありません",
    seoTitle: "ゲームセール・史上最安 - Steamセール、Epic無料ゲーム | wuaihot",
    seoDescription:
      "Steamセール、Epic無料ゲーム、GOGセール、Xiaoheihe史上最安、GG.deals、ITHomeをリアルタイム集約し、無料配布や大幅割引を追跡します。",
    seoKeywords:
      "ゲームセール,史上最安,Steamセール,Epic無料ゲーム,GOGセール,Xiaoheihe,GG.deals,無料配布,90%オフ,格安ゲーム,wuaihot",
  },
  ko: {
    title: "실시간 게임 할인·역대 최저가",
    description:
      "Steam, Epic, GOG, Xiaoheihe, GG.deals, ITHome을 모아 무료 배포, 신규 역대 최저가, 90%+ 할인, 30위안 이하 고가치 게임을 우선 제공합니다.",
    feedTitle: "게임 할인 레이더",
    open: "게임 할인 보기",
    empty: "조건에 맞는 게임 할인이 없습니다",
    seoTitle: "게임 할인·역대 최저가 - Steam 할인, Epic 무료 게임 | wuaihot",
    seoDescription:
      "Steam 할인, Epic 무료 게임, GOG 할인, Xiaoheihe 역대 최저가, GG.deals, ITHome을 실시간으로 모아 무료 배포와 초특가를 추적합니다.",
    seoKeywords:
      "게임 할인,역대 최저가,Steam 할인,Epic 무료 게임,GOG 할인,Xiaoheihe,GG.deals,무료 배포,90% 할인,저가 게임,wuaihot",
  },
};

export const AI_TOPIC_METADATA = {
  "zh-CN": {
    title: "AI 热点与趋势雷达",
    description:
      "聚合 OpenAI、Anthropic、Google DeepMind、Hugging Face、量子位等中外 AI 信号，并结合 GitHub Trending、Hacker News 与 LocalLLaMA，优先呈现今日焦点、模型与产品动态、开发者快速升温项目及独立多源确认。",
    feedTitle: "AI 实时雷达",
    empty: "当前筛选暂无 AI 事件",
    degraded: "部分 AI 来源暂时不可用，当前仍展示其余来源的最新事件。",
    seoTitle: "AI 热点专题 - 大模型发布、AI重大事件与爆火项目 | 吾爱热榜",
    seoDescription:
      "实时聚合 OpenAI、Anthropic、Google DeepMind、Meta AI、Hugging Face、Hacker News、Reddit、Product Hunt 与 GitHub Trending，追踪 AI 重大事件、大模型发布、开发者爆火项目和多源共振趋势。",
    seoKeywords:
      "AI热点,AI重大事件,大模型发布,AI新闻,OpenAI,Anthropic,Claude,Gemini,DeepSeek,GitHub AI Trending,LocalLLaMA,Hugging Face,AI爆火项目,AI趋势",
  },
  en: {
    title: "AI Trends & Signal Radar",
    description:
      "Track official AI releases, specialist media, GitHub Trending, Hacker News, LocalLLaMA and other high-signal sources, prioritizing today’s focus, model and product moves, developer momentum and independently confirmed events.",
    feedTitle: "Live AI Radar",
    empty: "No AI events match this filter.",
    degraded:
      "Some AI sources are temporarily unavailable. Events from the remaining sources are still shown.",
    seoTitle:
      "AI Trends - Major Model Releases, AI Events & Breakout Projects | wuaihot",
    seoDescription:
      "Track major AI events, model releases, developer breakouts and cross-source signals across OpenAI, Anthropic, DeepMind, Meta AI, Hugging Face, Hacker News, Reddit, Product Hunt and GitHub Trending.",
    seoKeywords:
      "AI trends,AI news,major AI events,model releases,OpenAI,Anthropic,Claude,Gemini,DeepSeek,GitHub AI Trending,LocalLLaMA,Hugging Face,AI projects,wuaihot",
  },
  "zh-TW": {
    title: "AI 熱點與趨勢雷達",
    description:
      "彙整官方 AI 發布、專業媒體、GitHub Trending、Hacker News、LocalLLaMA 等高訊號來源，優先呈現今日焦點、模型與產品動態、開發者熱度與獨立多源確認。",
    feedTitle: "AI 即時雷達",
    empty: "目前篩選沒有 AI 事件",
    degraded: "部分 AI 來源暫時無法使用，目前仍顯示其他來源的最新事件。",
    seoTitle: "AI 熱點專題 - 大模型發布、重大事件與爆紅專案 | 吾愛熱榜",
    seoDescription:
      "即時追蹤 AI 重大事件、大模型發布、開發者爆紅專案與多源共振趨勢。",
    seoKeywords:
      "AI熱點,AI重大事件,大模型發布,AI新聞,OpenAI,Anthropic,Claude,Gemini,DeepSeek,GitHub AI Trending,LocalLLaMA,Hugging Face,吾愛熱榜",
  },
  ja: {
    title: "AIトレンド・シグナルレーダー",
    description:
      "AI公式発表、専門メディア、GitHub Trending、Hacker News、LocalLLaMA などの高シグナル情報源を横断し、今日の注目、モデル・製品動向、開発者の熱量、独立した複数ソース確認を優先します。",
    feedTitle: "AIリアルタイムレーダー",
    empty: "条件に一致するAIイベントはありません",
    degraded:
      "一部のAI情報源が一時利用できません。利用可能な情報源の最新イベントを表示しています。",
    seoTitle:
      "AIトレンド - 主要モデル公開・重大イベント・急上昇プロジェクト | wuaihot",
    seoDescription:
      "主要AIイベント、モデル公開、開発者コミュニティで急上昇するプロジェクト、複数ソースの共振を追跡します。",
    seoKeywords:
      "AIトレンド,AIニュース,モデル公開,OpenAI,Anthropic,Claude,Gemini,DeepSeek,GitHub AI Trending,LocalLLaMA,Hugging Face,wuaihot",
  },
  ko: {
    title: "AI 트렌드·시그널 레이더",
    description:
      "AI 공식 발표, 전문 미디어, GitHub Trending, Hacker News, LocalLLaMA 등 신호가 강한 출처를 모아 오늘의 핵심 이슈, 모델·제품 동향, 개발자 열기와 독립 다중 출처 확인을 우선합니다.",
    feedTitle: "AI 실시간 레이더",
    empty: "현재 조건에 맞는 AI 이벤트가 없습니다",
    degraded:
      "일부 AI 출처를 일시적으로 사용할 수 없습니다. 나머지 출처의 최신 이벤트를 표시합니다.",
    seoTitle: "AI 트렌드 - 주요 모델 출시·AI 사건·급상승 프로젝트 | wuaihot",
    seoDescription:
      "주요 AI 사건, 모델 출시, 개발자 급상승 프로젝트, 독립 다중 출처 신호를 실시간으로 추적합니다.",
    seoKeywords:
      "AI 트렌드,AI 뉴스,모델 출시,OpenAI,Anthropic,Claude,Gemini,DeepSeek,GitHub AI Trending,LocalLLaMA,Hugging Face,wuaihot",
  },
};

export const CHIGUA_TOPIC_METADATA = {
  "zh-CN": {
    title: "全网娱乐吃瓜雷达",
    description:
      "追踪明星八卦、娱乐圈事件、影视综艺、音乐与网红主播热点，聚合各平台娱乐榜与经核验的综合榜娱乐信号。",
    feedTitle: "实时吃瓜",
    empty: "当前筛选暂无娱乐热点",
    degraded: "部分娱乐数据源暂时不可用，当前仍展示其余来源的最新娱乐热点。",
    seoTitle: "吃瓜热榜 - 明星八卦·娱乐圈热点·影视综热议 | 吾爱热榜",
    seoDescription:
      "实时追踪明星八卦、娱乐圈热门事件、影视剧综艺、音乐与网红主播话题，并以多平台证据识别共同升温的娱乐热点。",
    seoKeywords:
      "吃瓜热榜,明星八卦,娱乐圈热点,明星热搜,影视剧,综艺热搜,娱乐新闻,网红主播,抖音娱乐榜,微博文娱,多平台娱乐热点",
  },
  en: {
    title: "Entertainment Buzz Radar",
    description:
      "Track celebrity gossip, entertainment-industry events, film, TV, variety, music and creator buzz using entertainment-first evidence across major platforms.",
    feedTitle: "Live Entertainment Buzz",
    empty: "No entertainment events match this filter.",
    degraded:
      "Some entertainment sources are temporarily unavailable. Fresh events from the remaining sources are still shown.",
    seoTitle: "Entertainment Buzz - Celebrity Gossip & Showbiz Trends | wuaihot",
    seoDescription:
      "Track celebrity gossip, showbiz, film, TV, variety, music and creator trends with cross-platform evidence.",
    seoKeywords:
      "celebrity gossip,entertainment trends,showbiz,film,TV,variety,music,creators,Douyin,Weibo,wuaihot",
  },
  "zh-TW": {
    title: "全網娛樂吃瓜雷達",
    description:
      "追蹤明星八卦、娛樂圈事件、影視綜藝、音樂與網紅主播熱點，彙整各平台娛樂榜與經核驗的綜合榜娛樂訊號。",
    feedTitle: "即時吃瓜",
    empty: "目前篩選沒有娛樂熱點",
    degraded: "部分娛樂資料來源暫時無法使用，目前仍顯示其他來源的最新娛樂熱點。",
    seoTitle: "吃瓜熱榜 - 明星八卦與娛樂圈熱門話題 | 吾愛熱榜",
    seoDescription:
      "追蹤明星八卦、娛樂圈事件、影視綜藝、音樂與網紅主播熱門話題，並以多平台證據聚合同一娛樂事件。",
    seoKeywords:
      "吃瓜熱榜,明星八卦,娛樂圈,明星熱搜,影視劇,綜藝,音樂,網紅主播,多平台娛樂熱點,吾愛熱榜",
  },
  ja: {
    title: "エンタメ話題レーダー",
    description:
      "芸能ゴシップ、芸能界、映画・ドラマ、バラエティ、音楽、配信者の話題を主要プラットフォームのエンタメ情報から追跡します。",
    feedTitle: "リアルタイムエンタメ",
    empty: "条件に一致する話題はありません",
    degraded:
      "一部のエンタメ情報源が一時利用できません。利用可能な情報源の最新話題を表示しています。",
    seoTitle: "話題レーダー - 中国主要プラットフォームのトレンド | wuaihot",
    seoDescription:
      "中国主要プラットフォームのトレンドを横断集約し、複数サービスで同時に盛り上がる出来事を追跡します。",
    seoKeywords:
      "トレンド,話題,Weibo,Zhihu,Douyin,Baidu,Bilibili,中国SNS,wuaihot",
  },
  ko: {
    title: "엔터테인먼트 화제 레이더",
    description:
      "연예 가십, 연예계 사건, 영화·드라마, 예능, 음악, 크리에이터 이슈를 주요 플랫폼의 엔터테인먼트 신호로 추적합니다.",
    feedTitle: "실시간 엔터테인먼트",
    empty: "현재 조건에 맞는 화제가 없습니다",
    degraded:
      "일부 엔터테인먼트 출처를 일시적으로 사용할 수 없습니다. 나머지 출처의 최신 이슈를 표시합니다.",
    seoTitle: "화제 레이더 - 중국 주요 플랫폼 실시간 트렌드 | wuaihot",
    seoDescription:
      "중국 주요 플랫폼의 인기 주제를 묶어 여러 서비스에서 동시에 상승하는 사건을 추적합니다.",
    seoKeywords:
      "실시간 화제,트렌드,Weibo,Zhihu,Douyin,Baidu,Bilibili,중국 SNS,wuaihot",
  },
};
