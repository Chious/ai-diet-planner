# 檢查 SQLite 資料庫的腳本
# 使用方式: Rscript inspect_db.R

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

library(RSQLite)
library(dplyr)

# 連接到資料庫
db_path <- "Food-Composition-Database.db"
con <- dbConnect(SQLite(), db_path)

cat("=== 資料庫基本資訊 ===\n\n")

# 1. 查看所有表格
tables <- dbListTables(con)
cat("資料庫中的表格:\n")
print(tables)
cat("\n")

# 2. 查看 foods 表格的結構
cat("=== foods 表格結構 ===\n")
schema <- dbGetQuery(con, "PRAGMA table_info(foods)")
print(schema)
cat("\n")

# 3. 統計資訊
cat("=== 資料統計 ===\n")
total_count <- dbGetQuery(con, "SELECT COUNT(*) as total FROM foods")
cat("總筆數:", total_count$total, "\n\n")

# 4. 各欄位的統計資訊
cat("=== 數值欄位統計 ===\n")
stats <- dbGetQuery(con, "
  SELECT 
    COUNT(*) as count,
    AVG(calories) as avg_calories,
    MIN(calories) as min_calories,
    MAX(calories) as max_calories,
    AVG(protein) as avg_protein,
    AVG(fats) as avg_fats,
    AVG(carbs) as avg_carbs,
    AVG(sodium) as avg_sodium
  FROM foods
")
print(stats)
cat("\n")

# 5. 查看前 10 筆資料
cat("=== 前 10 筆資料 ===\n")
sample <- dbGetQuery(con, "
  SELECT id, name, calories, protein, fats, carbs, sodium, fiber, sugar 
  FROM foods 
  LIMIT 10
")
print(sample)
cat("\n")

# 6. 查看有完整營養資訊的食物（所有主要欄位都有值）
cat("=== 完整營養資訊的食物數量 ===\n")
complete <- dbGetQuery(con, "
  SELECT COUNT(*) as count
  FROM foods
  WHERE calories > 0 
    AND protein IS NOT NULL 
    AND fats IS NOT NULL 
    AND carbs IS NOT NULL
")
cat("有完整營養資訊的食物:", complete$count, "\n\n")

# 7. 查看來源統計
cat("=== 資料來源統計 ===\n")
source_stats <- dbGetQuery(con, "
  SELECT source, COUNT(*) as count
  FROM foods
  GROUP BY source
")
print(source_stats)
cat("\n")

# 8. 搜尋範例：高蛋白食物
cat("=== 高蛋白食物 (protein > 20g) ===\n")
high_protein <- dbGetQuery(con, "
  SELECT id, name, calories, protein, fats, carbs
  FROM foods
  WHERE protein > 20
  ORDER BY protein DESC
  LIMIT 10
")
print(high_protein)
cat("\n")

# 9. 搜尋範例：低卡路里食物
cat("=== 低卡路里食物 (calories < 50) ===\n")
low_cal <- dbGetQuery(con, "
  SELECT id, name, calories, protein, fats, carbs
  FROM foods
  WHERE calories < 50
  ORDER BY calories ASC
  LIMIT 10
")
print(low_cal)
cat("\n")

# 10. 搜尋範例：依名稱搜尋
cat("=== 搜尋包含「米」的食物 ===\n")
rice_foods <- dbGetQuery(con, "
  SELECT id, name, calories, protein, fats, carbs
  FROM foods
  WHERE name LIKE '%米%'
  LIMIT 10
")
print(rice_foods)
cat("\n")

# 關閉連線
dbDisconnect(con)

cat("=== 檢查完成 ===\n")
