#!/bin/sh
# post-commit hook to write the project name and the commit msg to weekhelp.md

# 系统类型：linux, macos, windows, unknown
declare SYS_TYPE

# weekhelp 的目录
# 需要填充为：context.globalStorageUri.fsPath
WEEKHELP_FOLDER_PATH=""

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    SYS_TYPE="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    SYS_TYPE="macos"
elif [[ "$OSTYPE" == "cygwin" ]]; then
    SYS_TYPE="windows"
elif [[ "$OSTYPE" == "msys" ]]; then
    SYS_TYPE="windows"
else
    SYS_TYPE="unknown"
fi

# 获取年份：YYYY
year=$(date +%Y)

# 获取当前是第几周
# +%W 周一作为一周的开始
# 格式如：01
week=$(date +%W)

# 当前周的日志文件
filepath="$WEEKHELP_FOLDER_PATH/$year-$week.md"
# echo "$filepath"

# 获取文件夹路径
dirpath=$(dirname "$filepath")

# 检查文件夹是否存在，如果不存在则创建
if [ ! -d "$dirpath" ]; then
    mkdir -p "$dirpath"
fi

# Check if the file exists, if not, create it
if [ ! -f "$filepath" ]; then
    echo "File not found, creating $filepath"
    touch "$filepath"
fi

# Get the commit message
commit_msg=$(git log -1 HEAD --pretty=format:%B)

# Get the project name
project_name=$(basename $(git rev-parse --show-toplevel))

# mac: awk 'FNR>2 && $1="" {print FNR; exit}' 20.md
# linux: awk 'FNR>2 && $1 == "" {print FNR; exit}' 01.md
# 输出空行的行号或者如果不存在空行则输出下一行的行号。
function find_blank_line {
    local file=$1
    local start_line=$2

    # echo "find_blank_line: $file $start_line $SYS_TYPE"

    if [[ "$SYS_TYPE" == "macos" ]]; then
        # 在这里添加适用于 macos 的命令：
        awk -v startLine="$start_line" '{if (FNR > startLine && $1 == "") {print FNR; found=1; exit}} END{if (!found) print FNR+1}' "$file"
    else
        awk -v start_line="$start_line" '{if(FNR>start_line && $1=="") {print FNR; found=1; exit}} END{if(!found) print FNR+1}' "$file"
    fi
}

function insert_before_blank_line { 
    local filepath=$1
    local blank_line_number=$2
    local text=$3

    # 在空白行前插入新的内容
    # 如果text中包含/等特殊字符，如何额外处理，避免sed命令出错。
    text_quoted=$(printf '%q' "- $text")
    echo "$text_quoted"
    echo "$filepath" 
    echo "$blank_line_number" 
    echo "$((blank_line_number-1))"

    if [[ "$SYS_TYPE" == "macos" ]]; then
        # 第二行的内容会原样插入文件中，前面不可以有空格
        sed -i '' -e "$((blank_line_number-1))a\\
${text_quoted}" "$filepath"
        
    else
        sed -i "$((blank_line_number-1))a\\$text_quoted" "$filepath"
    fi

}

if grep -q "## $project_name" "$filepath"; then
    # echo "字符串 '## $project_name' 存在于文件"
    # echo "$project_name 已存在提交记录"

    # echo "查找：## $project_name 在文件 $filepath"
    # 项目名的行号
    title_line_number=$(grep -n -m 1 -w -F "## $project_name" "$filepath" | cut -d ":" -f 1)
    echo "title_line_number: $title_line_number"

    # 找到第一个空白行
    blank_line_number=$(find_blank_line "$filepath" "$((title_line_number+1))")
    echo "blank_line_number: $blank_line_number"

    # 在空白行后插入新的内容
    # sed -i "${blank_line_number}a\## $project_name" "$filepath"
    insert_before_blank_line "$filepath" "$blank_line_number" "$commit_msg"

    echo "提交信息保存到文件：$filepath"
else
    # echo "$project_name 不存在提交记录"

     # 插入空白行
    echo "" >>$filepath

    # 第一个项目的标题
    echo "## ${project_name}" >>$filepath

    # 插入空白行
    echo "" >>$filepath

    # 第一个项目的第一个commit
    echo "- ${commit_msg}" >>$filepath

    # 插入空白行
    # echo "" >>$filepath

    echo "提交信息保存到文件：$filepath"
fi

