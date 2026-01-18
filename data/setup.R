# 安裝 R 套件到本地函式庫
# 使用方式: Rscript setup.R

cat("=== 開始安裝 R 套件 ===\n\n")

# 設定本地函式庫路徑
# 如果從 data 目錄執行，需要回到項目根目錄
current_dir <- normalizePath(getwd())
if (basename(current_dir) == "data") {
  # 從 data 目錄執行，回到項目根目錄
  project_root <- dirname(current_dir)
} else {
  # 從其他目錄執行，假設當前目錄就是項目根目錄
  project_root <- current_dir
}
lib_path <- file.path(project_root, ".R_library")
cat("項目根目錄:", project_root, "\n")
cat("函式庫路徑:", lib_path, "\n\n")

# 如果目錄不存在，則建立
if (!dir.exists(lib_path)) {
  dir.create(lib_path, recursive = TRUE)
  cat("已建立本地函式庫目錄:", lib_path, "\n\n")
}

# 將本地函式庫加入路徑
.libPaths(c(lib_path, .libPaths()))

# 需要安裝的套件列表
required_packages <- c(
  "tidyverse",
  "RSQLite",
  "readr",
  "readxl"
)

cat("需要安裝的套件:\n")
cat(paste(required_packages, collapse = ", "), "\n\n")

# 檢查並安裝套件
for (pkg in required_packages) {
  if (!require(pkg, character.only = TRUE, quietly = TRUE)) {
    cat("正在安裝套件:", pkg, "...\n")
    tryCatch({
      install.packages(
        pkg,
        repos = "https://cran.rstudio.com/",
        lib = lib_path,
        dependencies = TRUE
      )
      cat("✓", pkg, "安裝成功\n")
    }, error = function(e) {
      cat("✗", pkg, "安裝失敗:", conditionMessage(e), "\n")
      # 如果是 readxl，嘗試從源碼安裝
      if (pkg == "readxl") {
        cat("嘗試從源碼安裝 readxl...\n")
        tryCatch({
          install.packages(
            pkg,
            repos = "https://cran.rstudio.com/",
            lib = lib_path,
            type = "source"
          )
          cat("✓", pkg, "從源碼安裝成功\n")
        }, error = function(e2) {
          cat("✗", pkg, "從源碼安裝也失敗\n")
        })
      }
    })
  } else {
    cat("✓", pkg, "已安裝\n")
  }
}

cat("\n=== 安裝完成 ===\n")
cat("本地函式庫位置:", lib_path, "\n")
