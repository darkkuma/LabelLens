# Retail Catalog

`catalog.js` is the browser-ready product catalog used by LabelLens.

## Coverage

- 46 products
- 8 consumer categories
- Kurly, Coupang, and Emart retailer signals
- Observed on 2026-07-19

## Selection

- Kurly products use the public Market Kurly search result order for each category keyword.
- Coupang and Emart products use retailer-attributed public shopping results because their own
  search pages reject automated requests.
- A rank is the observed search position, not a claim about unit sales or market share.
- Prices, review text, user identities, and review counts are not stored.

## Analysis Status

Catalog presence and nutrition analysis are separate. A product without a verified label record
is shown without a score. Nutrition and ingredient fields should only be added after matching an
MFDS record, a C002 manufacturing report, or a photographed product label.
