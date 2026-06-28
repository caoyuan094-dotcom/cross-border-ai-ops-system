"use strict";

const modules = [
  {
    id: "diagnosis",
    name: "客户诊断报告",
    shortName: "诊断",
    icon: "DG",
    color: "#27576b",
    promise: "把店铺、ASIN、广告、评论、供应链数据汇总成一份可收费的全链路诊断报告。",
    primaryOutput: "100 分诊断报告 + TOP 10 优先行动清单",
    inputs: ["店铺链接/名称", "主营品类", "月销售额估算", "客户原话痛点", "ASIN/广告/Review/库存数据"],
    guardrails: ["每个结论必须有数据或截图证据", "缺少报表时明确标注低置信度", "不要伪造搜索量、销量、费用或平台政策"],
    workflows: ["store_audit", "competitor_visual", "qbr_plan"]
  },
  {
    id: "product",
    name: "选品诊断",
    shortName: "选品",
    icon: "PD",
    color: "#3e6259",
    promise: "从类目、ASIN、差评、利润和竞争格局判断一个品能不能做。",
    primaryOutput: "Go / Watch / No-Go 决策 memo",
    inputs: ["品类英文名", "竞品 ASIN/CSV", "价格/销量/评分/评论数", "上架时间/BSR", "差评文本"],
    guardrails: ["不要凭感觉估销量", "新品存活率和头部集中度要用数据算", "母婴/食品接触/电池类目先做合规筛查"],
    workflows: ["category_panorama", "asin_deep_dive", "blue_ocean"]
  },
  {
    id: "listing",
    name: "Listing 生产",
    shortName: "Listing",
    icon: "LS",
    color: "#8a5a2b",
    promise: "用美国站本地化文案逻辑生成标题、五点、描述、搜索词、A+ 和图片 brief。",
    primaryOutput: "完整上架内容包",
    inputs: ["产品名", "材质/规格", "3-5 个差异化卖点", "目标客群", "关键词/竞品 ASIN"],
    guardrails: ["不写无法证明的 best/guaranteed/medical claims", "竞品品牌词不能写进 Listing", "标题前 80 字符必须可读"],
    workflows: ["full_listing", "localization", "brand_story", "bullet_strategy", "image_prompt"]
  },
  {
    id: "ads",
    name: "广告管理",
    shortName: "广告",
    icon: "AD",
    color: "#6f4f87",
    promise: "诊断 PPC 报表，收割关键词、否定浪费词、调整出价和预算。",
    primaryOutput: "广告动作表 + 7 天执行计划",
    inputs: ["14/30 天广告报表", "Campaign/Search Term 数据", "ACOS/TACOS/CVR/CPC", "目标 ACOS", "库存状态"],
    guardrails: ["没有利润就不能判断 ACOS 好坏", "新品期和利润期目标分开", "库存不足时不放大广告"],
    workflows: ["ads_report", "keyword_research", "automation_rules"]
  },
  {
    id: "service",
    name: "客服与差评",
    shortName: "客服",
    icon: "CS",
    color: "#75533b",
    promise: "把客户消息、差评、售后邮件和竞品差评转成客服动作与产品改良依据。",
    primaryOutput: "回复模板 + 根治方案 + 申诉草稿",
    inputs: ["品牌名", "品类", "客户消息/差评文本", "订单上下文", "联系方式/政策边界"],
    guardrails: ["不要求客户改评", "不承诺无法 100% 保证的事", "差评投诉先升级人工，不自定赔偿"],
    workflows: ["support_bot", "review_response", "email_templates", "competitor_review_mine"]
  },
  {
    id: "supply",
    name: "供应链预测",
    shortName: "供应链",
    icon: "SC",
    color: "#53633d",
    promise: "用库存、日销、在途和周期数据生成补货、旺季备货和供应商评估方案。",
    primaryOutput: "补货计划 + 断货风险 + 供应商矩阵",
    inputs: ["FBA 库存", "7/30 天日均销量", "在途库存", "采购/海运/清关周期", "MOQ/旺季因子"],
    guardrails: ["可售、预留、在途要分开", "断货风险要给日期或天数", "合同建议不能替代法律意见"],
    workflows: ["restock_plan", "peak_season", "supplier_matrix"]
  }
];

const workflows = {
  store_audit: {
    id: "store_audit",
    moduleId: "diagnosis",
    name: "全链路店铺诊断",
    tagline: "你的核心付费产品：把客户店铺拆成 Listing、广告、竞争、Review、供应链五张问题表。",
    outputName: "店铺诊断报告",
    estimatedTime: "8-12 分钟",
    confidenceNeeds: ["至少 1 个 ASIN", "广告或搜索词报表", "Review 样本", "库存/销售概况"],
    fields: [
      { id: "store", label: "店铺链接/名称", type: "text", placeholder: "例如 Brand Store URL / 店铺名" },
      { id: "category", label: "主营品类", type: "text", placeholder: "例如 baby stroller accessories" },
      { id: "monthlySales", label: "月销售额估算", type: "text", placeholder: "例如 $30,000 / 不确定" },
      { id: "pain", label: "客户当前最大痛点", type: "textarea", placeholder: "用客户原话粘贴：广告烧钱、转化低、断货、差评..." },
      { id: "data", label: "数据材料", type: "textarea", placeholder: "粘贴 ASIN、标题、评分、评论数、广告报表摘要、差评、库存数据或截图文字" }
    ],
    prompt: `你是AI跨境电商诊断专家。为客户的亚马逊店铺做一次完整的AI全链路诊断。

客户店铺信息：
- 店铺链接/名称：{{store}}
- 主营品类：{{category}}
- 月销售额（估算）：{{monthlySales}}
- 客户当前最大的痛点：{{pain}}

可用数据材料：
{{data}}

诊断框架和输出要求：

## 一、Listing 诊断（30分制）
逐条ASIN分析：标题质量、图片质量、A+页面、Bullet Points、评分。每个ASIN打出1-10分，标注关键扣分项。

## 二、广告诊断（25分制）
分析整体ACOS/ROAS、广告结构、关键词效率、预算分配、竞品广告侵略性，给出TOP 5优化动作和预估ACOS改善空间。

## 三、品类竞争诊断（20分制）
判断红海/蓝海，说明消费者为什么选竞品不选我，指出差异化缺口。

## 四、客服与Review诊断（15分制）
分析差评集中问题、好评中的真实卖点、差评回复质量。

## 五、供应链效率诊断（10分制）
判断断货/缺货迹象、库存深度、IPI风险和优化空间。

## 六、综合评分与优先行动清单
输出总分、评级、TOP 10优先行动项。排序逻辑：影响最大 × 成本最低。
每个行动项附：预计提升效果 / 实施难度 / 所需时间。

## 七、AI工具推荐
针对弱点推荐3-5个AI工具或内部工作流。

报告风格：数据说话，不说废话。每个结论必须附带数据、截图证据或明确标注“当前证据不足”。`
  },
  competitor_visual: {
    id: "competitor_visual",
    moduleId: "diagnosis",
    name: "竞品对标可视化报告",
    tagline: "把我的 ASIN 和 3 个竞品放到价格、评分、Review、关键词、BSR、卖点矩阵里比较。",
    outputName: "竞品对标报告",
    estimatedTime: "6-10 分钟",
    confidenceNeeds: ["我的 ASIN", "3 个竞品 ASIN", "价格/评分/Review/排名数据", "关键词排名"],
    fields: [
      { id: "myAsin", label: "我的 ASIN", type: "text", placeholder: "B0..." },
      { id: "competitors", label: "竞品 ASIN", type: "text", placeholder: "B0..., B0..., B0..." },
      { id: "metrics", label: "对比数据", type: "textarea", placeholder: "价格、评分、Review增长、关键词排名、BSR走势、卖点摘要" }
    ],
    prompt: `你对标 {{myAsin}} 和 {{competitors}}，生成一份可视化竞品对比。

可用数据：
{{metrics}}

对比维度：
1. 价格 vs 评分矩阵
2. Review数量和评分增长率对比曲线
3. 关键词覆盖重叠度
4. 搜索排名对比
5. BSR走势对比
6. 差异化卖点矩阵

结论必须说明：我的产品在每个维度的排名和差距，短期可追上的指标，长期应建立的壁垒。`
  },
  qbr_plan: {
    id: "qbr_plan",
    moduleId: "diagnosis",
    name: "季度增长计划",
    tagline: "一页纸 QBR：把上季度运营数据转成下季度 1-2 个关键动作。",
    outputName: "季度增长计划",
    estimatedTime: "4-7 分钟",
    confidenceNeeds: ["销售额和环比", "广告ACOS", "BSR变化", "新品表现", "断货次数", "差评率"],
    fields: [
      { id: "brand", label: "品牌名", type: "text", placeholder: "Brand" },
      { id: "quarterData", label: "上季度数据摘要", type: "textarea", placeholder: "销售额、环比、ACOS、BSR、新品、断货、差评率..." }
    ],
    prompt: `你是 {{brand}} 的增长顾问，根据上季度运营数据和当前市场状况，制定下季度增长方案。

上季度数据摘要：
{{quarterData}}

需要回答：
1. 上季度增长/下滑的最核心主因是什么？
2. 下季度如果把80%精力砸在1-2件事上，应该做什么？
3. 如果下季度多招一个人，应该招什么岗位？
4. 如果下季度只允许投一个新广告战役，投什么？
5. 下季度最应该停止做什么？

输出：一页纸 QBR 文档，不要写论文。`
  },
  category_panorama: {
    id: "category_panorama",
    moduleId: "product",
    name: "类目竞争全景分析",
    tagline: "判断类目是不是红海、伪蓝海，顺带找差评驱动的差异化切口。",
    outputName: "类目进入判断",
    estimatedTime: "8-12 分钟",
    confidenceNeeds: ["Top 20 CSV", "销量/价格/评分/评论/上架时间/BSR", "差评聚合"],
    fields: [
      { id: "category", label: "品类英文名", type: "text", placeholder: "glass food storage containers" },
      { id: "csv", label: "Top 20 竞品数据", type: "textarea", placeholder: "粘贴 Jungle Scout / Helium 10 导出的CSV数据" },
      { id: "reviews", label: "差评样本", type: "textarea", placeholder: "粘贴一星、二星、三星评论或关键词摘要" }
    ],
    prompt: `你是亚马逊美国站8年经验的资深选品经理，深谙数据分析和消费者心理学。

我正在评估进入 {{category}} 这个类目的可行性。以下是该类目 Top 20 竞品关键数据：
{{csv}}

差评样本：
{{reviews}}

请完成分析，每个结论必须附带数据依据：
1. 竞争格局诊断：TOP 3 / TOP 10 销量占比，新品存活率，入场难度。
2. 消费者未满足需求：差评关键词TOP 10，差评分类，3个最值得切入的痛点。
3. 差异化切入点：3个方向，标注改造成本、溢价空间、专利风险。
4. 利润测算：竞品价格中位数，FBA+头程+采购成本假设，3个定价档位净利率。

输出格式：分段小标题，数据表格，结论加粗。`
  },
  asin_deep_dive: {
    id: "asin_deep_dive",
    moduleId: "product",
    name: "单品深度诊断",
    tagline: "围绕一个 ASIN 判断能不能抄、从哪里差异化、为什么可能不要做。",
    outputName: "ASIN 解剖 memo",
    estimatedTime: "5-9 分钟",
    confidenceNeeds: ["目标ASIN", "Keepa/销量/Review/关键词趋势数据"],
    fields: [
      { id: "asin", label: "目标 ASIN", type: "text", placeholder: "B0..." },
      { id: "data", label: "历史与评论数据", type: "textarea", placeholder: "Keepa价格、30天销量、BSR变化、Review评分分布、关键词趋势" }
    ],
    prompt: `你是亚马逊品类分析专家。针对以下ASIN做深度竞品解剖：

目标ASIN：{{asin}}
可用信息：
{{data}}

输出：
1. 这个品是否处于上升期还是衰退期，必须用数据佐证。
2. 如果可以抄，从哪入手差异化，给3个具体方案。
3. 如果不要抄，为什么，指出致命缺陷。`
  },
  blue_ocean: {
    id: "blue_ocean",
    moduleId: "product",
    name: "跨品类蓝海发现",
    tagline: "从一堆 ASIN 快照中筛出最值得进一步验证的 5 个机会。",
    outputName: "蓝海机会 TOP 5",
    estimatedTime: "6-10 分钟",
    confidenceNeeds: ["50个ASIN快照", "类目/BSR/评分/价格/上架时间/搜索量"],
    fields: [
      { id: "snapshots", label: "ASIN 快照数据", type: "textarea", placeholder: "粘贴来自不同品类的50个ASIN CSV" }
    ],
    prompt: `你要在一堆看似随机的数据中找到别人没发现的蓝海品类。

ASIN快照数据：
{{snapshots}}

筛选标准：
- 小类目BSR前10名中有新面孔（<6个月）
- 评分普遍低于4.0
- 价格区间宽但高评分集中在高价位
- 搜索量上升但Listing质量差

按标准筛出TOP 5蓝海机会，每个附：品类/机会点/为什么现在值得进/风险点。`
  },
  full_listing: {
    id: "full_listing",
    moduleId: "listing",
    name: "完整 Listing 生成",
    tagline: "一次生成标题、五点、描述、搜索词、移动端检查和 A+ 页面方案。",
    outputName: "Listing 内容包",
    estimatedTime: "5-8 分钟",
    confidenceNeeds: ["产品事实", "关键词", "差异化卖点", "目标客群", "竞品定位"],
    fields: [
      { id: "category", label: "品类", type: "text", placeholder: "kitchen storage / baby accessories" },
      { id: "product", label: "产品名", type: "text", placeholder: "Glass Food Container Set" },
      { id: "specs", label: "材质/规格", type: "textarea", placeholder: "材质、尺寸、重量、颜色、包装..." },
      { id: "differentiators", label: "核心差异化卖点", type: "textarea", placeholder: "3-5个你比竞品强的点" },
      { id: "audience", label: "目标客群", type: "text", placeholder: "health-conscious millennial moms" },
      { id: "competitors", label: "竞品ASIN/关键词", type: "textarea", placeholder: "2-3个ASIN和核心关键词" }
    ],
    prompt: `你是亚马逊美国站的Native English copywriter，专业写listing 8年，品类是 {{category}}。文风简洁、卖点清晰、无中式英语、符合美国消费者阅读习惯。

产品信息：
- 产品名：{{product}}
- 材质/规格：{{specs}}
- 核心差异化卖点：{{differentiators}}
- 目标客群：{{audience}}
- 竞品ASIN/关键词：{{competitors}}

任务：生成完整Amazon Listing
A. 标题：3个版本，150-200字符，前80字符包含核心词+最大卖点，并标注关键词覆盖策略。
B. 五点描述：5点，每点不超过200字符，第1点是最大差异化卖点，至少2点包含长尾关键词。
C. 产品描述：2000字符内，HTML格式，用A+页面思维。
D. 隐藏搜索词：两组250字节，避免标题已用词，含西语同义词和常见拼写错误。
E. 移动端优化检查。
F. A+页面内容：7个模块，含品牌故事、产品对比、使用场景。`
  },
  localization: {
    id: "localization",
    moduleId: "listing",
    name: "多语言 Listing 本地化",
    tagline: "不是直译，把美国站 Listing 改成目标市场能自然购买的版本。",
    outputName: "本地化 Listing",
    estimatedTime: "4-6 分钟",
    confidenceNeeds: ["目标市场", "语言", "美国站Listing", "目标国禁忌/关键词"],
    fields: [
      { id: "market", label: "目标市场", type: "text", placeholder: "Germany / Japan / Mexico" },
      { id: "language", label: "目标语言", type: "text", placeholder: "German / Japanese / Spanish" },
      { id: "listing", label: "美国站版本", type: "textarea", placeholder: "粘贴英文 Listing" }
    ],
    prompt: `你是 {{market}} 的本地电商写手，母语为 {{language}}。

请将以下亚马逊美国站文案翻译到目标站点。要求：不是直译，是本地化改写；保留SEO关键词位置；符合目标国消费者阅读习惯；美国站合理但目标市场不合理的描述要替换。

美国站版本：
{{listing}}

输出：标题 / 五点 / 描述 / 搜索词完整本地化版本。`
  },
  brand_story: {
    id: "brand_story",
    moduleId: "listing",
    name: "A+ / 独立站品牌故事",
    tagline: "把品牌背景写成能放进 A+ 页面或 About Us 的真实故事。",
    outputName: "品牌故事文案",
    estimatedTime: "3-5 分钟",
    confidenceNeeds: ["品牌名", "品类", "创始人背景", "品牌理念", "语气"],
    fields: [
      { id: "brand", label: "品牌名", type: "text", placeholder: "Brand" },
      { id: "category", label: "品类", type: "text", placeholder: "home storage" },
      { id: "founder", label: "创始人背景", type: "text", placeholder: "一句话背景" },
      { id: "why", label: "品牌理念/创立原因", type: "textarea", placeholder: "为什么做这个品牌" },
      { id: "values", label: "核心价值观", type: "text", placeholder: "durable, practical, clean" },
      { id: "tone", label: "语气", type: "text", placeholder: "专业/温暖/极客/环保" }
    ],
    prompt: `你是一个DTC品牌故事专家。为 {{brand}} 写一个品牌故事，用于亚马逊A+页面品牌模块或独立站About Us页面。

品牌信息：
- 品类：{{category}}
- 创始人背景：{{founder}}
- 品牌理念/为什么创立：{{why}}
- 核心价值观：{{values}}
- 语气：{{tone}}

要求：300-500词，用真实故事开头。结构：场景开头 → 痛点发现 → 行动 → 品牌承诺 → CTA。不要“我们成立于XX年”，而是“我们在乎XX”。`
  },
  bullet_strategy: {
    id: "bullet_strategy",
    moduleId: "listing",
    name: "五点差异化攻略",
    tagline: "从竞品 Bullet 合集中分辨行业标配、机会卖点和蓝海卖点。",
    outputName: "五点重排与优化",
    estimatedTime: "4-7 分钟",
    confidenceNeeds: ["我的卖点", "竞品TOP10 Bullet Points"],
    fields: [
      { id: "myPoints", label: "我的 3-5 个卖点", type: "textarea", placeholder: "列出产品卖点" },
      { id: "competitorBullets", label: "竞品 Bullet Points 合集", type: "textarea", placeholder: "粘贴竞品TOP 10五点合集" }
    ],
    prompt: `以下是我的卖点和竞品TOP 10 Bullet Points合集。

我的差异化卖点：
{{myPoints}}

竞品Bullet Points合集：
{{competitorBullets}}

请分析：
1. 哪些卖点是行业标配。
2. 哪些卖点只有1-2家竞品提到。
3. 哪些卖点没人提。
4. 重新排序我的五点：从消费者最在意到说了有加分。
5. 给出优化后的5条Bullet Points。`
  },
  image_prompt: {
    id: "image_prompt",
    moduleId: "listing",
    name: "产品图 AI 生成提示词",
    tagline: "生成白底主图、场景图和信息图 brief，可给设计师或 Midjourney 使用。",
    outputName: "图片拍摄 / AI 作图 Brief",
    estimatedTime: "4-6 分钟",
    confidenceNeeds: ["产品名", "场景", "模特设定", "核心卖点"],
    fields: [
      { id: "product", label: "产品名", type: "text", placeholder: "Product name" },
      { id: "scenes", label: "场景要求", type: "textarea", placeholder: "厨房/卧室/办公桌/户外...每个场景的使用状态" },
      { id: "model", label: "模特设定", type: "text", placeholder: "种族/年龄段/性别/pose" },
      { id: "sellingPoints", label: "核心卖点", type: "textarea", placeholder: "尺寸、材质、痛点、对比数据" }
    ],
    prompt: `你是一个专业摄影指导。请为 {{product}} 生成产品图方案。

场景要求：
{{scenes}}
模特设定：{{model}}
核心卖点：
{{sellingPoints}}

输出：
1. 白底主图5张Midjourney prompt：正面、背面、45度侧面、细节特写、包装/配件。必须是纯白底RGB 255,255,255，产品占画面85%以上，commercial product photography。
2. 场景图5张Midjourney prompt：每个场景有明确使用状态，natural light, lifestyle photography。
3. A+信息图3张内容方案：布局、数据、配色建议。`
  },
  ads_report: {
    id: "ads_report",
    moduleId: "ads",
    name: "广告报告分析",
    tagline: "自动诊断 14 天广告报表，找浪费词、赢家词和预算错配。",
    outputName: "PPC 优化动作表",
    estimatedTime: "6-9 分钟",
    confidenceNeeds: ["Search Term报表", "Spend/Sales/Orders/Clicks/Impressions", "目标ACOS"],
    fields: [
      { id: "dateRange", label: "报表周期", type: "text", placeholder: "最近14天" },
      { id: "targetAcos", label: "目标 ACOS", type: "text", placeholder: "25%" },
      { id: "report", label: "广告报表数据", type: "textarea", placeholder: "粘贴亚马逊广告报告CSV或摘要" }
    ],
    prompt: `你是亚马逊PPC广告专家。分析以下广告报表，找出问题并给出优化方案。

报表周期：{{dateRange}}
目标ACOS：{{targetAcos}}
广告数据：
{{report}}

请完成：
1. 健康度诊断：整体ACOS评级，各广告组对比，CTR判断。
2. 关键词收割清单：转化率>5%的长尾词，ACOS>40%的词，花费不少但零转化的词。
3. 出价优化建议：上调、下调、分时段调整。
4. 预算分配优化。
5. 下一周行动计划：7天内5个动作，每个动作带预期效果。`
  },
  keyword_research: {
    id: "keyword_research",
    moduleId: "ads",
    name: "关键词研究",
    tagline: "从核心词、长尾词、竞品词、互补词、西语词和否定词搭建投放地图。",
    outputName: "关键词体系",
    estimatedTime: "5-8 分钟",
    confidenceNeeds: ["品类/产品名", "关键词导出", "竞品ASIN", "站点语言"],
    fields: [
      { id: "product", label: "品类/产品名", type: "text", placeholder: "stroller cup holder" },
      { id: "seedData", label: "已有关键词/竞品/搜索词", type: "textarea", placeholder: "粘贴关键词、搜索词报表、竞品ASIN" }
    ],
    prompt: `你是亚马逊关键词策略专家。

为 {{product}} 生成完整关键词体系。
已有数据：
{{seedData}}

请按以下逻辑输出：
1. 核心大词
2. 长尾精准词
3. 竞品品牌词+ASIN
4. 互补品类词
5. 西语词
6. 否定词

每个关键词标注：月搜索量(预估或数据来源) / 建议匹配类型 / 建议出价范围 / 优先级。
最后给出新品冷启动前4周关键词投放节奏。`
  },
  automation_rules: {
    id: "automation_rules",
    moduleId: "ads",
    name: "广告策略自动化规则",
    tagline: "给 Perpetua / Teikametrics / Seller Central 原生规则写一套可执行规则书。",
    outputName: "AI 广告规则书",
    estimatedTime: "5-8 分钟",
    confidenceNeeds: ["工具平台", "月预算", "目标ACOS", "ASIN数量", "新品期", "品类"],
    fields: [
      { id: "tool", label: "使用工具", type: "text", placeholder: "Perpetua / Teikametrics / Seller Central 原生" },
      { id: "budget", label: "月广告预算", type: "text", placeholder: "$3000" },
      { id: "targetAcos", label: "目标 ACOS", type: "text", placeholder: "25%" },
      { id: "asinCount", label: "在售 ASIN 数量", type: "text", placeholder: "12" },
      { id: "isNew", label: "是否新品期", type: "text", placeholder: "是/否" },
      { id: "category", label: "品类", type: "text", placeholder: "baby accessories" }
    ],
    prompt: `为我的亚马逊广告账号设定自动化管理规则。我使用 {{tool}}。

账号信息：
- 月广告预算：{{budget}}
- 目标ACOS：{{targetAcos}}
- 在售ASIN数量：{{asinCount}}
- 是否新品期：{{isNew}}
- 品类：{{category}}

请生成完整AI规则书：
1. 自动添加关键词规则
2. 自动否定关键词规则
3. 自动调整出价规则
4. 预算分配规则
5. 异常预警阈值

每条规则写清条件、动作、复核频率和人工确认边界。`
  },
  support_bot: {
    id: "support_bot",
    moduleId: "service",
    name: "多语言客服机器人",
    tagline: "处理客户消息，质量问题给选项，投诉差评触发人工升级。",
    outputName: "客服回复草稿",
    estimatedTime: "2-4 分钟",
    confidenceNeeds: ["品牌名", "品类", "客户消息", "订单上下文"],
    fields: [
      { id: "brand", label: "品牌名", type: "text", placeholder: "Brand" },
      { id: "agentName", label: "客服名字", type: "text", placeholder: "Mia" },
      { id: "category", label: "品类", type: "text", placeholder: "kitchen storage" },
      { id: "tone", label: "品牌调性", type: "text", placeholder: "温暖专业/极简高效/幽默潮酷" },
      { id: "message", label: "客户消息", type: "textarea", placeholder: "粘贴客户消息和订单上下文" }
    ],
    prompt: `你是 {{brand}} 的智能客服，代表品牌形象。你的名字是 {{agentName}}。

品牌信息：
- 品类：{{category}}
- 品牌调性：{{tone}}

处理规则：
- 订单查询：告知物流状态和预计送达，但不要编造未知信息。
- 产品使用问题：先确认操作方式，再给步骤。
- 质量问题：道歉一次，提供 Full refund / Free replacement / Partial refund 三个选项，48小时内处理。
- 差评/投诉：安抚+收集信息，升级到高级客服，24h内回复。不要自己决定赔偿方案。
- 不会的问题：诚实升级。
- 禁止：编造信息、承诺不能保证的事、争论、主动要求五星好评、emoji。

现在处理以下客户消息：
{{message}}`
  },
  review_response: {
    id: "review_response",
    moduleId: "service",
    name: "差评分析与回复",
    tagline: "逐条判断差评类型，生成公开回复、根治方案和可申诉模板。",
    outputName: "差评处理包",
    estimatedTime: "5-8 分钟",
    confidenceNeeds: ["1-3星差评文本", "产品名", "品牌名", "联系方式"],
    fields: [
      { id: "brand", label: "品牌名", type: "text", placeholder: "Brand" },
      { id: "product", label: "产品名", type: "text", placeholder: "Product" },
      { id: "contact", label: "联系方式", type: "text", placeholder: "support email / Amazon message path" },
      { id: "reviews", label: "差评内容", type: "textarea", placeholder: "粘贴最近收到的1-3星差评" }
    ],
    prompt: `你是一个擅长处理亚马逊差评的客服专家。

品牌：{{brand}}
产品：{{product}}
联系方式：{{contact}}
差评内容：
{{reviews}}

逐个完成：
1. 差评类型判定：A产品真实缺陷 / B使用方式错误 / C预期不符 / D物流包装FBA / E无理或可申诉。
2. 回复策略：不要求改评，不解释狡辩，结构为道歉、理解需求、解决方案、邀请联系。
3. 给每条差评写一条英文公开回复。
4. 根治方案：A类给供应商改进，C类给Listing修改。
5. E类如违反评论政策，生成英文申诉模板。`
  },
  email_templates: {
    id: "email_templates",
    moduleId: "service",
    name: "售后邮件 7 场景模板",
    tagline: "生成订单、送达、保修、退换货、召回、新品、私密补偿邮件。",
    outputName: "售后邮件模板库",
    estimatedTime: "4-6 分钟",
    confidenceNeeds: ["品牌名", "产品品类", "语气"],
    fields: [
      { id: "brand", label: "品牌名", type: "text", placeholder: "Brand" },
      { id: "category", label: "产品品类", type: "text", placeholder: "category" },
      { id: "tone", label: "语气", type: "text", placeholder: "温暖专业" }
    ],
    prompt: `为以下7个售后场景生成英文邮件模板。品牌：{{brand}}，产品：{{category}}，语气：{{tone}}。

场景：
1. 订单确认+预计送达
2. 订单已送达（附产品使用小提示）
3. 售后保修到期提醒
4. 客户提出退货/换货（48小时没回复的跟进）
5. 产品召回/安全提醒
6. 新品上市通知（老客户定向）
7. 差评客户的私密补偿

每个模板要求：标题10字以内英文，正文100-200词，服务感，不要Dear Valued Customer，用[Customer Name]占位。`
  },
  competitor_review_mine: {
    id: "competitor_review_mine",
    moduleId: "service",
    name: "竞品差评挖掘",
    tagline: "把竞品差评变成产品规格、卖点和 A+ 内容。",
    outputName: "差评驱动卖点",
    estimatedTime: "6-9 分钟",
    confidenceNeeds: ["竞品ASIN", "品类", "至少20条差评"],
    fields: [
      { id: "asin", label: "竞品 ASIN", type: "text", placeholder: "B0..." },
      { id: "category", label: "品类", type: "text", placeholder: "category" },
      { id: "reviews", label: "差评内容", type: "textarea", placeholder: "粘贴20条以上一星二星差评原文" }
    ],
    prompt: `你是消费者洞察分析师。请分析以下竞品ASIN的差评合集。

竞品ASIN：{{asin}}
品类：{{category}}
差评内容：
{{reviews}}

分析框架：
1. 差评词频分析：TOP 10高频关键词和频次。
2. 痛点分类：产品质量/功能/尺寸/材质/耐用/包装/气味/噪音/使用难度/预期不符/客服，占比%。
3. “如果我来做”优化方案：TOP 3痛点逐一给做法、成本增加、值不值。
4. 生成差评驱动的卖点。
5. 差评转内容：给一条Q&A或A+场景内容。`
  },
  restock_plan: {
    id: "restock_plan",
    moduleId: "supply",
    name: "补货决策",
    tagline: "按 7 天日销、在途和采购周期判断哪些 SKU 必须补货。",
    outputName: "FBA 补货计划",
    estimatedTime: "5-8 分钟",
    confidenceNeeds: ["SKU库存", "7/30天日销", "在途", "采购/海运/清关周期", "广告计划"],
    fields: [
      { id: "skuData", label: "SKU库存与销量数据", type: "textarea", placeholder: "SKU / FBA库存 / 30天日均 / 7天日均 / 在途 / 采购周期 / 海运 / 清关" },
      { id: "season", label: "旺季因子", type: "text", placeholder: "Prime Day / 黑五 / 无" },
      { id: "adsPlan", label: "未来30天广告计划", type: "textarea", placeholder: "预算增加/减少，主推SKU" }
    ],
    prompt: `你是FBA库存管理专家。为我生成补货计划。

当前状态：
{{skuData}}

旺季因子：{{season}}
广告计划：
{{adsPlan}}

请计算：
1. 每个SKU库存健康度：可售天数、安全库存线、状态。
2. 补货建议：必须下单、3天内下单、推荐补货量，MOQ不足时组合方案。
3. 头程物流建议：危险SKU空运/美森，安全SKU普船或拼柜，预估头程费用。
4. 风险提示：未来4周断货风险，冗余库存风险。
5. IPI优化建议和冗余库存处理方案。`
  },
  peak_season: {
    id: "peak_season",
    moduleId: "supply",
    name: "旺季备货模拟",
    tagline: "为 Prime Day、黑五或圣诞做保守/基准/乐观三档备货模型。",
    outputName: "旺季备货方案",
    estimatedTime: "5-8 分钟",
    confidenceNeeds: ["旺季名称", "日销", "库存", "在途", "广告增幅", "竞品折扣"],
    fields: [
      { id: "brand", label: "品牌名", type: "text", placeholder: "Brand" },
      { id: "season", label: "旺季名称", type: "text", placeholder: "Prime Day 2026" },
      { id: "data", label: "历史和当前数据", type: "textarea", placeholder: "行业增长倍数、30天日销、当前FBA、在途、广告增幅、竞品折扣" }
    ],
    prompt: `我是 {{brand}} 的供应链负责人。请帮我做 {{season}} 的备货方案。

历史和当前数据：
{{data}}

请给出：
1. 销量预估模型：保守/基准/乐观三档和旺季前后销量曲线。
2. 备货量计算：Target库存量，分批发货时间表和发货量。
3. 断货应急方案：TOP 3 SKU替代方案。
4. 广告配合方案：旺季前2周、旺季中、旺季后一周。
5. 数据看板：备货跟踪表模板和每天盯的5个数字。`
  },
  supplier_matrix: {
    id: "supplier_matrix",
    moduleId: "supply",
    name: "供应商评估",
    tagline: "把 3-5 家供应商按硬指标、软实力、风险和首单合同条款排序。",
    outputName: "供应商评估矩阵",
    estimatedTime: "5-8 分钟",
    confidenceNeeds: ["供应商规模/价格/MOQ/交期/资质/沟通/样品质量"],
    fields: [
      { id: "suppliers", label: "供应商信息", type: "textarea", placeholder: "每家供应商：规模/样品/价格/MOQ/交期/付款/ISO/亚马逊经验/响应质量" }
    ],
    prompt: `你是有10年跨境供应链管理经验的采购经理。

以下是我从3-5家供应商收到的信息：
{{suppliers}}

请帮我做供应商评估矩阵：
1. 硬指标对比表：价格/交期/MOQ/资质。
2. 软实力评估：沟通/配合度/样品质量/准时率信誉。
3. 风险评估：延迟、质量、给竞品供货嫌疑。
4. 打分排名 + 合作建议：首单给谁，备选是谁。
5. 首单合同注意事项：付款条款、质检节点、延期交付罚则。`
  }
};

const quickStarts = [
  {
    title: "做一个客户付费诊断",
    workflowId: "store_audit",
    payload: {
      store: "BrightNest Home",
      category: "glass food storage containers",
      monthlySales: "$42,000",
      pain: "广告费越来越高，转化没有涨；新品上架后Review增长慢，库存还经常压着。",
      data: "ASIN A: price $29.99, rating 4.2, reviews 820, ACOS 38%, CVR 8.1%, FBA stock 620, 7-day sales 22/day. Main complaints: lids crack, seal leaks, containers feel heavy. ASIN B: price $24.99, rating 4.5, reviews 2600, ACOS 24%, CVR 12.4%, FBA stock 190, 7-day sales 31/day. Competitors: top 3 price $22.99-$34.99, ratings 4.4-4.7, reviews 3k-18k."
    }
  },
  {
    title: "生成一个 Amazon US Listing",
    workflowId: "full_listing",
    payload: {
      category: "baby stroller accessories",
      product: "Universal Stroller Cup Holder with Phone Slot",
      specs: "ABS plastic, adjustable clamp for 0.6-1.8 inch bars, 360-degree rotation, fits most cups under 3.4 inches, black.",
      differentiators: "Stronger clamp, wider phone slot for large phones, anti-slip silicone pads, one-hand installation, clear English picture guide.",
      audience: "busy parents who need hands-free convenience during walks and travel",
      competitors: "stroller cup holder, stroller organizer, baby stroller accessories, B0XXXX1111, B0XXXX2222"
    }
  },
  {
    title: "诊断一份 PPC 报表",
    workflowId: "ads_report",
    payload: {
      dateRange: "最近14天",
      targetAcos: "28%",
      report: "Campaign A: Spend $220, Sales $510, ACOS 43%, CTR 0.42%, CVR 7.2%. Search term stroller cup holder: spend $80, orders 1, sales $19.99. stroller organizer: spend $60, orders 6, sales $119.94. baby stroller accessories: spend $35, orders 0. phone holder for stroller: spend $18, orders 3."
    }
  }
];

module.exports = { modules, workflows, quickStarts };
