# Weekhelp

这是一个 VSCode 插件，专为开发者设计，开源、离线、免费的周报助手。

它能够自动收集 git commit 的提交信息，按照项目进行分类，存储到以当前周命名的 Markdown 文件中。

如：2024-20.md

```md
---
date:
  - 2024.05.13 - 2024.05.19
---

## example_project_1

- 初始化项目
- 添加登录功能
- 修复登录功能中的错误
- 增加用户注册功能
- 优化用户界面设计

## example_project_2

- 修复了登录页面的布局问题
- 在用户管理页面增加了搜索功能
- 对购物车页面进行了性能优化
```

## 技能

1 个被动技能：当用户进行 git commit 时，它会自动收集提交信息，并按项目分类，存储到以当前周命名的 Markdown 文件中。

2 个主动技能：

- 命令：Open Weekhelp File 打开当前周的 Markdown 文件。
- 命令：Open Weekhelp Folder： 打开 weekhelp 文件夹，这是存储全部 Markdown 文件的位置。

## 常见问题

### 如何查看<周报>文件/文件夹?

1. 唤出命令面板

- windows 系统：在 vscode 中使用快捷键 `ctrl+shift+p` 唤出命令面板
- Mac 系统：在 vscode 中使用快捷键 `command+shift+p` 唤出命令面板

2. 输入 weekhelp 即可查看插件全部可用命令（目前只有两个）

**Enjoy! ☕️**
