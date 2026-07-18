# Public API Integration Plan

LabelLens can start with seed data and progressively hydrate products from Korean public sources.

## 1. Product and Nutrition Lookup

Source: 식품의약품안전처_식품영양성분DB정보

Target fields:

- Product name
- Food category
- Manufacturer
- Serving size
- Calories
- Carbohydrates
- Sugar
- Protein
- Fat
- Saturated fat
- Sodium
- Import status
- Origin
- Manufacturing report number where available

## 2. Ingredient List Lookup

Source: 식품안전나라 C002 식품(첨가물)품목제조보고(원재료)

Target fields:

- Manufacturer license number
- Manufacturer name
- Manufacturing report number
- Product name
- Product type
- Ingredient name
- Ingredient display order
- Change date

Primary query examples:

- `PRDLST_NM=비비고 사찰만두`
- `BSSH_NM=CJ`
- `RAWMTRL_NM=향미증진제`
- `PRDLST_DCNM=만두`

## 3. Imported Food and Origin Lookup

Sources:

- 식품의약품안전처_수입식품 제품DB 정보
- 식품의약품안전처_수입식품 원료정보

Target fields:

- Product name
- Product category
- Manufacturing country
- Ingredient name
- Alias / English name
- Use permission
- Use restrictions
- Conditions of use

## 4. Additive Evidence Layer

Sources:

- WHO/JECFA additive database
- EFSA food additive re-evaluation pages and opinions
- FDA Substances Added to Food / additive status
- Korean MFDS references where available

Target fields:

- Additive name
- Alternate names
- Functional class
- ADI/TDI where available
- Regulatory status
- Evidence summary
- Sensitive groups
- Last reviewed date
- Citation URL

## 5. Data Confidence

Every analysis should show its confidence level:

- Public DB match
- Uploaded/pasted label parse
- Seed demo data
- AI-inferred field
- Missing or unknown field
