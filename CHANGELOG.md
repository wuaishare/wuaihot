# Changelog

## v1.5.1 — 开源独立部署修正

- 移除运行时代码、构建脚本中对 `api.wpbetter.cn` 的硬编码默认值。
- 官方示例站通过 Vercel 环境变量注入 Trends Directory、Public Feed、Catalog 与 Intelligence 上游。
- 第三方部署不配置 Trends 后端时仍可使用静态来源定义独立构建，不会自动连接吾爱热榜或 WP Better 服务。
- 新增 `audit:open-source-independence`，阻止官方/私有热榜域名重新进入开源运行时配置。
- `.env.example` 补齐可替换后端配置，并将反馈默认身份统一为 `吾爱热榜 / wuaihot`。

## v1.5.0 — wuaihot 独立品牌基线

- 项目从 DailyHot 长期二次开发版迁移为独立开源品牌 `wuaihot · 吾爱热榜`。
- Slogan 统一为「一站看全网」，更新中英文品牌、SEO、PWA 与 favicon。
- 保留完整 Git 历史、原上游版权声明与 MIT License。
- 新增数据与内容治理边界，明确代码许可不等于第三方数据再许可。
- 新增贡献指南、安全策略、社区准则、Roadmap、数据源 Issue 模板与 PR 检查单。
- 包管理统一为 pnpm，并建立可复现安装与显式依赖构建策略。
- Vercel 生产项目继续使用 hot.wuaishare.cn，并将 Git 发布源切换到 wuaishare/wuaihot。
- 现有 `dailyhot:*` 浏览器兼容键暂时保留，后续通过迁移层逐步切换，避免用户设置失效。
