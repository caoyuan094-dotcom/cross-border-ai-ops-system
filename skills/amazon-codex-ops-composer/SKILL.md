---
name: amazon-codex-ops-composer
description: Amazon Codex+Skills workflow composer for seller operators. Use when the user asks for "亚马逊 Codex skills", "23 个组合", LinkFox-style Amazon AI workflows, Amazon seller skill routing, or wants to turn a broad Amazon business goal into the right sequence of Codex skills for product research, listing, images, PPC, compliance, sourcing, inventory, launch, and weekly operations.
---

# Amazon Codex Ops Composer

Compose Amazon seller workflows from the installed Amazon skills. Use this as the front door when the user has a business goal rather than a single narrow task.

This skill was created from a Douyin video prompt: `跨境法老懂AI`, video `7655272499026011520`, title `分享一下亚马逊codex+skills的23个神奇组合！`. The accessible video metadata verifies the topic, author, date, duration, and visible workflow themes, but not every item as an exact author transcript. Treat the list below as an operational Codex implementation of that idea.

## Operating Rules

1. Route to existing Amazon skills whenever possible. Do not duplicate their full instructions.
2. Ask at most one clarifying question. If the closest workflow is obvious, proceed with assumptions and label them.
3. Separate Codex-doable work from user-only work such as Seller Central login, trademark filings, invoices, payments, account registration, verification codes, physical samples, final listing submission, and final ad spend approval.
4. Use current web or official sources when marketplace rules, fees, policies, or live competitor facts matter.
5. Do not suggest review manipulation, fake documents, platform evasion, hidden claims, keyword stuffing with competitor brands, or compliance bypasses.

## Installed Skill Map

- `$amazon-product-research`: product ideas, niche validation, go/no-go decisions.
- `$amazon-asin-competitor-analysis`: ASIN teardown, competitor comparison, market gaps.
- `$amazon-review-miner`: reviews, Q&A, returns, buyer language, defect themes.
- `$amazon-keyword-strategy`: keyword maps for SEO, ads, backend search terms.
- `$amazon-listing-builder`: titles, bullets, descriptions, A+ copy, backend terms.
- `$amazon-image-brief`: main image, secondary image stack, A+ modules, AI image prompts.
- `$amazon-ppc-optimizer`: Sponsored Products, bids, budgets, search terms, negatives.
- `$amazon-profit-calculator`: FBA/FBM economics, margin, ROI, break-even ACOS.
- `$amazon-sourcing-supplier-brief`: RFQ, sample specs, supplier questions, QC checklist.
- `$amazon-compliance-check`: claims, restricted products, certifications, safety docs.
- `$amazon-inventory-forecast`: FBA restock, stockout, sell-through, excess inventory.
- `$amazon-launch-plan`: launch timeline and first 90 days.
- `$amazon-brand-analytics`: Brand Analytics, SQP, Search Catalog Performance.
- `$amazon-experiment-planner`: A/B tests and conversion experiments.
- `$amazon-account-health-appeal`: policy warnings, suppression, suspension, POA.
- `$amazon-localization`: US/UK/EU/JP marketplace localization.
- `$amazon-ops-weekly-report`: weekly seller dashboard and priority actions.
- `$amazon-seller-router`: narrow routing when this composer is more than needed.

## The 23 Codex+Skills Combinations

Use these combinations as reusable operating plays. Pick one or chain several based on the user's goal.

1. **One-product research report**: `$amazon-product-research` -> `$amazon-profit-calculator` -> `$amazon-compliance-check`.
2. **Market research pack**: `$amazon-product-research` -> `$amazon-asin-competitor-analysis` -> `$amazon-keyword-strategy`.
3. **VOCI/voice-of-customer analysis**: `$amazon-review-miner` -> `$amazon-asin-competitor-analysis` -> `$amazon-image-brief`.
4. **Competitor extraction**: `$amazon-asin-competitor-analysis` -> `$amazon-review-miner` -> `$amazon-sourcing-supplier-brief`.
5. **Same-category differentiation**: `$amazon-asin-competitor-analysis` -> `$amazon-keyword-strategy` -> `$amazon-listing-builder`.
6. **New listing writing**: `$amazon-keyword-strategy` -> `$amazon-listing-builder` -> `$amazon-compliance-check`.
7. **Listing rewrite/optimization**: `$amazon-asin-competitor-analysis` -> `$amazon-review-miner` -> `$amazon-listing-builder`.
8. **AI image pack**: `$amazon-image-brief` -> image generation/editing workflow -> `$amazon-compliance-check` for claim safety.
9. **Main image conversion test**: `$amazon-image-brief` -> `$amazon-experiment-planner`.
10. **A+ content pack**: `$amazon-review-miner` -> `$amazon-image-brief` -> `$amazon-listing-builder`.
11. **PPC launch setup**: `$amazon-keyword-strategy` -> `$amazon-ppc-optimizer` -> `$amazon-launch-plan`.
12. **PPC search-term cleanup**: `$amazon-ppc-optimizer` -> `$amazon-keyword-strategy`.
13. **SEO and ads alignment**: `$amazon-keyword-strategy` -> `$amazon-listing-builder` -> `$amazon-ppc-optimizer`.
14. **Profit and price guardrail**: `$amazon-profit-calculator` -> `$amazon-ppc-optimizer` -> `$amazon-inventory-forecast`.
15. **Supplier RFQ from market gaps**: `$amazon-review-miner` -> `$amazon-sourcing-supplier-brief` -> `$amazon-compliance-check`.
16. **Sample evaluation checklist**: `$amazon-sourcing-supplier-brief` -> `$amazon-compliance-check` -> `$amazon-image-brief`.
17. **Compliance preflight before launch**: `$amazon-compliance-check` -> `$amazon-listing-builder` -> `$amazon-launch-plan`.
18. **First 90-day launch operating plan**: `$amazon-launch-plan` -> `$amazon-ppc-optimizer` -> `$amazon-inventory-forecast` -> `$amazon-ops-weekly-report`.
19. **Inventory and ad pacing**: `$amazon-inventory-forecast` -> `$amazon-ppc-optimizer`.
20. **Brand Analytics diagnosis**: `$amazon-brand-analytics` -> `$amazon-keyword-strategy` -> `$amazon-experiment-planner`.
21. **Weekly operations review**: `$amazon-ops-weekly-report` -> route urgent issues to PPC, inventory, listing, account health, or compliance skills.
22. **Account-health rescue**: `$amazon-account-health-appeal` -> `$amazon-compliance-check` -> `$amazon-listing-builder` for corrected content.
23. **Marketplace expansion/localization**: `$amazon-localization` -> `$amazon-keyword-strategy` -> `$amazon-compliance-check` -> `$amazon-profit-calculator`.

## Output Contract

When invoked, return:

- Selected combination number and name.
- Why this path fits the user's goal.
- Needed inputs, split into required now and useful later.
- Codex-doable steps versus user-only steps.
- The first concrete deliverable, such as a research table, listing draft, RFQ, PPC change log, launch checklist, or weekly action board.

If the user gives a product/category/ASIN directly, start the first deliverable immediately instead of only explaining the route.
