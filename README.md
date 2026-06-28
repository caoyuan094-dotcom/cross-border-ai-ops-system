# AI Cross-Border Ecommerce Ops System

一个本地运行的 Amazon / 跨境电商 AI 运营工作台，把提示词库变成可操作产品。

- 选品诊断
- Listing 生产
- 广告管理
- 客服与差评
- 供应链预测
- 客户诊断报告

## Features

- 6 个业务模块，覆盖 Amazon 运营的核心场景
- 多个结构化工作流，内置输入字段、证据要求、风险边界和 Prompt 预览
- 未配置模型 Key 时可生成本地结构化草稿
- 配置 OpenAI 兼容接口后可直接调用模型生成正式交付物
- 运行记录本地保存，便于复盘和复制客户交付流程

## Quick Start

```bash
./start.sh
```

默认打开：

```text
http://127.0.0.1:4288
```

如果 4288 被占用，服务会自动尝试后续端口。

## AI Mode

未配置 API Key 时，系统会生成本地结构化草稿和完整 Prompt。

如需调用模型：

```bash
export OPENAI_API_KEY="sk-..."
export OPENAI_MODEL="gpt-4o-mini"
./start.sh
```

也可配置兼容 OpenAI Chat Completions 的网关：

```bash
export OPENAI_BASE_URL="https://your-compatible-endpoint/v1"
```

## Check

```bash
npm run check
curl --noproxy '*' http://127.0.0.1:4288/api/config
```

## Notes

- `data/runs.json` 是本地运行历史，默认不提交到 Git。
- `.env` / `.env.*` 默认不提交，请不要把 API Key 放进仓库。
- 输出内容用于运营辅助，不应替代平台政策、法律合规或财务审计判断。

## License

MIT
