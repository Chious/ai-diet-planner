# 如何檢查 SQLite 資料庫

為了貼近台灣使用者的飲食習慣，資料來源來自於『食品營養成分資料庫』，並且已經轉換為 SQLite 資料庫，供後續 Drizzle 查詢，本文件介紹如何透過 R 語言檢查資料庫的內容。

## 方法 1: 使用 R 腳本（推薦）

執行完整的檢查腳本：

```bash
cd data
Rscript inspect_db.R
```

這個腳本會顯示：
- 資料庫結構
- 統計資訊
- 範例資料
- 各種查詢範例

## 方法 2: 使用 sqlite3 命令列工具

### 基本命令

```bash
cd data

# 查看所有表格
sqlite3 diet_planner.db ".tables"

# 查看表格結構
sqlite3 diet_planner.db ".schema foods"

# 查看總筆數
sqlite3 diet_planner.db "SELECT COUNT(*) FROM foods;"

# 查看前 5 筆資料（格式化輸出）
sqlite3 diet_planner.db -header -column "SELECT * FROM foods LIMIT 5;"
```

### 常用查詢範例

```bash
# 查看所有欄位名稱
sqlite3 diet_planner.db "PRAGMA table_info(foods);"

# 統計資訊
sqlite3 diet_planner.db -header -column "
  SELECT 
    COUNT(*) as total,
    AVG(calories) as avg_calories,
    AVG(protein) as avg_protein,
    AVG(fats) as avg_fats,
    AVG(carbs) as avg_carbs
  FROM foods;
"

# 搜尋特定食物
sqlite3 diet_planner.db -header -column "
  SELECT id, name, calories, protein, fats, carbs
  FROM foods
  WHERE name LIKE '%米%'
  LIMIT 10;
"

# 高蛋白食物
sqlite3 diet_planner.db -header -column "
  SELECT id, name, calories, protein
  FROM foods
  WHERE protein > 20
  ORDER BY protein DESC
  LIMIT 10;
"

# 低卡路里食物
sqlite3 diet_planner.db -header -column "
  SELECT id, name, calories, protein, fats, carbs
  FROM foods
  WHERE calories < 50
  ORDER BY calories ASC
  LIMIT 10;
"
```

### 互動式模式

```bash
sqlite3 diet_planner.db
```

進入互動式模式後，可以使用 SQL 查詢：

```sql
-- 查看表格
.tables

-- 查看結構
.schema foods

-- 執行查詢
SELECT * FROM foods LIMIT 5;

-- 退出
.quit
```

## 方法 3: 使用 R 互動式查詢

在 R 中：

```r
library(RSQLite)
library(dplyr)

# 連接資料庫
con <- dbConnect(SQLite(), "data/diet_planner.db")

# 查看表格結構
dbGetQuery(con, "PRAGMA table_info(foods)")

# 查詢資料
dbGetQuery(con, "SELECT * FROM foods LIMIT 10")

# 使用 dplyr 查詢（如果資料不大）
foods <- tbl(con, "foods")
foods %>%
  filter(protein > 20) %>%
  select(id, name, calories, protein) %>%
  collect()

# 關閉連線
dbDisconnect(con)
```

## 方法 4: 使用圖形化工具

### DB Browser for SQLite (推薦)

1. 下載安裝：https://sqlitebrowser.org/
2. 開啟 `data/diet_planner.db`
3. 使用圖形介面瀏覽和查詢資料

### VS Code 擴充功能

- **SQLite Viewer**: 在 VS Code 中直接查看 SQLite 資料庫
- **SQLite**: 提供 SQLite 查詢功能

## 資料庫結構

### foods 表格欄位

- `id` (TEXT, PRIMARY KEY): 食物 ID
- `name` (TEXT, NOT NULL): 食物名稱
- `brand` (TEXT): 品牌（通常為 NULL）
- `barcode` (TEXT): 條碼（通常為 NULL）
- `source` (TEXT): 資料來源（'tw_fda', 'off', 'custom'）
- `serving_size` (REAL): 每份大小（預設 100）
- `serving_unit` (TEXT): 單位（預設 'g'）
- `base_weight_g` (REAL): **基準重量（公克）**，所有營養數值均以此為基準（預設 100g），便於後續轉換
- `calories` (REAL): 熱量（kcal）
- `protein` (REAL): 蛋白質（g）
- `carbs` (REAL): 碳水化合物（g）
- `fats` (REAL): 脂肪（g）
- `sodium` (REAL): 鈉（mg）
- `fiber` (REAL): 膳食纖維（g）
- `sugar` (REAL): 糖（g）
- 礦物質欄位：`potassium`, `calcium`, `magnesium`, `iron`, `zinc`, `phosphorus`, `copper`, `manganese`
- 維生素欄位：`vitamin_a_iu`, `vitamin_a_re`, `vitamin_d_iu`, `vitamin_e`, `vitamin_k1`, `vitamin_b1`, `vitamin_b2`, `niacin`, `vitamin_b6`, `vitamin_b12`, `folate`, `vitamin_c`

## 營養數值轉換

### 使用 base_weight_g 進行轉換

所有營養數值均以 `base_weight_g`（預設 100g）為基準。要轉換為其他重量時，使用以下公式：

```
新數值 = 原數值 × (目標重量 / base_weight_g)
```

**SQL 查詢範例：**

```sql
-- 將營養數值從 100g 轉換為 150g
SELECT 
  id, 
  name, 
  base_weight_g,
  calories as calories_per_100g,
  ROUND(calories * 150 / base_weight_g, 2) as calories_per_150g,
  protein as protein_per_100g,
  ROUND(protein * 150 / base_weight_g, 2) as protein_per_150g
FROM foods 
WHERE id = 'A0200101';
```

**R 轉換範例：**

```r
# 查看轉換範例腳本
Rscript example_conversion.R
```

## 快速檢查清單

- [ ] 總筆數是否正確（應該約 2180 筆）
- [ ] 主要營養素欄位是否有值
- [ ] 資料來源是否正確標記為 'tw_fda'
- [ ] 食物名稱是否正確顯示（中文）
- [ ] 數值欄位是否在合理範圍內
- [ ] `base_weight_g` 欄位是否正確設置為 100
