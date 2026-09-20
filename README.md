<div align="center">
  <img alt="wuaihot logo" height="120" src="./public/ico/wuaihot.svg" width="120"/>
  <h1>wuaihot · 吾爱热榜</h1>
  <p><strong>一站看全网</strong></p>
  <p>聚合今日热榜、全网热搜、实时热点与跨平台趋势榜单的开源前端。</p>
  <p><a href="https://hot.wuaishare.cn/">在线体验</a> · <a href="https://github.com/wuaishare/wuaihot/issues">Issues</a></p>
  <img src="./screenshots/main.webp" style="border-radius: 16px" />
</div>

## 项目定位

**wuaihot（吾爱热榜）** 是一个面向中文互联网的开放式热榜聚合前端，目标是让用户在一个界面中高效浏览不同平台的热门内容、实时热搜、分类榜单与趋势信号。

项目强调 **来源清晰、榜单语义明确、快速浏览、低干扰界面、可替换数据源与长期可维护性**。公开仓库不绑定私有账号、商业 Token 或不可替代的专有基础设施。

## 功能

- 多平台热榜、热搜与分类榜单聚合
- 首页、分类页、单榜详情页与卡片视图
- 榜单拖拽排序、显示开关、分类管理
- 自动刷新、刷新倒计时与 API 回退
- 简体中文、繁體中文、English、日本語、한국어
- SEO 友好路由、canonical、hreflang、sitemap 与预渲染能力
- 深色模式、紧凑模式、响应式布局与 PWA
- 来源子榜自动发现、榜单元数据与状态提示
- 可配置反馈入口，不在公开仓库内写入私有凭据

## 品牌

- 项目名：wuaihot
- 中文名：吾爱热榜
- Slogan：**一站看全网**
- 官方示例站：https://hot.wuaishare.cn/
- 品牌与图标规范：[docs/governance/brand.md](./docs/governance/brand.md)
- 项目路线图：[ROADMAP.md](./ROADMAP.md)
- 贡献指南：[CONTRIBUTING.md](./CONTRIBUTING.md)
- 安全策略：[SECURITY.md](./SECURITY.md)

## 开源来源与许可

wuaihot 的代码历史最初源自 [imsyy/DailyHot](https://github.com/imsyy/DailyHot)，并在长期二次开发后转为独立品牌与独立仓库持续演进。我们保留完整 Git 历史、原作者版权声明与 MIT License，以清晰记录项目来源并尊重上游贡献。

**MIT License 仅授权本仓库中依法可授权的代码与原创内容。第三方平台的数据、文章、图片、商标、Logo 与其他内容不因本项目开源而自动获得再许可。** 具体边界见 [数据与内容治理说明](./docs/governance/data-and-content-boundary.md)。

## 本地开发

~~~bash
pnpm install
pnpm dev
~~~

构建与检查：

~~~bash
pnpm build
~~~

构建流程会执行数据源契约、榜单元数据、分类完整性、图片代理、SEO 等自动审查，并生成路由 shell、sitemap 与 robots.txt。

## 主要环境变量

- VITE_GLOBAL_API：主热榜 API，可指向你自己的兼容后端
- VITE_GLOBAL_API2：备用热榜 API
- VITE_TRENDS_DIRECTORY_API：可选来源目录服务；留空时使用仓库静态来源定义
- VITE_TRENDS_PUBLIC_API：可选公开榜单服务；留空不会连接官方演示后端
- TRENDS_CATALOG_URL：构建期可选 Catalog；留空时 SEO 使用静态来源回退
- TRENDS_INTELLIGENCE_BASE_URL：可选服务端趋势智能上游，需与对应授权配置配套
- VITE_SITE_URL：站点线上地址
- VITE_DIR：部署路径
- VITE_ICP：ICP备案号
- VITE_BUILD_NUMBER：可选构建号覆盖值
- VITE_CLARITY_PROJECT_ID：可选 Microsoft Clarity 项目 ID
- VITE_FEEDBACK_PROVIDER：off / quackback / github / url
- VITE_FEEDBACK_URL：反馈入口
- VITE_FEEDBACK_PRODUCT_NAME：反馈产品名，默认“吾爱热榜”
- VITE_FEEDBACK_PRODUCT_KEY：反馈稳定标识，默认“wuaihot”
- PRERENDER：是否启用预渲染

公开仓库或浏览器端环境变量中不要放置 Token、Cookie、API Key、OAuth Secret、管理密钥或数据库凭据。

wuaihot 核心代码**不硬编码 WP Better 或吾爱热榜生产 API**。官方示例站的动态目录与榜单后端由部署环境变量注入；第三方自部署可以使用自己的兼容服务，也可以在不配置 Trends 后端时以静态来源配置构建。

## SEO 与路由

默认简体中文使用根路径；其他语言使用 /en/、/zh-tw/、/ja/、/ko/ 前缀。主要公开路径：

- /：首页
- /category/:categorySlug：分类热榜
- /rank/:sourceSlug/:subtypeSlug?：平台 / 子榜详情

旧版 /list?type=... 路径继续保留兼容跳转。

## 贡献与反馈

代码缺陷、兼容问题与开发建议请提交到 [GitHub Issues](https://github.com/wuaishare/wuaihot/issues)。线上实例的内容、数据源与产品体验建议可使用站点配置的反馈入口。

在提交 Issue、日志或截图前，请移除任何 Token、Cookie、密码、API Key 与个人敏感信息。

## License

[MIT](./LICENSE)
