# 热榜 Taxonomy v3：来源、榜单与分类投影治理

## 目标

v3 不再把“来源平台、榜单、分类、展示卡片”视为同一个对象。canonical provider 只描述平台；variant 描述平台内的具体榜单；category projection 决定榜单在哪些分类中出现；用户提升的 ranking instance 只负责工作台展示。

## 一级导航

主导航固定为：新闻、科技、AI、财经、文娱、游戏、体育、生活、社区。`综合`只保留为聚合视图和兼容路由，不再作为真实领域分类；旧 `羊毛` 一级分类迁入 `生活 → 优惠省钱`，`/topic/wool` 专题继续保留。

文娱和游戏不下沉到生活：两者来源规模、用户心智、榜单结构与专题能力均已形成独立域，硬塞入生活会让生活重新成为大杂烩。生活只承接优惠省钱、汽车、健康、教育知识、消费生活和公共生活。

## 三层职责

1. **Source / Provider**：唯一 canonical 平台，例如米游社。Provider 合并后不再为原神、星铁、崩3各维护一套重复采集源。
2. **Variant / Ranking**：平台中的具体榜单，例如 `miyoushe/genshin-news`、`qq-news/sports`、`baidu/movie`。
3. **Category Projection**：榜单的导航归属，可一对多。例如游戏折扣同时投影到 `游戏 → 游戏优惠` 与 `生活 → 优惠省钱`。

展示层 ranking instance 与以上三层解耦。用户可以把任意 `source + variant` 提升为独立卡片/列表；系统也可以在特定分类中创建不可删除的 category projection instance，而无需重复 Provider。

## Source 默认归属

`src/config/taxonomy-v3.js` 是 source 默认分类的 authoritative registry。当前覆盖旧“综合/社区/羊毛”治理、科技细分、游戏细分、生活细分及跨域归属。用户已经手工设置 `categoryIdsCustomized` 的来源不被自动覆盖。

## Variant 交叉投影

同一平台的不同子榜允许进入不同分类：腾讯新闻娱乐→文娱、腾讯新闻体育→体育；抖音社会→新闻、抖音娱乐→文娱；B站音乐→文娱/音乐；百度小说/电影/电视剧/汽车/游戏分别进入对应领域。

系统 projection 只在对应分类上下文出现，不污染“全部”首页。用户手工提升同一 variant 时，也会继承 taxonomy projection 的 categoryIds。

## 迁移与兼容

- `general` 仍可解析，但主导航 `navigation=false`。
- 旧分类 slug `wool` canonicalize 到 `deals`。
- 旧持久化分类 `wool/羊毛` 合并到 `life-deals/优惠省钱`。
- 历史 `media/music-audio/books-comics` 迁移规则继续保留。
- 分类 ID 发布后保持稳定；后续仅通过 versioned alias/migration 迁移。

## 权重治理

分类归属和排序权重分开维护。来源可信度/商业准入继续由 Trends Catalog 的 priority/admission 决定；前端 `order` 只负责展示默认顺序。下一阶段将把旧 DailyHotApi route 迁移账本接入 provider parity audit，禁止“旧来源无状态消失”。
