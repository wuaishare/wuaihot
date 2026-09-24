export const DIRECTORY_ONLY_SOURCE_DETAILS = Object.freeze({
  "qq-music": {
    officialRankingUrl: "https://y.qq.com/n/ryqq_v2/toplist/62",
  },
  "netease-music": {
    officialRankingUrl: "https://music.163.com/discover/toplist?id=19723756",
  },
  "kugou-music": {
    officialRankingUrl: "https://www.kugou.com/yy/rank/home/1-6666.html",
  },
  "kuwo-music": {
    officialRankingUrl: "https://m.kuwo.cn/newh5app/ranklist_detail/16",
  },
});

export const isDirectoryOnlySourceKey = (sourceName) =>
  Boolean(DIRECTORY_ONLY_SOURCE_DETAILS[String(sourceName || "").trim()]);

export const getDirectoryOnlySourceDetails = (sourceName) =>
  DIRECTORY_ONLY_SOURCE_DETAILS[String(sourceName || "").trim()] || null;
