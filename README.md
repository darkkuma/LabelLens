# 라벨렌즈 LabelLens

라벨렌즈는 한국 소비자를 위한 가공식품 인텔리전스 서비스입니다. 식약처 공공데이터와
근거 중심 해설을 결합해 영양, 첨가물, 원산지를 같은 종류의 제품끼리 비교합니다.

It helps consumers decode Korean packaged food labels by combining product search,
category-relative scoring, additive explanations, origin transparency, and label text parsing.

## Live Demo

Try LabelLens at [darkkuma.github.io/LabelLens](https://darkkuma.github.io/LabelLens/).

## 핵심 데모

1. `비비고 사찰만두`를 검색합니다.
2. 균형, 저나트륨, 원산지, 첨가물 중 개인 기준을 선택합니다.
3. 기준에 따라 달라지는 점수와 카테고리 순위를 확인합니다.
4. 각 첨가물의 기능, 건강 맥락, 근거 수준을 읽습니다.
5. 국산·중국산·수입산·미상 원산지 표시를 사실 정보로 확인합니다.
6. 포장지 원재료명과 영양정보를 붙여 넣어 직접 분석합니다.

## 점수 모델

100점 점수는 다섯 축의 계산 근거를 모두 공개합니다.

- 영양 균형 30점
- 첨가물 20점
- 원산지 투명성 20점
- 가공도 15점
- 개인 적합도 15점

만두는 만두끼리, 라면은 라면끼리 비교합니다. 개인 기준은 표시 점수와 카테고리 정렬에
함께 반영됩니다.

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

## 건강 정보 원칙

특정 원산지나 첨가물을 자동으로 유해하다고 판단하지 않습니다. 기능, 허용 맥락,
근거 수준과 민감군 주의사항을 설명하며 건강 진단이 아닌 선택 보조 정보를 제공합니다.

## Running

Open `index.html` in a browser, or serve this folder with any static file server.
