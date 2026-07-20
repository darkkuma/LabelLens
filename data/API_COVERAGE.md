# Public API Coverage Audit

Measured on 2026-07-20 against 46 popular-product signals collected from Kurly, Emart, and Coupang.
Pack counts and weights were removed before retrying product-name searches. A result was counted as
exact only when the normalized product name matched; loosely related search results were separated.

## Food Nutrition Database API

| Retailer | Sample | Exact | Similar | No match |
| --- | ---: | ---: | ---: | ---: |
| Kurly | 35 | 9 (26%) | 3 (9%) | 23 (66%) |
| Emart | 19 | 6 (32%) | 3 (16%) | 10 (53%) |
| Coupang | 17 | 4 (24%) | 4 (24%) | 9 (53%) |
| Unique products | 46 | 12 (26%) | 4 (9%) | 30 (65%) |

Retailer rows overlap because the same SKU can be sold by multiple retailers. Similar candidates are
not automatically imported. The API is strongest for standardized products such as tofu, rice,
ramen, and well-known frozen foods, and weakest for retailer-exclusive meal kits and recipe products.

## C002 Ingredient API

The C002 upstream returned no usable response during this audit, so its coverage cannot be measured.
This is recorded as unavailable, not as zero matching products. LabelLens uses retailer label images
as the primary ingredient source until C002 becomes responsive again.

## Database Admission

Retailer popularity is only a collection signal. A product is added to `products.js` only when its
label provides ingredient text, at least one origin, a report number, a serving basis, a source image,
and calories, sodium, sugar, saturated fat, and protein. Multi-SKU option pages are excluded.
