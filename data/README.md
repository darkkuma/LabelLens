# Verified Product Database

`products.js` is the browser-ready verified product database used by LabelLens.

## Coverage

- 51 products
- 15 consumer categories
- 135 additional popular-product records with partial label data
- 2,125 additional MFDS nutrition records
- 2,311 locally searchable records in total
- Kurly label records with Coupang and Emart availability signals
- Observed on 2026-07-19

## Selection

- Every product has a label image, ingredient text, origin entries, serving basis, report number,
  and calories, sodium, sugar, saturated fat, and protein values.
- Products without complete label analysis remain in the partial catalog and receive provisional scores.
- Review text and user identities are not stored.

## Collection

Kurly public search results are collected across 18 packaged-food categories. Product-detail label
images are read locally with Apple Vision OCR. OCR output is retained for audit, then values are
admitted to `products.js` only after the ingredient and nutrition fields are verified against the
label image. Scores and category rankings normalize label values to 100g while preserving the
original serving basis for display.

The expansion pipeline collects 18 popular-product searches, extracts label text, joins nutrition
records by MFDS report number, rejects incomplete or multi-SKU records, and promotes only complete
records. Chicken nuggets are included as a dedicated ranking category.

`catalog.js` retains the remaining popular products and MFDS records even when some label fields are
missing. Partial products receive a provisional score from the available nutrition, additive,
origin, and processing dimensions. Scores with lower data coverage are pulled toward 50 so sparse
records can be ranked without outranking fuller records on a single favorable field.

## MFDS Brand Inventory

`mfds-brand-products.csv` contains 2,132 commercial processed-food records returned by searches for
13 major brand terms. It includes the product name, manufacturer, categories, nutrition values,
report number, and update date. It is a keyword inventory rather than the complete MFDS processed-
food catalog: products whose names omit the searched brand, such as `신라면`, require a separate
product-name search because the API does not apply the requested manufacturer or DB-group filters.

Regenerate it with `node scripts/export-mfds-products.mjs` after configuring the public-data API key
in `.env.local`.
