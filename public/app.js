"use strict";

const state = {
  modules: [],
  workflows: [],
  workflowMap: new Map(),
  quickStarts: [],
  activeModuleId: "diagnosis",
  activeWorkflowId: "store_audit",
  input: {},
  currentRun: null,
  runs: []
};

const els = {
  moduleNav: document.getElementById("moduleNav"),
  workflowTabs: document.getElementById("workflowTabs"),
  quickStarts: document.getElementById("quickStarts"),
  workflowForm: document.getElementById("workflowForm"),
  moduleKicker: document.getElementById("moduleKicker"),
  workflowTitle: document.getElementById("workflowTitle"),
  timeBadge: document.getElementById("timeBadge"),
  outputBadge: document.getElementById("outputBadge"),
  modulePromise: document.getElementById("modulePromise"),
  evidenceList: document.getElementById("evidenceList"),
  guardrailList: document.getElementById("guardrailList"),
  promptPreview: document.getElementById("promptPreview"),
  generateBtn: document.getElementById("generateBtn"),
  resetBtn: document.getElementById("resetBtn"),
  statusText: document.getElementById("statusText"),
  copyPromptBtn: document.getElementById("copyPromptBtn"),
  copyResultBtn: document.getElementById("copyResultBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  resultEmpty: document.getElementById("resultEmpty"),
  resultOutput: document.getElementById("resultOutput"),
  resultTitle: document.getElementById("resultTitle"),
  historyList: document.getElementById("historyList"),
  modePill: document.getElementById("modePill"),
  modeNote: document.getElementById("modeNote")
};

function activeModule() {
  return state.modules.find((item) => item.id === state.activeModuleId) || state.modules[0];
}

function activeWorkflow() {
  return state.workflowMap.get(state.activeWorkflowId) || state.workflows[0];
}

function workflowsForModule(moduleId) {
  return state.workflows.filter((workflow) => workflow.moduleId === moduleId);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTemplate(template, payload) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = payload[key];
    return value && String(value).trim() ? String(value).trim() : `[${key} 未填写]`;
  });
}

function setStatus(text, tone) {
  els.statusText.textContent = text;
  els.statusText.dataset.tone = tone || "neutral";
}

function renderModuleNav() {
  els.moduleNav.innerHTML = state.modules
    .map((module) => {
      const active = module.id === state.activeModuleId ? "active" : "";
      return `
        <button class="module-button ${active}" type="button" data-module-id="${module.id}">
          <span class="module-icon" style="background:${module.color}">${escapeHtml(module.icon)}</span>
          <span>
            <span class="module-name">${escapeHtml(module.name)}</span>
            <span class="module-output">${escapeHtml(module.primaryOutput)}</span>
          </span>
        </button>
      `;
    })
    .join("");
}

function renderWorkflowTabs() {
  const tabs = workflowsForModule(state.activeModuleId);
  els.workflowTabs.innerHTML = tabs
    .map((workflow) => {
      const active = workflow.id === state.activeWorkflowId ? "active" : "";
      return `<button class="workflow-tab ${active}" type="button" data-workflow-id="${workflow.id}">${escapeHtml(workflow.name)}</button>`;
    })
    .join("");
}

function renderQuickStarts() {
  const matches = state.quickStarts.filter((item) => {
    const workflow = state.workflowMap.get(item.workflowId);
    return workflow && workflow.moduleId === state.activeModuleId;
  });
  els.quickStarts.innerHTML = matches.length
    ? matches
      .map((item, index) => `<button class="chip-button" type="button" data-quick-index="${index}">${escapeHtml(item.title)}</button>`)
      .join("")
    : `<button class="chip-button" type="button" data-fill-sample="1">生成示例字段</button>`;
}

function renderForm() {
  const workflow = activeWorkflow();
  els.workflowForm.innerHTML = workflow.fields
    .map((field) => {
      const value = state.input[field.id] || "";
      if (field.type === "textarea") {
        return `
          <div class="field">
            <label for="field_${field.id}">${escapeHtml(field.label)}</label>
            <textarea id="field_${field.id}" data-field-id="${field.id}" placeholder="${escapeHtml(field.placeholder)}">${escapeHtml(value)}</textarea>
          </div>
        `;
      }
      return `
        <div class="field">
          <label for="field_${field.id}">${escapeHtml(field.label)}</label>
          <input id="field_${field.id}" data-field-id="${field.id}" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.placeholder)}" />
        </div>
      `;
    })
    .join("");
}

function renderInspector() {
  const module = activeModule();
  const workflow = activeWorkflow();
  els.moduleKicker.textContent = module.name;
  els.workflowTitle.textContent = workflow.name;
  els.timeBadge.textContent = workflow.estimatedTime;
  els.outputBadge.textContent = workflow.outputName;
  els.modulePromise.textContent = module.promise;
  els.evidenceList.innerHTML = workflow.confidenceNeeds.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  els.guardrailList.innerHTML = module.guardrails.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  els.promptPreview.textContent = renderTemplate(workflow.prompt, state.input);
}

function renderHistory() {
  if (!state.runs.length) {
    els.historyList.innerHTML = `<div class="history-meta">暂无运行记录。</div>`;
    return;
  }
  els.historyList.innerHTML = state.runs
    .slice(0, 8)
    .map((run) => {
      const date = new Date(run.createdAt);
      const formatted = Number.isNaN(date.getTime()) ? run.createdAt : date.toLocaleString("zh-CN", { hour12: false });
      return `
        <button class="history-item" type="button" data-run-id="${escapeHtml(run.id)}">
          <div class="history-title">
            <span>${escapeHtml(run.workflowName)}</span>
            <em class="history-mode">${escapeHtml(run.mode || "local")}</em>
          </div>
          <div class="history-meta">${escapeHtml(formatted)} · 置信度 ${escapeHtml(run.confidence ? run.confidence.level : "未知")}</div>
        </button>
      `;
    })
    .join("");
}

function renderResult(run) {
  state.currentRun = run;
  if (!run) {
    els.resultEmpty.classList.remove("hidden");
    els.resultOutput.classList.add("hidden");
    els.resultOutput.textContent = "";
    els.resultTitle.textContent = "还没有生成内容";
    return;
  }
  els.resultEmpty.classList.add("hidden");
  els.resultOutput.classList.remove("hidden");
  els.resultOutput.textContent = run.output;
  els.resultTitle.textContent = run.outputName || run.workflowName;
}

function renderAll() {
  renderModuleNav();
  renderWorkflowTabs();
  renderQuickStarts();
  renderForm();
  renderInspector();
  renderHistory();
}

function switchModule(moduleId) {
  state.activeModuleId = moduleId;
  const workflows = workflowsForModule(moduleId);
  state.activeWorkflowId = workflows[0] ? workflows[0].id : state.activeWorkflowId;
  state.input = {};
  renderAll();
}

function switchWorkflow(workflowId) {
  state.activeWorkflowId = workflowId;
  state.input = {};
  renderAll();
}

function collectInput() {
  const values = {};
  els.workflowForm.querySelectorAll("[data-field-id]").forEach((field) => {
    values[field.dataset.fieldId] = field.value;
  });
  state.input = values;
  return values;
}

function loadPayload(workflowId, payload) {
  const workflow = state.workflowMap.get(workflowId);
  if (!workflow) return;
  state.activeModuleId = workflow.moduleId;
  state.activeWorkflowId = workflowId;
  state.input = { ...payload };
  renderAll();
  setStatus("已载入示例数据", "success");
}

function fillSampleFields() {
  const workflow = activeWorkflow();
  const sample = {};
  workflow.fields.forEach((field) => {
    if (field.type === "textarea") {
      sample[field.id] = `${field.label}：请在这里粘贴真实业务数据、CSV摘要、客户原话或评论文本。`;
    } else {
      sample[field.id] = field.placeholder.replace(/例如\s*/g, "") || field.label;
    }
  });
  state.input = sample;
  renderForm();
  renderInspector();
  setStatus("已填入字段示例，请替换成真实数据", "success");
}

async function copyText(text, label) {
  if (!text) {
    setStatus("没有可复制内容", "warn");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    setStatus(`${label}已复制`, "success");
  } catch (err) {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    setStatus(`${label}已复制`, "success");
  }
}

function downloadCurrentRun() {
  if (!state.currentRun) {
    setStatus("还没有生成结果", "warn");
    return;
  }
  const slug = state.currentRun.workflowName.replace(/[^\w\u4e00-\u9fa5]+/g, "-").slice(0, 36);
  const blob = new Blob([state.currentRun.output], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slug || "ai-cross-border-output"}.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("Markdown 已下载", "success");
}

async function generate() {
  const workflow = activeWorkflow();
  const input = collectInput();
  els.generateBtn.disabled = true;
  setStatus("正在生成，请稍候", "running");

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflowId: workflow.id, input })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "生成失败");
    state.runs.unshift(payload.run);
    state.runs = state.runs.slice(0, 50);
    renderResult(payload.run);
    renderHistory();
    setStatus(payload.run.mode === "ai" ? "AI 结果已生成" : "本地草稿已生成", "success");
  } catch (err) {
    setStatus(err.message || "生成失败", "error");
  } finally {
    els.generateBtn.disabled = false;
  }
}

async function loadConfig() {
  try {
    const response = await fetch("/api/config");
    const config = await response.json();
    els.modePill.textContent = config.hasOpenAIKey ? `AI · ${config.model}` : "本地草稿";
    els.modePill.className = `mode-pill ${config.hasOpenAIKey ? "ai" : "local"}`;
    els.modeNote.textContent = config.hasOpenAIKey
      ? "已检测到 OPENAI_API_KEY，会调用模型生成正式结果。"
      : "未配置 OPENAI_API_KEY，当前生成结构化草稿和完整 Prompt。";
  } catch (err) {
    els.modePill.textContent = "服务异常";
    els.modeNote.textContent = err.message;
  }
}

async function loadData() {
  const [promptResponse, runResponse] = await Promise.all([
    fetch("/api/prompts"),
    fetch("/api/runs")
  ]);
  const promptPayload = await promptResponse.json();
  const runPayload = await runResponse.json();
  state.modules = promptPayload.modules;
  state.workflows = promptPayload.workflows;
  state.workflowMap = new Map(state.workflows.map((workflow) => [workflow.id, workflow]));
  state.quickStarts = promptPayload.quickStarts;
  state.runs = runPayload.runs || [];
  renderAll();
}

els.moduleNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-module-id]");
  if (!button) return;
  switchModule(button.dataset.moduleId);
});

els.workflowTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-workflow-id]");
  if (!button) return;
  switchWorkflow(button.dataset.workflowId);
});

els.quickStarts.addEventListener("click", (event) => {
  const sampleButton = event.target.closest("[data-fill-sample]");
  if (sampleButton) {
    fillSampleFields();
    return;
  }
  const button = event.target.closest("[data-quick-index]");
  if (!button) return;
  const matches = state.quickStarts.filter((item) => {
    const workflow = state.workflowMap.get(item.workflowId);
    return workflow && workflow.moduleId === state.activeModuleId;
  });
  const selected = matches[Number(button.dataset.quickIndex)];
  if (selected) loadPayload(selected.workflowId, selected.payload);
});

els.workflowForm.addEventListener("input", () => {
  collectInput();
  renderInspector();
});

els.generateBtn.addEventListener("click", generate);

els.resetBtn.addEventListener("click", () => {
  state.input = {};
  renderForm();
  renderInspector();
  setStatus("已清空输入", "success");
});

els.copyPromptBtn.addEventListener("click", () => {
  collectInput();
  copyText(renderTemplate(activeWorkflow().prompt, state.input), "Prompt");
});

els.copyResultBtn.addEventListener("click", () => {
  copyText(state.currentRun ? state.currentRun.output : "", "结果");
});

els.downloadBtn.addEventListener("click", downloadCurrentRun);

els.historyList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-run-id]");
  if (!button) return;
  const run = state.runs.find((item) => item.id === button.dataset.runId);
  if (run) {
    state.activeWorkflowId = run.workflowId;
    const workflow = state.workflowMap.get(run.workflowId);
    if (workflow) state.activeModuleId = workflow.moduleId;
    state.input = { ...run.input };
    renderAll();
    renderResult(run);
    setStatus("已载入历史结果", "success");
  }
});

Promise.all([loadConfig(), loadData()]).catch((err) => {
  setStatus(err.message || "初始化失败", "error");
});
