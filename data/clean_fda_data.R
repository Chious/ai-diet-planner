# 檢查並設置本地 R 函式庫
if (!dir.exists("../.R_library")) {
  cat("本地 R 函式庫不存在，正在執行 setup.R 安裝套件...\n")
  source("setup.R")
  # setup.R 執行後會設置 .libPaths，但為了確保，再次設置
  .libPaths(c("../.R_library", .libPaths()))
} else {
  # 使用本地 R 函式庫（如果存在）
  .libPaths(c("../.R_library", .libPaths()))
}

library(tidyverse)
library(RSQLite)
library(readr)
library(readxl)

# ==============================================================================
# 1. 設定與讀取資料 (Configuration & Load)
# ==============================================================================

# 設定輸入檔案名稱 (請確認檔案在工作目錄中)
# 資料來源：食品營養成分資料庫2024UPDATE2EXCEL
input_file <- "Food-Composition-Database.xlsx"
output_db <- "Food-Composition-Database.db"

# 讀取 Excel 檔案
# 注意：台灣 FDA 的 Excel 第一列是分類大標，標題在第二列。
# 因此需要 skip = 1
raw_data <- read_excel(input_file, 
                       col_names = TRUE, 
                       skip = 1) # 跳過第一行的描述性標題

cat("原始資料讀取完成，共", nrow(raw_data), "筆資料。\n")

# ==============================================================================
# 2. 資料清洗與轉換 (Data Cleaning & Transformation)
# ==============================================================================

# 定義要保留並改名的欄位
# 使用欄位位置來避免編碼問題
# 基本營養素: 1=整合編號, 3=樣品名稱, 7=熱量, 10=粗蛋白, 11=粗脂肪, 14=總碳水化合物, 15=膳食纖維, 16=糖質總量, 23=鈉
# 礦物質: 24=鉀, 25=鈣, 26=鎂, 27=鐵, 28=鋅, 29=磷, 30=銅, 31=錳
# 維生素: 32=維生素A(IU), 33=視網醇當量(RE)(ug), 37=維生素D(IU), 41=維生素E(mg), 47=維生素K1(ug)
#        50=維生素B1(mg), 51=維生素B2(mg), 52=菸鹼素(mg), 53=維生素B6(mg), 54=維生素B12(ug), 55=葉酸(ug), 56=維生素C(mg)
clean_data <- raw_data %>%
  select(
    # 基本資訊
    id = 1,           # 整合編號 (ID)
    name = 3,         # 樣品名稱 (Name)
    # 基本營養素
    calories = 7,     # 熱量(kcal) (Calories)
    protein = 10,     # 粗蛋白(g) (Protein)
    fats = 11,        # 粗脂肪(g) (Fats)
    carbs = 14,       # 總碳水化合物(g) (Carbs)
    fiber = 15,       # 膳食纖維(g) (Fiber)
    sugar = 16,       # 糖質總量(g) (Sugar)
    # 礦物質
    sodium = 23,      # 鈉(mg) (Sodium)
    potassium = 24,   # 鉀(mg) (Potassium)
    calcium = 25,     # 鈣(mg) (Calcium)
    magnesium = 26,   # 鎂(mg) (Magnesium)
    iron = 27,        # 鐵(mg) (Iron)
    zinc = 28,        # 鋅(mg) (Zinc)
    phosphorus = 29,  # 磷(mg) (Phosphorus)
    copper = 30,      # 銅(mg) (Copper)
    manganese = 31,   # 錳(mg) (Manganese)
    # 維生素
    vitamin_a_iu = 32,      # 維生素A總量 (IU)
    vitamin_a_re = 33,       # 視網醇當量 (RE)(ug)
    vitamin_d_iu = 37,       # 維生素D總量 (IU)
    vitamin_e = 41,          # 維生素E總量 (mg)
    vitamin_k1 = 47,         # 維生素K1 (ug)
    vitamin_b1 = 50,         # 維生素B1 (mg)
    vitamin_b2 = 51,         # 維生素B2 (mg)
    niacin = 52,             # 菸鹼素 (mg)
    vitamin_b6 = 53,         # 維生素B6 (mg)
    vitamin_b12 = 54,        # 維生素B12 (ug)
    folate = 55,             # 葉酸 (ug)
    vitamin_c = 56           # 維生素C (mg)
  ) %>%
  # 過濾掉沒有名稱或 ID 的無效列
  filter(!is.na(id) & !is.na(name)) %>%
  # 增加固定欄位
  mutate(
    source = "tw_fda",      # 標記來源，區隔 OpenFoodFacts
    brand = NA_character_,  # 原型食物通常無品牌
    barcode = NA_character_,# 用 ID 搜尋，無條碼
    serving_size = 100,     # FDA 資料基準為 100g
    serving_unit = "g",
    base_weight_g = 100     # 基準重量（公克），所有營養數值均以此為基準，便於後續轉換
  )

# 數值清洗函數：處理 FDA 資料中的特殊符號
clean_numeric <- function(x) {
  x <- as.character(x)
  # 將 "-", "N/A", "*" (微量) 替換為 0
  x[x %in% c("-", "N/A", "NA", "*", "trace")] <- "0"
  # 移除非數字字符 (保留小數點)
  x <- gsub("[^0-9.]", "", x)
  as.numeric(x)
}

# 應用數值清洗到所有營養素欄位
# 定義所有需要清洗的數值欄位
numeric_cols <- c(
  # 基本營養素
  "calories", "protein", "fats", "carbs", "fiber", "sugar",
  # 礦物質
  "sodium", "potassium", "calcium", "magnesium", "iron", "zinc", 
  "phosphorus", "copper", "manganese",
  # 維生素
  "vitamin_a_iu", "vitamin_a_re", "vitamin_d_iu", "vitamin_e", "vitamin_k1",
  "vitamin_b1", "vitamin_b2", "niacin", "vitamin_b6", "vitamin_b12", 
  "folate", "vitamin_c"
)

final_foods <- clean_data %>%
  mutate(across(all_of(numeric_cols), clean_numeric)) %>%
  # 再次檢查轉換後是否有 NA，若有則補 0
  mutate(across(all_of(numeric_cols), ~replace_na(., 0)))

cat("資料清洗完成，準備寫入資料庫...\n")

# ==============================================================================
# 3. 寫入 SQLite (SQLite Ready)
# ==============================================================================

# 建立 SQLite 連線
con <- dbConnect(SQLite(), output_db)

# 定義 foods 表格 Schema (包含維生素和礦物質)
# 使用 SQL 語句確保欄位型態正確
create_table_sql <- "
CREATE TABLE IF NOT EXISTS foods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  barcode TEXT,
  source TEXT CHECK(source IN ('off', 'tw_fda', 'custom')) NOT NULL,
  serving_size REAL DEFAULT 100,
  serving_unit TEXT DEFAULT 'g',
  base_weight_g REAL DEFAULT 100,
  -- 基本營養素
  calories REAL,
  protein REAL,
  carbs REAL,
  fats REAL,
  fiber REAL,
  sugar REAL,
  -- 礦物質
  sodium REAL,
  potassium REAL,
  calcium REAL,
  magnesium REAL,
  iron REAL,
  zinc REAL,
  phosphorus REAL,
  copper REAL,
  manganese REAL,
  -- 維生素
  vitamin_a_iu REAL,
  vitamin_a_re REAL,
  vitamin_d_iu REAL,
  vitamin_e REAL,
  vitamin_k1 REAL,
  vitamin_b1 REAL,
  vitamin_b2 REAL,
  niacin REAL,
  vitamin_b6 REAL,
  vitamin_b12 REAL,
  folate REAL,
  vitamin_c REAL
  -- search_vector 欄位通常在 App 端或透過 FTS5 虛擬表處理，這裡先存基礎資料
);
"

# 執行建表
dbExecute(con, "DROP TABLE IF EXISTS foods") # 重跑時清除舊表 (開發用)
dbExecute(con, create_table_sql)

# 寫入資料
dbWriteTable(con, "foods", final_foods, append = TRUE, row.names = FALSE)

# 驗證寫入
count <- dbGetQuery(con, "SELECT count(*) as count FROM foods")
sample <- dbGetQuery(con, "
  SELECT id, name, calories, protein, 
         calcium, iron, vitamin_c, vitamin_a_re 
  FROM foods 
  LIMIT 5
")

print(paste("成功寫入", count$count, "筆食材資料至", output_db))
print("預覽前 5 筆資料（包含維生素和礦物質）：")
print(sample)

# 統計有維生素資料的食物數量
vitamin_stats <- dbGetQuery(con, "
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN vitamin_c > 0 THEN 1 ELSE 0 END) as has_vitamin_c,
    SUM(CASE WHEN vitamin_a_re > 0 THEN 1 ELSE 0 END) as has_vitamin_a,
    SUM(CASE WHEN vitamin_d_iu > 0 THEN 1 ELSE 0 END) as has_vitamin_d,
    SUM(CASE WHEN calcium > 0 THEN 1 ELSE 0 END) as has_calcium,
    SUM(CASE WHEN iron > 0 THEN 1 ELSE 0 END) as has_iron
  FROM foods
")
print("\n維生素和礦物質資料覆蓋率：")
print(vitamin_stats)

# 關閉連線
dbDisconnect(con)