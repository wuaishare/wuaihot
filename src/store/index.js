import { defineStore } from "pinia";
import { BUILTIN_CATEGORIES as SITE_BUILTIN_CATEGORIES } from "@/config/site-metadata.mjs";
import { GAME_DEAL_SOURCE_IDS } from "@/config/topics";
import {
  SOURCE_CATEGORY_PROJECTIONS,
  getProjectedSourceCategoryIds,
} from "@/config/taxonomy-v3";
import {
  filterReadableTrendsCatalogManagedSources,
  getTrendsCatalogSources,
  resolveLegacySourceProjection,
} from "@/utils/sourceSubtypes";
import {
  MAX_CATEGORY_DEPTH,
  canMoveCategory,
  getCategoryByRef,
  getCategoryDepth,
  getSourceCategoryIds,
  normalizeCategoryTree,
  syncLegacyPrimaryCategory,
} from "@/utils/categoryTree";

const BUILTIN_CATEGORIES = SITE_BUILTIN_CATEGORIES.map((item, order) => ({
  ...item,
  order,
  parentId: item.parentId || null,
  builtin: true,
}));

const TRENDS_CATEGORY_DEFAULTS = {
  general: { category: "综合", categoryIds: ["general"] },
  tech: { category: "科技", categoryIds: ["tech"] },
  ai: { category: "AI", categoryIds: ["ai"] },
  culture: { category: "生活", categoryIds: ["life"] },
  finance: { category: "财经", categoryIds: ["finance"] },
};

const TRENDS_SOURCE_PRESENTATION = {
  "douyin-live": { category: "综合", categoryIds: ["general"], order: 0.2 },
  "autohome-sales": { category: "生活", categoryIds: ["life"], order: 10.5 },
  "china-film-boxoffice": {
    category: "电影",
    categoryIds: ["entertainment-video-movie"],
    order: 16.1,
  },
  "iqiyi-rank": {
    category: "影视",
    categoryIds: ["entertainment-video"],
    order: 16.2,
  },
  "youku-rank": {
    category: "影视",
    categoryIds: ["entertainment-video"],
    order: 16.3,
  },
  "hongguo-rank": {
    category: "短剧",
    categoryIds: ["entertainment-video-shortdrama"],
    order: 16.4,
  },
  "bilibili-live": {
    category: "影视",
    categoryIds: ["entertainment-video"],
    order: 16.5,
  },
  "bilibili-manga": {
    category: "漫画",
    categoryIds: ["entertainment-reading-comics"],
    order: 16.6,
  },
  "kuaikan-comics": {
    category: "漫画",
    categoryIds: ["entertainment-reading-comics"],
    order: 16.7,
  },
  "hotbook-discovery": {
    category: "图书",
    categoryIds: ["entertainment-reading-books"],
    order: 17.0,
  },
  "qidian-books": {
    category: "网络小说",
    categoryIds: ["entertainment-reading-novels"],
    order: 17.1,
  },
  "fanqie-books": {
    category: "网络小说",
    categoryIds: ["entertainment-reading-novels"],
    order: 17.2,
  },
  "qimao-books": {
    category: "网络小说",
    categoryIds: ["entertainment-reading-novels"],
    order: 17.3,
  },
  "jjwxc-books": {
    category: "网络小说",
    categoryIds: ["entertainment-reading-novels"],
    order: 17.4,
  },
  "apple-music": {
    category: "音乐",
    categoryIds: ["entertainment-music"],
    order: 17.45,
  },
  "qq-music": {
    category: "音乐",
    categoryIds: ["entertainment-music"],
    order: 17.5,
  },
  "netease-music": {
    category: "音乐",
    categoryIds: ["entertainment-music"],
    order: 17.6,
  },
  "kugou-music": {
    category: "音乐",
    categoryIds: ["entertainment-music"],
    order: 17.7,
  },
  "kuwo-music": {
    category: "音乐",
    categoryIds: ["entertainment-music"],
    order: 17.8,
  },
  "apple-podcasts": {
    category: "播客",
    categoryIds: ["entertainment-audio-podcasts"],
    order: 17.9,
  },
  "ximalaya-rankings": {
    category: "音频",
    categoryIds: ["entertainment-audio"],
    order: 17.905,
  },
  "qingting-audio": {
    category: "音频",
    categoryIds: ["entertainment-audio"],
    order: 17.91,
  },
  "maoer-drama": {
    category: "音频剧",
    categoryIds: ["entertainment-audio-drama"],
    order: 17.92,
  },
  "lanren-audio": {
    category: "有声书",
    categoryIds: ["entertainment-audio-audiobooks"],
    order: 17.93,
  },
  "apple-app-store": { category: "科技", categoryIds: ["tech"], order: 22.1 },
  "xiaomi-app-store": { category: "科技", categoryIds: ["tech"], order: 22.2 },
  "yingyongbao-store": { category: "科技", categoryIds: ["tech"], order: 22.3 },
  "oppo-app-store": { category: "科技", categoryIds: ["tech"], order: 22.4 },
  "chrome-web-store": { category: "科技", categoryIds: ["tech"], order: 25.1 },
  "vscode-marketplace": { category: "科技", categoryIds: ["tech"], order: 25.2 },
  "greasy-fork": { category: "科技", categoryIds: ["tech"], order: 25.3 },
  "taptap-games": { category: "游戏", categoryIds: ["games"], order: 25.5 },
  "bilibili-game-rankings": { category: "游戏", categoryIds: ["games"], order: 25.6 },
  "huya-video-rankings": { category: "游戏", categoryIds: ["games"], order: 25.7 },
  "lol-top-canyon": { category: "游戏", categoryIds: ["games"], order: 32.1 },
  "antutu-rankings": { category: "科技", categoryIds: ["tech"], order: 35.1 },
  "zol-phone-rankings": { category: "科技", categoryIds: ["tech"], order: 35.2 },
  "zol-tech-rankings": { category: "科技", categoryIds: ["tech"], order: 35.3 },
  "pconline-rankings": { category: "科技", categoryIds: ["tech"], order: 35.4 },
  "ludashi-rankings": { category: "科技", categoryIds: ["tech"], order: 35.5 },
  "bilibili-ai-arena": { category: "AI", categoryIds: ["ai-models"], order: 62.1 },
  "steam": {
    category: "游戏",
    categoryIds: ["games-deals", "life-deals"],
    order: 52.1,
  },
  "sonkwo-deals": {
    category: "游戏",
    categoryIds: ["games-deals", "life-deals"],
    order: 52.6,
  },
};

const trendsCatalogSourceToNewsItem = (source, order) => {
  const defaults = TRENDS_CATEGORY_DEFAULTS[source?.category] || TRENDS_CATEGORY_DEFAULTS.general;
  const presentation = TRENDS_SOURCE_PRESENTATION[source?.key] || {};
  return {
    label: source?.name || source?.key,
    name: source?.key,
    order,
    show: true,
    ...defaults,
    ...presentation,
    ...(source?.rankingLabel ? { subtype: source.rankingLabel } : {}),
    catalogManaged: true,
    publicAvailable: Boolean(source?.publicAvailable),
    displayAvailable: Boolean(source?.displayAvailable),
  };
};

const BUILTIN_CATEGORY_MIGRATIONS = {
  xueqiu: { from: "综合", to: "财经" },
};

const LEGACY_BUILTIN_CATEGORY_ALIASES = {
  wool: "life-deals",
  "羊毛": "life-deals",
  media: "entertainment",
  "影音娱乐": "entertainment",
  "media-music": "entertainment-music",
  "music-audio": "entertainment-music",
  "音乐音频": "entertainment-music",
  "media-video": "entertainment-video",
  "影视综艺": "entertainment-video",
  "media-reading": "entertainment-reading",
  "books-comics": "entertainment-reading",
  "小说漫画": "entertainment-reading",
};

const FINANCE_TAXONOMY_SOURCE_IDS = [
  "cls",
  "eastmoney-flash",
  "jin10",
  "tonghuashun",
  "wallstreetcn",
  "sina-finance-flash",
  "yicai-flash",
  "xueqiu",
  "sse",
  "szse",
  "hkex",
  "nasdaq",
  "nyse",
  "twse",
  "nse",
  "asx",
  "global-indexes",
];

const AI_TAXONOMY_SOURCE_IDS = [
  "openrouter-rankings",
  "artificialanalysis",
  "arena-ai",
  "designarena",
  "llm-stats",
  "modeldial-radar",
  "aicpb-rankings",
  "skills-rank",
  "clawhub",
  "producthunt-ai",
  "openai",
  "anthropic-news",
  "deepmind-blog",
  "meta-ai-blog",
  "mistral-news",
  "cohere-blog",
  "perplexity-blog",
  "xai-news",
  "huggingface",
  "paperswithcode",
  "hackernews-ai",
  "reddit-localllama",
  "reddit-machinelearning",
  "reddit-artificial",
  "sina-ai",
  "qbitai-ai",
];

const ENTERTAINMENT_TAXONOMY_SOURCE_IDS = [
  "china-film-boxoffice",
  "iqiyi-rank",
  "youku-rank",
  "hongguo-rank",
  "bilibili-live",
  "bilibili-manga",
  "kuaikan-comics",
  "hotbook-discovery",
  "qidian-books",
  "fanqie-books",
  "qimao-books",
  "jjwxc-books",
  "apple-music",
  "qq-music",
  "netease-music",
  "kugou-music",
  "kuwo-music",
  "apple-podcasts",
  "ximalaya-rankings",
  "qingting-audio",
  "maoer-drama",
  "lanren-audio",
];

const BUILTIN_CATEGORY_ID_RESETS = new Set([
  ...GAME_DEAL_SOURCE_IDS,
  ...ENTERTAINMENT_TAXONOMY_SOURCE_IDS,
  ...FINANCE_TAXONOMY_SOURCE_IDS,
  ...AI_TAXONOMY_SOURCE_IDS,
]);

const BUILTIN_ORDER_MIGRATIONS = {
  "global-indexes": { from: 7.95, to: 7.45 },
  nyse: { from: 7.91, to: 19.5 },
  twse: { from: 7.92, to: 34.5 },
  nse: { from: 7.93, to: 49.5 },
};

export const mainStore = defineStore("mainData", {
  state: () => {
    return {
      // 系统主题
      siteTheme: "light",
      siteThemeAuto: true,
      // 新闻类别（已分好类）
      defaultNewsArr: [
        {
          label: "抖音",
          name: "douyin",
          coverPresentationMode: "mixed",
          order: 0,
          show: true,
          category: "综合",
        },
        {
          label: "小红书",
          name: "xiaohongshu",
          coverPresentationMode: "mixed",
          order: 0.5,
          show: true,
          category: "综合",
        },
        {
          label: "百度",
          name: "baidu",
          coverPresentationMode: "mixed",
          order: 1,
          show: true,
          category: "综合",
        },
        {
          label: "快手",
          name: "kuaishou",
          coverPresentationMode: "mixed",
          order: 2,
          show: true,
          category: "综合",
        },
        {
          label: "微博",
          name: "weibo",
          order: 3,
          show: true,
          category: "综合",
        },
        {
          label: "今日头条",
          name: "toutiao",
          order: 4,
          show: true,
          category: "综合",
        },
        {
          label: "腾讯新闻",
          name: "qq-news",
          coverPresentationMode: "landscape-uniform",
          order: 5,
          show: true,
          category: "综合",
        },
        {
          label: "网易新闻",
          name: "netease-news",
          order: 6,
          show: true,
          category: "综合",
        },
        {
          label: "新浪新闻",
          name: "sina-news",
          order: 7,
          show: true,
          category: "综合",
        },
        {
          label: "财联社电报",
          name: "cls",
          order: 7.21,
          show: true,
          category: "财经",
          categoryIds: ["finance-flash"],
        },
        {
          label: "东方财富快讯",
          name: "eastmoney-flash",
          order: 7.22,
          show: true,
          category: "财经",
          categoryIds: ["finance-flash"],
        },
        {
          label: "金十快讯",
          name: "jin10",
          order: 7.23,
          show: true,
          category: "财经",
          categoryIds: ["finance-flash"],
        },
        {
          label: "同花顺快讯",
          name: "tonghuashun",
          order: 7.24,
          show: true,
          category: "财经",
          categoryIds: ["finance-flash"],
        },
        {
          label: "华尔街见闻快讯",
          name: "wallstreetcn",
          order: 7.25,
          show: true,
          category: "财经",
          categoryIds: ["finance-flash"],
        },
        {
          label: "新浪财经7×24",
          name: "sina-finance-flash",
          order: 7.26,
          show: true,
          category: "财经",
          categoryIds: ["finance-flash"],
        },
        {
          label: "第一财经快讯",
          name: "yicai-flash",
          order: 7.27,
          show: true,
          category: "财经",
          categoryIds: ["finance-flash"],
        },
        {
          label: "雪球",
          name: "xueqiu",
          order: 7.5,
          show: true,
          category: "财经",
          categoryIds: ["finance-market"],
          subtype: "topics",
        },
        {
          label: "上交所",
          name: "sse",
          order: 7.6,
          show: true,
          category: "财经",
          categoryIds: ["finance-exchanges"],
          subtype: "stock",
        },
        {
          label: "深交所",
          name: "szse",
          order: 7.7,
          show: true,
          category: "财经",
          categoryIds: ["finance-exchanges"],
          subtype: "stock",
        },
        {
          label: "港交所",
          name: "hkex",
          order: 7.8,
          show: true,
          category: "财经",
          categoryIds: ["finance-exchanges"],
        },
        {
          label: "Nasdaq",
          name: "nasdaq",
          order: 7.9,
          show: true,
          category: "财经",
          categoryIds: ["finance-exchanges"],
        },
        {
          label: "NYSE",
          name: "nyse",
          order: 19.5,
          show: true,
          category: "财经",
          categoryIds: ["finance-exchanges"],
        },
        {
          label: "台交所",
          name: "twse",
          order: 34.5,
          show: true,
          category: "财经",
          categoryIds: ["finance-exchanges"],
        },
        {
          label: "NSE",
          name: "nse",
          order: 49.5,
          show: true,
          category: "财经",
          categoryIds: ["finance-exchanges"],
        },
        {
          label: "澳交所",
          name: "asx",
          order: 56.5,
          show: true,
          category: "财经",
          categoryIds: ["finance-exchanges"],
        },
        {
          label: "全球股指",
          name: "global-indexes",
          order: 7.45,
          show: true,
          category: "财经",
          categoryIds: ["finance-indexes"],
        },
        {
          label: "哔哩哔哩",
          name: "bilibili",
          order: 8,
          show: true,
          category: "综合",
        },
        {
          label: "知乎",
          name: "zhihu",
          order: 9,
          show: true,
          category: "综合",
        },
        {
          label: "百度贴吧",
          name: "tieba",
          order: 10,
          show: true,
          category: "社区",
        },
        {
          label: "什么值得买",
          name: "smzdm",
          order: 11,
          show: true,
          category: "生活",
          categoryIds: ["life", "wool"],
        },
        {
          label: "澎湃新闻",
          name: "thepaper",
          order: 12,
          show: true,
          category: "综合",
        },
        {
          label: "新浪热榜",
          name: "sina",
          order: 13,
          show: true,
          category: "综合",
        },
        {
          label: "纽约时报",
          name: "nytimes",
          order: 14,
          show: true,
          category: "综合",
        },
        {
          label: "豆瓣讨论小组",
          name: "douban-group",
          order: 15,
          show: true,
          category: "生活",
        },
        {
          label: "豆瓣电影",
          name: "douban-movie",
          coverPresentationMode: "portrait-uniform",
          order: 16,
          show: true,
          category: "生活",
        },
        {
          label: "微信读书",
          name: "weread",
          coverPresentationMode: "portrait-uniform",
          order: 17,
          show: true,
          category: "生活",
        },
        {
          label: "CSDN",
          name: "csdn",
          order: 18,
          show: true,
          category: "科技",
        },
        {
          label: "36氪",
          name: "36kr",
          order: 19,
          show: true,
          category: "科技",
        },
        {
          label: "IT之家",
          name: "ithome",
          order: 20,
          show: true,
          category: "科技",
        },
        {
          label: "虎扑",
          name: "hupu",
          order: 21,
          show: true,
          category: "社区",
        },
        {
          label: "酷安",
          name: "coolapk",
          order: 22,
          show: true,
          category: "科技",
        },
        {
          label: "稀土掘金",
          name: "juejin",
          order: 23,
          show: true,
          category: "科技",
        },
        {
          label: "V2EX",
          name: "v2ex",
          order: 24,
          show: true,
          category: "社区",
        },
        {
          label: "GitHub 趋势",
          name: "github",
          order: 25,
          show: true,
          category: "科技",
        },
        {
          label: "游戏葡萄",
          name: "gameres",
          order: 26,
          show: true,
          category: "游戏",
        },
        {
          label: "游研社",
          name: "yystv",
          order: 27,
          show: true,
          category: "游戏",
        },
        {
          label: "米游社",
          name: "miyoushe",
          coverPresentationMode: "landscape-uniform",
          order: 28,
          show: true,
          category: "游戏",
          categoryIds: ["games"],
        },
        {
          label: "LOL",
          name: "lol",
          order: 32,
          show: true,
          category: "游戏",
        },
        {
          label: "虎嗅",
          name: "huxiu",
          order: 33,
          show: true,
          category: "科技",
          useApi2: true,
        },
        {
          label: "少数派",
          name: "sspai",
          order: 34,
          show: true,
          category: "科技",
        },
        {
          label: "数字尾巴",
          name: "dgtle",
          order: 35,
          show: true,
          category: "科技",
        },
        {
          label: "爱范儿",
          name: "ifanr",
          order: 36,
          show: true,
          category: "科技",
        },
        {
          label: "极客公园",
          name: "geekpark",
          order: 37,
          show: true,
          category: "科技",
        },
        {
          label: "果壳",
          name: "guokr",
          order: 38,
          show: true,
          category: "科技",
        },
        {
          label: "知乎日报",
          name: "zhihu-daily",
          order: 39,
          show: true,
          category: "综合",
        },
        {
          label: "AcFun",
          name: "acfun",
          order: 40,
          show: true,
          category: "综合",
        },
        {
          label: "NGA",
          name: "ngabbs",
          order: 41,
          show: true,
          category: "社区",
        },
        {
          label: "吾爱破解",
          name: "52pojie",
          order: 42,
          show: true,
          category: "社区",
          useApi2: true,
        },
        {
          label: "全球主机交流",
          name: "hostloc",
          order: 43,
          show: true,
          category: "社区",
        },
        {
          label: "天涯社区",
          name: "tianya",
          order: 44,
          show: true,
          category: "社区",
          useApi2: true,
        },
        {
          label: "LinuxDo",
          name: "linuxdo",
          order: 45,
          show: true,
          category: "社区",
          subtype: "日榜",
        },
        {
          label: "Nodeseek",
          name: "nodeseek",
          order: 46,
          show: true,
          category: "社区",
        },
        {
          label: "水木社区",
          name: "newsmth",
          order: 47,
          show: true,
          category: "社区",
        },
        {
          label: "Product Hunt",
          name: "producthunt",
          order: 48,
          show: true,
          category: "科技",
        },
        {
          label: "Hacker News",
          name: "hackernews",
          order: 49,
          show: true,
          category: "科技",
        },
        {
          label: "HelloGitHub",
          name: "hellogithub",
          order: 50,
          show: true,
          category: "科技",
        },
        {
          label: "51CTO",
          name: "51cto",
          order: 51,
          show: true,
          category: "科技",
        },
        {
          label: "超级线报",
          name: "super-deals",
          order: 51.6,
          show: true,
          category: "羊毛",
          subtype: "latest",
        },
        {
          label: "0818团",
          name: "0818tuan",
          order: 51.7,
          show: true,
          category: "羊毛",
          subtype: "latest",
        },
        {
          label: "NodeLoc",
          name: "nodeloc-deals",
          order: 51.8,
          show: true,
          category: "羊毛",
          categoryIds: ["wool", "community"],
          subtype: "wool",
        },
        {
          label: "IT之家「喜加一」",
          name: "ithome-xijiayi",
          order: 52,
          show: true,
          category: "游戏",
          categoryIds: ["games"],
        },
        {
          label: "Epic 免费游戏",
          name: "epic-free-games",
          order: 52.2,
          show: true,
          category: "游戏",
          categoryIds: ["games"],
          subtype: "current",
        },
        {
          label: "小黑盒游戏折扣",
          name: "xiaoheihe-deals",
          order: 52.3,
          show: true,
          category: "游戏",
          categoryIds: ["games"],
          subtype: "popular",
        },
        {
          label: "GG.deals 游戏优惠",
          name: "ggdeals",
          order: 52.4,
          show: true,
          category: "游戏",
          categoryIds: ["games"],
          subtype: "freebies",
        },
        {
          label: "GOG 游戏折扣",
          name: "gog-deals",
          order: 52.5,
          show: true,
          category: "游戏",
          categoryIds: ["games"],
          subtype: "trending",
        },
        {
          label: "简书",
          name: "jianshu",
          order: 53,
          show: true,
          category: "生活",
          useApi2: true,
        },
        {
          label: "中央气象台",
          name: "weatheralarm",
          order: 54,
          show: true,
          category: "生活",
        },
        {
          label: "历史上的今天",
          name: "history",
          order: 55,
          show: true,
          category: "生活",
        },
        {
          label: "中国地震台",
          name: "earthquake",
          order: 56,
          show: true,
          category: "生活",
        },
        {
          label: "OpenRouter",
          name: "openrouter-rankings",
          order: 57,
          show: true,
          category: "AI",
          categoryIds: ["ai-models"],
          subtype: "模型周度热度榜",
        },
        {
          label: "Artificial Analysis",
          name: "artificialanalysis",
          order: 58,
          show: true,
          category: "AI",
          categoryIds: ["ai-models"],
          subtype: "模型综合评测榜",
        },
        {
          label: "Arena AI",
          name: "arena-ai",
          order: 59,
          show: true,
          category: "AI",
          categoryIds: ["ai-models"],
          subtype: "综合对话榜",
        },
        {
          label: "DesignArena",
          name: "designarena",
          order: 60,
          show: true,
          category: "AI",
          categoryIds: ["ai-models"],
          subtype: "Agentic 全栈应用模型榜",
        },
        {
          label: "AICPB",
          name: "aicpb-rankings",
          order: 61,
          show: true,
          category: "AI",
          categoryIds: ["ai-products"],
          subtype: "全球 AI 产品热度榜",
        },
        {
          label: "LLM Stats",
          name: "llm-stats",
          order: 62,
          show: true,
          category: "AI",
          categoryIds: ["ai-models"],
          subtype: "模型性能 / 价格榜",
        },
        {
          label: "ModelDial Radar",
          name: "modeldial-radar",
          order: 62.2,
          show: true,
          category: "AI",
          categoryIds: ["ai-models"],
          subtype: "AI Coding 模型实测榜",
        },
        {
          label: "Skills Rank",
          name: "skills-rank",
          order: 63,
          show: true,
          category: "AI",
          categoryIds: ["ai-products"],
          subtype: "Agent Skills 安装榜",
        },
        {
          label: "ClawHub",
          name: "clawhub",
          order: 64,
          show: true,
          category: "AI",
          categoryIds: ["ai-products"],
          subtype: "技能 / 插件",
        },
        {
          label: "OpenAI",
          name: "openai",
          order: 65,
          show: true,
          category: "AI",
          categoryIds: ["ai-official"],
          subtype: "官方新闻",
        },
        {
          label: "Anthropic",
          name: "anthropic-news",
          order: 66,
          show: true,
          category: "AI",
          categoryIds: ["ai-official"],
          subtype: "官方新闻",
        },
        {
          label: "DeepMind",
          name: "deepmind-blog",
          order: 67,
          show: true,
          category: "AI",
          categoryIds: ["ai-official"],
          subtype: "官方博客",
        },
        {
          label: "Meta AI",
          name: "meta-ai-blog",
          order: 68,
          show: true,
          category: "AI",
          categoryIds: ["ai-official"],
          subtype: "官方 AI 动态",
        },
        {
          label: "Mistral",
          name: "mistral-news",
          order: 69,
          show: true,
          category: "AI",
          categoryIds: ["ai-official"],
          subtype: "官方新闻",
        },
        {
          label: "Cohere",
          name: "cohere-blog",
          order: 70,
          show: true,
          category: "AI",
          categoryIds: ["ai-official"],
          subtype: "官方博客",
        },
        {
          label: "Perplexity",
          name: "perplexity-blog",
          order: 73,
          show: false,
          category: "AI",
          categoryIds: ["ai-official"],
          subtype: "官方资讯",
        },
        {
          label: "xAI",
          name: "xai-news",
          order: 74,
          show: false,
          category: "AI",
          categoryIds: ["ai-official"],
          subtype: "官方资讯",
        },
        {
          label: "Hugging Face",
          name: "huggingface",
          order: 74,
          show: true,
          category: "AI",
          categoryIds: ["ai-official"],
          subtype: "官方博客",
        },
        {
          label: "Papers with Code",
          name: "paperswithcode",
          order: 75,
          show: true,
          category: "AI",
          categoryIds: ["ai-research-community"],
          subtype: "论文代码镜像榜",
        },
        {
          label: "Product Hunt",
          name: "producthunt-ai",
          order: 76,
          show: true,
          category: "AI",
          categoryIds: ["ai-products"],
          subtype: "AI 新品发现",
        },
        {
          label: "Hacker News",
          name: "hackernews-ai",
          order: 77,
          show: true,
          category: "AI",
          categoryIds: ["ai-research-community"],
          subtype: "AI 热门讨论",
        },
        {
          label: "Reddit /r/LocalLLaMA",
          name: "reddit-localllama",
          order: 80,
          show: false,
          category: "AI",
          categoryIds: ["ai-research-community"],
          subtype: "社区热议",
        },
        {
          label: "Reddit /r/MachineLearning",
          name: "reddit-machinelearning",
          order: 81,
          show: false,
          category: "AI",
          categoryIds: ["ai-research-community"],
          subtype: "社区热议",
        },
        {
          label: "Reddit /r/artificial",
          name: "reddit-artificial",
          order: 82,
          show: false,
          category: "AI",
          categoryIds: ["ai-research-community"],
          subtype: "社区热议",
        },
        {
          label: "新浪 AI 热榜",
          name: "sina-ai",
          order: 82,
          show: true,
          category: "AI",
          categoryIds: ["ai-chinese-news"],
          subtype: "",
        },
        {
          label: "量子位",
          name: "qbitai-ai",
          order: 83,
          show: true,
          category: "AI",
          categoryIds: ["ai-chinese-news"],
          subtype: "AI 垂直媒体",
        },
        {
          label: "BBC 世界新闻",
          name: "bbc-world",
          order: 84,
          show: true,
          category: "综合",
          categoryIds: ["general"],
        },
        {
          label: "卫报全球新闻",
          name: "guardian-world",
          order: 85,
          show: true,
          category: "综合",
          categoryIds: ["general"],
        },
        {
          label: "NHK 新闻",
          name: "nhk-news",
          order: 86,
          show: true,
          category: "综合",
          categoryIds: ["general"],
        },
        {
          label: "Google 趋势",
          name: "google-trends",
          order: 87,
          show: true,
          category: "综合",
          categoryIds: ["general"],
        },
        {
          label: "TechCrunch",
          name: "techcrunch",
          order: 88,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
        {
          label: "The Verge",
          name: "theverge",
          order: 89,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
        {
          label: "Ars Technica",
          name: "arstechnica",
          order: 90,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
        {
          label: "Lobsters",
          name: "lobsters",
          order: 91,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
        {
          label: "DEV Community",
          name: "devto",
          order: 92,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
        {
          label: "Hatena 热门",
          name: "hatena-hot",
          order: 93,
          show: true,
          category: "社区",
          categoryIds: ["community"],
        },
        {
          label: "半岛电视台英语",
          name: "aljazeera",
          order: 94,
          show: true,
          category: "综合",
          categoryIds: ["general"],
        },
        {
          label: "NPR 新闻",
          name: "npr-news",
          order: 95,
          show: true,
          category: "综合",
          categoryIds: ["general"],
        },
        {
          label: "德国之声",
          name: "dw-news",
          order: 96,
          show: true,
          category: "综合",
          categoryIds: ["general"],
        },
        {
          label: "France 24 法语",
          name: "france24-fr",
          order: 97,
          show: true,
          category: "综合",
          categoryIds: ["general"],
        },
        {
          label: "世界报",
          name: "lemonde",
          order: 98,
          show: true,
          category: "综合",
          categoryIds: ["general"],
        },
        {
          label: "EL PAÍS",
          name: "elpais",
          order: 99,
          show: true,
          category: "综合",
          categoryIds: ["general"],
        },
        {
          label: "韩联社",
          name: "yonhap",
          order: 100,
          show: true,
          category: "综合",
          categoryIds: ["general"],
        },
        {
          label: "印度时报",
          name: "timesofindia",
          order: 101,
          show: true,
          category: "综合",
          categoryIds: ["general"],
        },
        {
          label: "NASA 新闻",
          name: "nasa-news",
          order: 102,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
        {
          label: "Nature",
          name: "nature-news",
          order: 103,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
        {
          label: "arXiv AI",
          name: "arxiv-ai",
          order: 104,
          show: true,
          category: "AI",
          categoryIds: ["ai"],
        },
        {
          label: "MarketWatch",
          name: "marketwatch",
          order: 105,
          show: true,
          category: "财经",
          categoryIds: ["finance"],
        },
        {
          label: "Krebs on Security",
          name: "krebsonsecurity",
          order: 106,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
        {
          label: "The Hacker News",
          name: "thehackernews",
          order: 107,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
        {
          label: "Google 安全博客",
          name: "google-security",
          order: 108,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
        {
          label: "WHO 新闻",
          name: "who-news",
          order: 109,
          show: true,
          category: "生活",
          categoryIds: ["life"],
        },
        {
          label: "Science News",
          name: "sciencenews",
          order: 110,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
        {
          label: "Smashing Magazine",
          name: "smashing",
          order: 111,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
        {
          label: "Dezeen",
          name: "dezeen",
          order: 112,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
        {
          label: "GitHub 博客",
          name: "github-blog",
          order: 113,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
        {
          label: "Stack Overflow 博客",
          name: "stackoverflow-blog",
          order: 114,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
        {
          label: "InfoQ",
          name: "infoq",
          order: 115,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
        {
          label: "Eurogamer",
          name: "eurogamer",
          order: 116,
          show: true,
          category: "游戏",
          categoryIds: ["games"],
        },
        {
          label: "CBC 新闻",
          name: "cbc-news",
          order: 117,
          show: true,
          category: "综合",
          categoryIds: ["general"],
        },
        {
          label: "ABC 澳大利亚新闻",
          name: "abc-au-news",
          order: 118,
          show: true,
          category: "综合",
          categoryIds: ["general"],
        },
        {
          label: "RNZ 新闻",
          name: "rnz-news",
          order: 119,
          show: true,
          category: "综合",
          categoryIds: ["general"],
        },
        {
          label: "WIRED",
          name: "wired",
          order: 120,
          show: true,
          category: "科技",
          categoryIds: ["tech"],
        },
      ],
      newsArr: [],
      // 用户提升为独立卡片/列表的 source + variant 投影实例。
      promotedRankings: [],
      // 链接跳转方式
      linkOpenType: "open",
      // 页头固定
      headerFixed: true,
      // 紧凑模式：统一控制站点导航、上下文工具栏和页面密度
      compactMode: true,
      // 首页卡片视图桌面列数：普通 / 紧凑独立控制
      homeCardColumns: 4,
      homeCompactColumns: 5,
      // 普通页面与聚焦页面的内容容器宽度
      siteContainerWidth: 1400,
      focusContainerWidth: 1360,
      // 是否显示榜单置顶条目
      showPinnedRankings: true,
      // 自动刷新
      autoRefreshEnabled: false,
      autoRefreshPaused: false,
      autoRefreshRoutePaused: false,
      autoRefreshRemainingMs: null,
      autoRefreshInterval: 1800,
      // 封面图片：总开关 + 分场景偏好（旧 showImages 继续作为总开关兼容历史配置）
      showImages: true,
      showCardImages: true,
      showStreamImages: true,
      showDetailImages: true,
      showPreviewImages: true,
      // 信息流是否显示摘要/热度等辅助信息
      showStreamDescriptions: true,
      // 分类页视图偏好：内容组织方式与显示偏好分离
      categoryViewMode: "card",
      categoryViewPerCategory: true,
      categoryViewModes: {},
      // 旧版“整个平台全部拆分”状态，仅用于兼容迁移。
      categorySplitSources: {},
      // 分类页多榜平台按 source + variant 精确记录独立拆分项。
      categorySplitVariants: {},
      // 分类
      categoryEnabled: true,
      activeCategory: "全部",
      categories: BUILTIN_CATEGORIES,
      // 失效的榜单源（临时标记，不持久化）
      unavailableSources: [],
      analyticsConsent: null,
      analyticsPromptDismissed: false,
      analyticsRecommendedOrder: [],
      // 时间数据
      timeData: null,
      // 列表字体大小：普通 / 紧凑独立控制
      listFontSize: 16,
      compactListFontSize: 14,
    };
  },
  getters: {
    effectiveListFontSize: (state) =>
      state.compactMode
        ? Number(state.compactListFontSize || 14)
        : Number(state.listFontSize || 16),
  },
  actions: {
    ensureBuiltinCategories() {
      const current = normalizeCategoryTree(
        Array.isArray(this.categories) ? this.categories : [],
      );
      const refAliases = new Map();
      const nameAliases = new Map();
      const registerAlias = (item, canonical) => {
        if (!item || !canonical) return;
        [item.id, item.name, item.slug].filter(Boolean).forEach((ref) => {
          refAliases.set(String(ref), canonical.id);
        });
        if (item.name && item.name !== canonical.name) {
          nameAliases.set(String(item.name), canonical.name);
        }
      };
      const builtinMatch = (item) => {
        const legacyBuiltinId = [item?.id, item?.name, item?.slug]
          .filter(Boolean)
          .map((ref) => LEGACY_BUILTIN_CATEGORY_ALIASES[String(ref)])
          .find(Boolean);
        return BUILTIN_CATEGORIES.find(
          (builtin) =>
            builtin.id === item?.id ||
            builtin.id === legacyBuiltinId ||
            builtin.name === item?.name ||
            (item?.slug && builtin.slug === item.slug),
        );
      };
      current.forEach((item) => registerAlias(item, builtinMatch(item)));
      const mergedBuiltin = BUILTIN_CATEGORIES.map((builtin) => {
        const existing = current.find((item) => builtinMatch(item)?.id === builtin.id);
        registerAlias(existing, builtin);
        return {
          ...builtin,
          ...existing,
          id: builtin.id,
          name: builtin.name,
          slug: builtin.slug,
          parentId: builtin.parentId || null,
          order: Number.isFinite(Number(existing?.order))
            ? Number(existing.order)
            : builtin.order,
          builtin: true,
        };
      });
      const custom = [];
      const customIdentity = new Map();
      current
        .filter((item) => item && !builtinMatch(item))
        .forEach((item) => {
          const keys = [item.id, item.name, item.slug].filter(Boolean).map(String);
          const duplicateId = keys.map((key) => customIdentity.get(key)).find(Boolean);
          if (duplicateId) {
            const canonical = custom.find((candidate) => candidate.id === duplicateId);
            registerAlias(item, canonical);
            return;
          }
          const canonical = {
            ...item,
            order: Number.isFinite(Number(item.order))
              ? Number(item.order)
              : BUILTIN_CATEGORIES.length + custom.length,
            builtin: false,
          };
          custom.push(canonical);
          keys.forEach((key) => customIdentity.set(key, canonical.id));
          registerAlias(item, canonical);
        });
      const resolveRef = (ref) => refAliases.get(String(ref || "")) || String(ref || "");
      const remapCategoryRefs = (list = []) =>
        list.map((item) => {
          if (!Array.isArray(item?.categoryIds)) return item;
          const categoryIds = [...new Set(item.categoryIds.map(resolveRef).filter(Boolean))];
          return { ...item, categoryIds };
        });
      this.categories = mergedBuiltin.concat(
        custom.map((item) => ({
          ...item,
          parentId: item.parentId ? resolveRef(item.parentId) : null,
        })),
      );
      this.defaultNewsArr = remapCategoryRefs(this.defaultNewsArr);
      this.newsArr = remapCategoryRefs(this.newsArr);
      this.categoryViewModes = Object.fromEntries(
        Object.entries(this.categoryViewModes || {}).map(([ref, mode]) => [
          resolveRef(ref),
          mode,
        ]),
      );
      this.categorySplitSources = Object.fromEntries(
        Object.entries(this.categorySplitSources || {}).map(([ref, names]) => [
          resolveRef(ref),
          [...new Set((Array.isArray(names) ? names : []).map(String).filter(Boolean))],
        ]),
      );
      this.categorySplitVariants = Object.fromEntries(
        Object.entries(this.categorySplitVariants || {}).map(([ref, sources]) => [
          resolveRef(ref),
          Object.fromEntries(
            Object.entries(sources || {})
              .map(([sourceName, variants]) => [
                String(sourceName || "").trim(),
                [...new Set(
                  (Array.isArray(variants) ? variants : [])
                    .map((value) => String(value || "").trim())
                    .filter(Boolean),
                )],
              ])
              .filter(([sourceName, variants]) => sourceName && variants.length),
          ),
        ]),
      );
      if (nameAliases.has(this.activeCategory)) {
        this.activeCategory = nameAliases.get(this.activeCategory);
      }
      if (
        this.activeCategory !== "全部" &&
        !this.categories.some((item) => item.name === this.activeCategory)
      ) {
        this.activeCategory = "全部";
      }
    },
    ensureCategoriesForNews(list) {
      const categories = this.categories || BUILTIN_CATEGORIES;
      return list.map((item) => {
        const projectedCategoryIds =
          !item?.categoryIdsCustomized && SOURCE_CATEGORY_PROJECTIONS[item?.name]
            ? getProjectedSourceCategoryIds(item.name)
            : null;
        return syncLegacyPrimaryCategory(
          projectedCategoryIds?.length
            ? { ...item, categoryIds: projectedCategoryIds }
            : item,
          categories,
        );
      });
    },
    mergeNewsWithDefaults(list) {
      list = this.normalizeLegacySources(list);
      const defaultByName = new Map(
        this.defaultNewsArr.map((item) => [item.name, item]),
      );
      return this.ensureCategoriesForNews(list).map((item) => {
        const defaults = defaultByName.get(item.name) || {};
        const merged = {
          ...defaults,
          ...item,
        };
        if (
          !item.categoryIdsCustomized &&
          Array.isArray(defaults.categoryIds)
        ) {
          merged.categoryIds = [
            ...new Set([
              ...getSourceCategoryIds(item, this.categories),
              ...defaults.categoryIds,
            ]),
          ];
        }
        if (
          BUILTIN_CATEGORY_ID_RESETS.has(item.name) &&
          !item.categoryIdsCustomized &&
          Array.isArray(defaults.categoryIds)
        ) {
          merged.categoryIds = defaults.categoryIds.slice();
        }
        Object.assign(
          merged,
          syncLegacyPrimaryCategory(merged, this.categories),
        );
        if (defaults.label) {
          merged.label = defaults.label;
        }
        if (defaults.subtype) {
          merged.subtype = defaults.subtype;
        }
        if (defaults.catalogManaged) {
          merged.catalogManaged = true;
          merged.publicAvailable = Boolean(defaults.publicAvailable);
          merged.displayAvailable = Boolean(defaults.displayAvailable);
        }
        const categoryMigration = BUILTIN_CATEGORY_MIGRATIONS[item.name];
        if (
          categoryMigration &&
          item.category === categoryMigration.from &&
          defaults.category === categoryMigration.to
        ) {
          merged.category = categoryMigration.to;
          const targetCategory = getCategoryByRef(
            this.categories,
            categoryMigration.to,
          );
          if (targetCategory && !merged.categoryIdsCustomized) {
            merged.categoryIds = [
              ...new Set([
                targetCategory.id,
                ...(Array.isArray(defaults.categoryIds)
                  ? defaults.categoryIds
                  : []),
              ]),
            ];
          }
        }
        const orderMigration = BUILTIN_ORDER_MIGRATIONS[item.name];
        if (
          orderMigration &&
          Number(item.order) === orderMigration.from &&
          Number(defaults.order) === orderMigration.to
        ) {
          merged.order = orderMigration.to;
        }
        return merged;
      });
    },
    dedupeNewsList(list) {
      const merged = this.mergeNewsWithDefaults(list);
      const byName = new Map();
      for (const item of merged) {
        if (!item?.name) continue;
        if (!byName.has(item.name)) {
          byName.set(item.name, item);
          continue;
        }
        const current = byName.get(item.name);
        byName.set(item.name, {
          ...current,
          ...item,
          label: item.label || current.label,
          order: typeof current.order === "number" ? current.order : item.order,
        });
      }
      return Array.from(byName.values());
    },
    normalizeLegacySources(list) {
      if (!Array.isArray(list) || !list.length) return list;
      const mergeGroup = (items, targetName, legacyNames) => {
        const targetDefault = this.defaultNewsArr.find(
          (item) => item.name === targetName,
        );
        if (!targetDefault) return items;
        const existingTarget = items.find((item) => item?.name === targetName);
        const legacyItems = items.filter((item) =>
          legacyNames.includes(item?.name),
        );
        if (!existingTarget && !legacyItems.length) {
          return items;
        }
        const keep = items.filter(
          (item) =>
            item?.name !== targetName && !legacyNames.includes(item?.name),
        );
        const sourceItems = [existingTarget, ...legacyItems].filter(Boolean);
        const merged = sourceItems.reduce(
          (acc, item) => ({
            ...acc,
            ...item,
            ...targetDefault,
            name: targetDefault.name,
            label: targetDefault.label,
            subtype: targetDefault.subtype,
            category: targetDefault.category,
            show: acc.show || item.show,
          }),
          { ...targetDefault, show: false },
        );
        const orders = sourceItems
          .map((item) => item.order)
          .filter((value) => typeof value === "number");
        if (orders.length) {
          merged.order = Math.min(...orders);
        }
        keep.push(merged);
        return keep;
      };

      let normalized = list;
      normalized = mergeGroup(normalized, "clawhub", [
        "clawhub-skills",
        "clawhub-plugins",
      ]);
      normalized = mergeGroup(normalized, "openai", [
        "openai-news",
        "openai-research",
      ]);
      normalized = mergeGroup(normalized, "arena-ai", ["lmarena"]);
      normalized = mergeGroup(normalized, "huggingface", [
        "huggingface-blog",
        "hf-models",
        "hf-papers",
      ]);
      normalized = mergeGroup(normalized, "miyoushe", [
        "genshin",
        "starrail",
        "honkai",
      ]);
      normalized = mergeGroup(normalized, "steam", ["steam-deals"]);
      normalized = mergeGroup(normalized, "douban-group", [
        "douban-wool",
        "douban-pet-wool",
      ]);
      return normalized;
    },
    addCategory(name, parentId = null) {
      const cleanName = String(name || "").trim();
      if (!cleanName) return false;
      const limit = 40;
      const exists = this.categories.some((cat) => cat.name === cleanName);
      if (exists) return false;
      if (this.categories.length >= limit) {
        $message?.warning?.(`最多创建 ${limit} 个分类`);
        return false;
      }
      const parent = parentId
        ? getCategoryByRef(this.categories, parentId)
        : null;
      if (
        parent &&
        getCategoryDepth(this.categories, parent.id) >= MAX_CATEGORY_DEPTH
      ) {
        $message?.warning?.(`最多支持 ${MAX_CATEGORY_DEPTH} 级分类`);
        return false;
      }
      const id = `custom-${Date.now()}`;
      this.categories.push({
        id,
        name: cleanName,
        slug: id,
        parentId: parent?.id || null,
        order: this.categories.length,
        builtin: false,
      });
      return id;
    },
    removeCategory(id) {
      const cat = getCategoryByRef(this.categories, id);
      if (!cat || cat.builtin) return;
      const removed = new Set([cat.id]);
      let changed = true;
      while (changed) {
        changed = false;
        this.categories.forEach((item) => {
          if (
            item.parentId &&
            removed.has(item.parentId) &&
            !removed.has(item.id)
          ) {
            removed.add(item.id);
            changed = true;
          }
        });
      }
      const activeCategoryBeforeDelete = getCategoryByRef(
        this.categories,
        this.activeCategory,
      );
      this.categories = this.categories.filter((item) => !removed.has(item.id));
      this.newsArr = this.newsArr.map((item) => {
        const categoryIds = getSourceCategoryIds(item, this.categories).filter(
          (categoryId) => !removed.has(categoryId),
        );
        return syncLegacyPrimaryCategory(
          {
            ...item,
            categoryIds: categoryIds.length ? categoryIds : ["general"],
            categoryIdsCustomized: true,
          },
          this.categories,
        );
      });
      if (
        activeCategoryBeforeDelete &&
        removed.has(activeCategoryBeforeDelete.id)
      ) {
        this.activeCategory = "全部";
      }
    },
    renameCategory(id, newName) {
      const cleanName = String(newName || "").trim();
      if (!cleanName) return false;
      const cat = getCategoryByRef(this.categories, id);
      if (!cat || cat.builtin) return false;
      if (
        this.categories.some(
          (item) => item.id !== cat.id && item.name === cleanName,
        )
      ) {
        return false;
      }
      cat.name = cleanName;
      this.newsArr = this.newsArr.map((item) =>
        syncLegacyPrimaryCategory(item, this.categories),
      );
      return true;
    },
    moveCategory(id, parentId = null) {
      const cat = getCategoryByRef(this.categories, id);
      if (!cat || cat.builtin) return false;
      if (!canMoveCategory(this.categories, cat.id, parentId)) return false;
      const parent = parentId
        ? getCategoryByRef(this.categories, parentId)
        : null;
      cat.parentId = parent?.id || null;
      return true;
    },
    setSourceCategories(sourceName, categoryIds = []) {
      const target = this.newsArr.find((item) => item.name === sourceName);
      if (!target) return false;
      const valid = [...new Set(categoryIds.map(String))].filter((id) =>
        getCategoryByRef(this.categories, id),
      );
      Object.assign(
        target,
        syncLegacyPrimaryCategory(
          {
            ...target,
            categoryIds: valid.length ? valid : ["general"],
            categoryIdsCustomized: true,
          },
          this.categories,
        ),
      );
      return true;
    },
    reorderCategories(orderedIds = []) {
      const orderMap = new Map(
        orderedIds.map((id, index) => [String(id), index]),
      );
      this.categories = this.categories
        .map((item) => ({
          ...item,
          order: orderMap.has(String(item.id))
            ? orderMap.get(String(item.id))
            : item.order,
        }))
        .sort((a, b) => a.order - b.order);
    },
    normalizeCategoryViewMode(mode) {
      return mode === "stream" ? "stream" : "card";
    },
    resolveCategoryViewMode(categoryRef = null) {
      const fallback = this.normalizeCategoryViewMode(this.categoryViewMode);
      let category = getCategoryByRef(this.categories, categoryRef);
      if (!category) return fallback;

      const seen = new Set();
      while (category && !seen.has(String(category.id))) {
        seen.add(String(category.id));
        const key = String(category.id);
        if (
          this.categoryViewModes &&
          Object.prototype.hasOwnProperty.call(this.categoryViewModes, key)
        ) {
          return this.normalizeCategoryViewMode(this.categoryViewModes[key]);
        }
        category = category.parentId
          ? getCategoryByRef(this.categories, category.parentId)
          : null;
      }
      return fallback;
    },
    setCategoryViewMode(categoryRef, mode) {
      const nextMode = this.normalizeCategoryViewMode(mode);
      const category = getCategoryByRef(this.categories, categoryRef);
      const key = String(category?.id || "");
      if (!key) {
        this.categoryViewMode = nextMode;
        return;
      }
      this.categoryViewModes = {
        ...(this.categoryViewModes || {}),
        [key]: nextMode,
      };
      this.categoryViewPerCategory = true;
    },
    clearCategoryViewMode(categoryRef) {
      const category = getCategoryByRef(this.categories, categoryRef);
      const key = String(category?.id || "");
      if (!key || !this.categoryViewModes?.[key]) return;
      const next = { ...(this.categoryViewModes || {}) };
      delete next[key];
      this.categoryViewModes = next;
    },
    setCategoryViewPerCategory(enabled) {
      this.categoryViewPerCategory = Boolean(enabled);
    },
    getCategorySplitScopeKey(categoryRef) {
      const raw = String(categoryRef || "").trim();
      if (raw === "__all__") return raw;
      const category = getCategoryByRef(this.categories, categoryRef);
      return String(category?.id || "");
    },
    getCategorySplitSources(categoryRef) {
      const key = this.getCategorySplitScopeKey(categoryRef);
      return key && Array.isArray(this.categorySplitSources?.[key])
        ? this.categorySplitSources[key]
        : [];
    },
    isCategorySourceSplit(categoryRef, sourceName) {
      const source = String(sourceName || "").trim();
      return Boolean(source && this.getCategorySplitSources(categoryRef).includes(source));
    },
    setCategorySourceSplit(categoryRef, sourceName, enabled = true) {
      const key = this.getCategorySplitScopeKey(categoryRef);
      const source = String(sourceName || "").trim();
      if (!key || !source) return false;
      const current = new Set(this.getCategorySplitSources(categoryRef));
      if (enabled) current.add(source);
      else current.delete(source);
      this.categorySplitSources = {
        ...(this.categorySplitSources || {}),
        [key]: [...current],
      };
      return true;
    },
    setCategorySourcesSplit(categoryRef, sourceNames = [], enabled = true) {
      const key = this.getCategorySplitScopeKey(categoryRef);
      if (!key) return false;
      const names = [...new Set((Array.isArray(sourceNames) ? sourceNames : []).map(String).filter(Boolean))];
      const current = new Set(this.getCategorySplitSources(categoryRef));
      for (const source of names) {
        if (enabled) current.add(source);
        else current.delete(source);
      }
      this.categorySplitSources = {
        ...(this.categorySplitSources || {}),
        [key]: [...current],
      };
      return true;
    },
    getCategorySplitVariants(categoryRef, sourceName) {
      const key = this.getCategorySplitScopeKey(categoryRef);
      const source = String(sourceName || "").trim();
      const variants = key && source
        ? this.categorySplitVariants?.[key]?.[source]
        : null;
      return Array.isArray(variants) ? variants : [];
    },
    setCategorySplitVariants(categoryRef, sourceName, variants = []) {
      const key = this.getCategorySplitScopeKey(categoryRef);
      const source = String(sourceName || "").trim();
      if (!key || !source) return false;

      const normalized = [...new Set(
        (Array.isArray(variants) ? variants : [])
          .map((value) => String(value || "").trim())
          .filter(Boolean),
      )];
      const categoryState = {
        ...(this.categorySplitVariants?.[key] || {}),
      };
      if (normalized.length) categoryState[source] = normalized;
      else delete categoryState[source];

      const next = { ...(this.categorySplitVariants || {}) };
      if (Object.keys(categoryState).length) next[key] = categoryState;
      else delete next[key];
      this.categorySplitVariants = next;

      // 一旦用户使用新版 variant 级拆分，旧版整平台状态立即退役，避免双真源。
      this.setCategorySourceSplit(categoryRef, source, false);
      return true;
    },
    setCategoryVariantSplit(categoryRef, sourceName, variant, enabled = true) {
      const value = String(variant || "").trim();
      if (!value) return false;
      const current = new Set(
        this.getCategorySplitVariants(categoryRef, sourceName),
      );
      if (enabled) current.add(value);
      else current.delete(value);
      return this.setCategorySplitVariants(
        categoryRef,
        sourceName,
        [...current],
      );
    },
    setActiveCategory(name) {
      this.activeCategory = name;
    },
    promoteRanking(sourceName, variant, label = "") {
      const source = String(sourceName || "").trim();
      const normalizedVariant = String(variant || "").trim();
      if (!source || !normalizedVariant) return false;
      const id = `${source}::${normalizedVariant}`;
      if ((this.promotedRankings || []).some((item) => item?.id === id)) return false;
      const base =
        this.newsArr.find((item) => item?.name === source) ||
        this.defaultNewsArr.find((item) => item?.name === source);
      if (!base) return false;
      this.promotedRankings = [
        ...(this.promotedRankings || []),
        {
          id,
          sourceName: source,
          variant: normalizedVariant,
          label: String(label || "").trim(),
          order: (this.promotedRankings || []).length,
        },
      ];
      return true;
    },
    removePromotedRanking(id) {
      const key = String(id || "");
      if (!key) return false;
      const before = (this.promotedRankings || []).length;
      this.promotedRankings = (this.promotedRankings || []).filter(
        (item) => item?.id !== key,
      );
      return this.promotedRankings.length !== before;
    },
    reorderPromotedRankings(orderedIds = []) {
      const positions = new Map(
        orderedIds.map((id, index) => [String(id), index]),
      );
      this.promotedRankings = (this.promotedRankings || [])
        .slice()
        .sort(
          (left, right) =>
            (positions.get(String(left?.id)) ?? Number.MAX_SAFE_INTEGER) -
            (positions.get(String(right?.id)) ?? Number.MAX_SAFE_INTEGER),
        )
        .map((item, order) => ({ ...item, order }));
    },
    reorderVisibleNews(orderedNames = [], scopedNames = orderedNames) {
      const scopedSet = new Set(scopedNames.filter(Boolean));
      const orderedItems = orderedNames
        .map((name) => this.newsArr.find((item) => item.name === name))
        .filter(Boolean);
      if (!scopedSet.size || !orderedItems.length) return;

      let scopedIndex = 0;
      this.newsArr = this.newsArr
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((item) =>
          scopedSet.has(item.name) ? orderedItems[scopedIndex++] || item : item,
        )
        .map((item, index) => ({
          ...item,
          order: index,
        }));
    },
    setAnalyticsConsent(value) {
      this.analyticsConsent = value;
    },
    setAnalyticsPromptDismissed(value) {
      this.analyticsPromptDismissed = value;
    },
    setAnalyticsRecommendedOrder(list) {
      this.analyticsRecommendedOrder = Array.isArray(list) ? list : [];
    },
    // 更改系统主题
    setSiteTheme(val) {
      $message.info(`已切换至${val === "dark" ? "深色模式" : "浅色模式"}`, {
        showIcon: false,
      });
      this.siteTheme = val === "dark" ? "dark" : "light";
      this.siteThemeAuto = false;
    },
    setAppearanceMode(mode, resolvedSystemTheme = null) {
      if (mode === "auto") {
        this.siteThemeAuto = true;
        if (resolvedSystemTheme === "dark" || resolvedSystemTheme === "light") {
          this.siteTheme = resolvedSystemTheme;
        }
        return;
      }
      this.siteThemeAuto = false;
      this.siteTheme = mode === "dark" ? "dark" : "light";
    },
    // 标记榜单状态
    markUnavailable(name) {
      if (!name) return;
      if (!this.unavailableSources.includes(name)) {
        this.unavailableSources.push(name);
      }
    },
    markAvailable(name) {
      if (!name || !this.unavailableSources.includes(name)) return;
      this.unavailableSources = this.unavailableSources.filter(
        (item) => item !== name,
      );
    },
    setSourceApi2(name, value = true) {
      if (!name) return;
      const target = this.newsArr.find((item) => item.name === name);
      if (!target) return;
      if (target.useApi2 !== value) {
        target.useApi2 = value;
      }
    },
    syncTrendsCatalogSources() {
      const catalogSources = getTrendsCatalogSources();
      if (!catalogSources.length) return 0;
      const catalogByKey = new Map(
        catalogSources.map((source) => [String(source?.key || ""), source]),
      );
      const adoptCatalogAuthority = (items = []) =>
        items.map((item) => {
          const legacyProjection = resolveLegacySourceProjection(
            String(item?.name || ""),
            String(item?.subtype || ""),
          );
          const sourceKey = legacyProjection?.sourceName || String(item?.name || "");
          const source = catalogByKey.get(sourceKey);
          if (!source) return item;
          return {
            ...item,
            catalogManaged: true,
            publicAvailable: Boolean(source.publicAvailable),
            displayAvailable: Boolean(source.displayAvailable),
          };
        });
      this.defaultNewsArr = filterReadableTrendsCatalogManagedSources(
        adoptCatalogAuthority(this.defaultNewsArr),
      );
      this.newsArr = filterReadableTrendsCatalogManagedSources(
        adoptCatalogAuthority(this.newsArr),
      );
      const candidates = catalogSources.filter(
        (source) =>
          (source.publicAvailable || source.displayAvailable) &&
          (source.priorityTier === "A" || source.priorityTier === "B"),
      );
      const known = new Set(this.defaultNewsArr.map((item) => item?.name).filter(Boolean));
      let nextOrder = this.defaultNewsArr.reduce(
        (max, item) => Math.max(max, Number(item?.order) || 0),
        0,
      ) + 1;
      let added = 0;
      for (const source of candidates) {
        if (!source?.key || known.has(source.key)) continue;
        this.defaultNewsArr.push(trendsCatalogSourceToNewsItem(source, nextOrder));
        nextOrder += 1;
        known.add(source.key);
        added += 1;
      }
      return added;
    },
    // 初始化默认榜单（SSR/预渲染也能有基础数据）
    ensureNewsList() {
      this.ensureBuiltinCategories();
      this.syncTrendsCatalogSources();
      this.defaultNewsArr = this.ensureCategoriesForNews(this.defaultNewsArr);
      if (!this.newsArr || this.newsArr.length === 0) {
        this.newsArr = this.defaultNewsArr;
      } else {
        this.newsArr = this.dedupeNewsList(this.newsArr);
      }
    },
    // 检查更新
    checkNewsUpdate() {
      this.ensureBuiltinCategories();
      this.syncTrendsCatalogSources();
      this.defaultNewsArr = this.ensureCategoriesForNews(this.defaultNewsArr);
      this.newsArr = this.dedupeNewsList(this.newsArr);
      if (typeof localStorage === "undefined") {
        this.ensureNewsList();
        return false;
      }
      const mainData = JSON.parse(localStorage.getItem("mainData"));
      let updatedNum = 0;
      if (!mainData) return false;
      console.log("列表尝试更新", this.defaultNewsArr, this.newsArr);
      // 执行比较并迁移
      if (this.newsArr.length > 0) {
        for (const newItem of this.defaultNewsArr) {
          const exists = this.newsArr.some(
            (news) => newItem.name === news.name,
          );
          if (!exists) {
            console.log("列表有更新：", newItem);
            updatedNum++;
            this.newsArr.push(newItem);
          }
        }
        this.newsArr = this.dedupeNewsList(this.newsArr);
        if (updatedNum) $message.success(`成功更新 ${updatedNum} 个榜单数据`);
      } else {
        console.log("列表无内容，写入默认");
        this.newsArr = this.defaultNewsArr;
      }
    },
  },
  persist: [
    {
      storage: localStorage,
      paths: [
        "siteTheme",
        "siteThemeAuto",
        "newsArr",
        "promotedRankings",
        "linkOpenType",
        "headerFixed",
        "compactMode",
        "homeCardColumns",
        "homeCompactColumns",
        "siteContainerWidth",
        "focusContainerWidth",
        "showPinnedRankings",
        "autoRefreshEnabled",
        "autoRefreshPaused",
        "autoRefreshInterval",
        "showImages",
        "showCardImages",
        "showStreamImages",
        "showDetailImages",
        "showPreviewImages",
        "showStreamDescriptions",
        "categoryViewMode",
        "categoryViewPerCategory",
        "categoryViewModes",
        "categorySplitSources",
        "categorySplitVariants",
        "categoryEnabled",
        "activeCategory",
        "categories",
        "listFontSize",
        "compactListFontSize",
        "analyticsConsent",
        "analyticsPromptDismissed",
      ],
    },
  ],
});
