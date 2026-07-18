# LabelLens

LabelLens is a Korea-first packaged food intelligence prototype for OpenAI Build Week.

It helps consumers decode Korean packaged food labels by combining product search,
category-relative scoring, additive explanations, origin transparency, and label text parsing.

## Demo Flow

1. Search `비비고 사찰만두`.
2. Open the matched product profile.
3. Review the holistic score and category rank.
4. Inspect additive explanations and health context.
5. Review domestic/imported/China-origin/unknown origin signals.
6. Compare against other frozen dumplings.
7. Paste a Korean label to see fallback parsing.

## Scoring Model

The 100-point holistic score is explainable:

- Nutrition Balance: 30 points
- Additive Load: 20 points
- Origin Transparency: 20 points
- Processing Level: 15 points
- Personal Fit: 15 points

Scores are category-relative so dumplings are compared with dumplings, ramen with ramen, and meal kits with meal kits.

## Public API Plan

The MVP uses seed data so it can run with no credentials. The connector layer is intended for:

- MFDS Food Nutrition Component DB
- Foodsafety Korea `C002` food/additive manufacturing ingredient reports
- MFDS imported food product DB
- MFDS imported food ingredient DB
- WHO/JECFA, EFSA, FDA, and Korean MFDS references for additive evidence summaries

## How Codex Was Used

Codex helped shape the product concept, research contest requirements, identify public data sources,
design the scoring model, build the static web prototype, create realistic seed data, and draft the
submission/admin checklist. The first version was intentionally built without external runtime
dependencies so judges can test it even before public API credentials are connected.

## Contest Requirements Coverage

- Working project: static web app that runs in a browser.
- Track fit: Apps for Your Life.
- Codex usage: concepting, architecture, implementation, seed data, scoring logic, README, checklist.
- Demoable flow: search, product detail, score explanation, additive explanation, origin transparency, category ranking, label paste parser.
- Testing access: open `index.html` or serve the folder statically.
- Repository readiness: this folder contains the runnable prototype, README, and API integration plan.

## Health Claim Policy

LabelLens avoids fear-based claims. It does not say an origin or additive is automatically unsafe.
It explains purpose, permitted-use context, evidence strength, and sensitive-group considerations.

## Running

Open `index.html` in a browser, or serve this folder with any static file server.
