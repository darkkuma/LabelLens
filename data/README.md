# Verified Product Database

`products.js` is the browser-ready verified product database used by LabelLens.

## Coverage

- 36 products
- 14 consumer categories
- Kurly label records with Coupang and Emart availability signals
- Observed on 2026-07-19

## Selection

- Every product has a label image, ingredient text, origin entries, serving basis, report number,
  and calories, sodium, sugar, saturated fat, and protein values.
- Product names without complete label analysis are excluded.
- Prices, review text, user identities, and review counts are not stored.

## Collection

Kurly public search results are collected across 17 packaged-food categories. Product-detail label
images are read locally with Apple Vision OCR. OCR output is retained for audit, then values are
admitted to `products.js` only after the ingredient and nutrition fields are verified against the
label image. Scores and category rankings normalize label values to 100g while preserving the
original serving basis for display.
