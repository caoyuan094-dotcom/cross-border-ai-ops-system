"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { modules, workflows, quickStarts } = require("./data/prompts");

const publicRoot = path.join(__dirname, "public");
const dataRoot = path.join(__dirname, "data");
const runsPath = path.join(dataRoot, "runs.json");
const requestedPort = Number(process.env.PORT || 4288);
const host = process.env.HOST || "127.0.0.1";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function ensureRunsFile() {
  if (!fs.existsSync(dataRoot)) fs.mkdirSync(dataRoot, { recursive: true });
  if (!fs.existsSync(runsPath)) fs.writeFileSync(runsPath, "[]\n");
}

function readRuns() {
  ensureRunsFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(runsPath, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function writeRuns(runs) {
  ensureRunsFile();
  fs.writeFileSync(runsPath, `${JSON.stringify(runs.slice(0, 50), null, 2)}\n`);
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function safePath(urlPath) {
  const pathname = (urlPath || "/").split("?")[0];
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch (err) {
    return null;
  }
  const normalized = path.normalize(decoded === "/" ? "/index.html" : decoded);
  const full = path.join(publicRoot, normalized);
  if (!full.startsWith(publicRoot)) return null;
  return full;
}

function renderTemplate(template, payload) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = payload[key];
    if (value === undefined || value === null || String(value).trim() === "") {
      return `[${key} 未填写]`;
    }
    return String(value).trim();
  });
}

function filledCount(fields, payload) {
  return fields.filter((field) => String(payload[field.id] || "").trim().length > 0).length;
}

function classifyConfidence(workflow, payload) {
  const count = filledCount(workflow.fields, payload);
  const ratio = workflow.fields.length ? count / workflow.fields.length : 0;
  const textVolume = Object.values(payload).join("\n").trim().length;

  if (ratio >= 0.85 && textVolume > 700) return { level: "高", score: 86, reason: "关键字段完整，材料量足够做可执行判断。" };
  if (ratio >= 0.85 && textVolume > 120) return { level: "中", score: 68, reason: "关键字段已填写，但样本量偏少，部分结论需要标注假设或补充证据。" };
  if (ratio >= 0.65 && textVolume > 280) return { level: "中", score: 64, reason: "主字段已填写，但部分结论需要标注假设或补充证据。" };
  return { level: "低", score: 42, reason: "输入不足，只能生成初步框架，不能当作正式诊断结论。" };
}

function buildLocalDraft(workflow, payload, promptText) {
  const confidence = classifyConfidence(workflow, payload);
  const module = modules.find((item) => item.id === workflow.moduleId);
  const missing = workflow.fields
    .filter((field) => !String(payload[field.id] || "").trim())
    .map((field) => field.label);
  const dataText = Object.values(payload).join("\n").toLowerCase();
  const riskHints = [];

  if (/(acos|cpc|广告|spend|sales|click|ctr|cvr)/i.test(dataText)) {
    riskHints.push("广告数据已出现，优先拆分赢家词、浪费词和预算错配。");
  }
  if (/(review|差评|1星|2星|leak|broken|crack|smell|质量)/i.test(dataText)) {
    riskHints.push("评论/差评材料已出现，建议把痛点转成产品规格、图片信息图和客服话术。");
  }
  if (/(库存|stock|fba|在途|断货|日销|sales\/day)/i.test(dataText)) {
    riskHints.push("库存信息已出现，诊断结论需要把广告放量和断货风险联动。");
  }
  if (/(asin|b0[a-z0-9]{8})/i.test(dataText)) {
    riskHints.push("ASIN 信息已出现，适合做竞品分组和页面对标。");
  }

  const nextActions = [
    "先把输入数据按 ASIN / 广告 / Review / 库存四类整理，缺字段不要硬算。",
    "把所有高影响问题按“收入影响 × 执行成本 × 风险”排序，选出前 3 个动作。",
    "将可直接执行的内容拆成：今天能改、3 天内能跑、2 周内要复盘。"
  ];
  const diagnosisItems = [
    `当前任务应该先产出“${workflow.outputName}”，不要直接跳到执行外部动作。`,
    workflow.tagline,
    ...(riskHints.length ? riskHints : ["现有输入没有明显结构化报表，建议先补齐数据再出正式评分。"])
  ];

  const evidenceTable = workflow.fields
    .map((field) => {
      const value = String(payload[field.id] || "").trim();
      const preview = value.length > 110 ? `${value.slice(0, 110)}...` : value || "未提供";
      return `| ${field.label} | ${value ? "已提供" : "缺失"} | ${preview.replace(/\n/g, " ")} |`;
    })
    .join("\n");

  return `# ${workflow.outputName}

## 运行摘要
| 项目 | 结论 |
|---|---|
| 工作流 | ${workflow.name} |
| 模块 | ${module ? module.name : workflow.moduleId} |
| 置信度 | ${confidence.level}（${confidence.score}/100） |
| 判断依据 | ${confidence.reason} |
| 缺失输入 | ${missing.length ? missing.join("、") : "无明显缺失"} |

## 证据清单
| 字段 | 状态 | 内容摘要 |
|---|---|---|
${evidenceTable}

## 初步诊断
${diagnosisItems.map((item, index) => `${index + 1}. ${item}`).join("\n")}

## 优先行动清单
| 优先级 | 动作 | 预期作用 | 复核方式 |
|---|---|---|---|
| P0 | 补齐缺失证据：${missing.length ? missing.slice(0, 3).join("、") : "保留当前证据链"} | 避免低置信度结论进入客户报告 | 逐条标注来源/截图/报表日期 |
| P1 | 围绕主问题生成正式版本 | 形成可复制、可编辑、可交付文本 | 用右侧 Prompt 发送到模型或人工复核 |
| P2 | 提取 3 个最小执行动作 | 让客户看到可落地价值 | 每个动作绑定指标和截止日期 |

## 风险边界
${(module ? module.guardrails : []).map((item) => `- ${item}`).join("\n") || "- 不编造实时数据，不替代平台政策或法律意见。"}

## 下一步
${nextActions.map((item, index) => `${index + 1}. ${item}`).join("\n")}

---

## 已拼装 Prompt
\`\`\`
${promptText}
\`\`\`
`;
}

async function callOpenAI(promptText, workflow) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const payload = JSON.stringify({
    model,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: "你是严谨的跨境电商运营顾问。只根据用户提供的数据输出，缺证据时明确标注。中文输出，表格优先，行动清单要可执行。"
      },
      {
        role: "user",
        content: promptText
      }
    ]
  });

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: payload
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API ${response.status}: ${errorText.slice(0, 500)}`);
  }

  const result = await response.json();
  const content = result.choices && result.choices[0] && result.choices[0].message
    ? result.choices[0].message.content
    : "";
  return {
    content: content || buildLocalDraft(workflow, {}, promptText),
    model,
    usage: result.usage || null
  };
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${host}:${requestedPort}`);

  if (req.method === "GET" && url.pathname === "/api/config") {
    sendJson(res, 200, {
      ok: true,
      hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      mode: process.env.OPENAI_API_KEY ? "ai" : "local-draft"
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/prompts") {
    sendJson(res, 200, { modules, workflows: Object.values(workflows), quickStarts });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/runs") {
    sendJson(res, 200, { runs: readRuns() });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/generate") {
    try {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const workflow = workflows[body.workflowId];
      if (!workflow) {
        sendJson(res, 400, { error: "Unknown workflowId" });
        return;
      }

      const input = body.input && typeof body.input === "object" ? body.input : {};
      const promptText = renderTemplate(workflow.prompt, input);
      const confidence = classifyConfidence(workflow, input);
      let mode = "local-draft";
      let output;
      let usage = null;
      let model = "local";

      try {
        const ai = await callOpenAI(promptText, workflow);
        if (ai) {
          output = ai.content;
          usage = ai.usage;
          model = ai.model;
          mode = "ai";
        }
      } catch (err) {
        output = `${buildLocalDraft(workflow, input, promptText)}\n\n## API 调用失败\n${err.message}`;
        mode = "local-draft-api-error";
      }

      if (!output) output = buildLocalDraft(workflow, input, promptText);

      const run = {
        id: `run_${Date.now()}`,
        createdAt: new Date().toISOString(),
        workflowId: workflow.id,
        workflowName: workflow.name,
        moduleId: workflow.moduleId,
        outputName: workflow.outputName,
        input,
        prompt: promptText,
        output,
        confidence,
        mode,
        model,
        usage
      };
      const runs = readRuns();
      runs.unshift(run);
      writeRuns(runs);
      sendJson(res, 200, { run });
    } catch (err) {
      sendJson(res, 500, { error: err.message || "Generate failed" });
    }
    return;
  }

  sendJson(res, 404, { error: "Not found" });
}

function serveStatic(req, res) {
  const full = safePath(req.url || "/");
  if (!full) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.readFile(full, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(full).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
}

function createServer() {
  return http.createServer((req, res) => {
    if ((req.url || "").startsWith("/api/")) {
      handleApi(req, res);
      return;
    }
    serveStatic(req, res);
  });
}

function listen(port) {
  ensureRunsFile();
  const server = createServer();
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && port < requestedPort + 50) {
      listen(port + 1);
      return;
    }
    throw err;
  });
  server.listen(port, host, () => {
    console.log(`AI Cross-border Ecommerce System running at http://${host}:${port}`);
    console.log(`Mode: ${process.env.OPENAI_API_KEY ? "AI generation" : "local draft"}; set OPENAI_API_KEY to enable model calls.`);
  });
}

listen(requestedPort);
