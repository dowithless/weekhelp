# Change Log

"weekhelp"扩展的所有重要更改都将记录在此文件中。

## [Unreleased]

### Added

- [ ] 允许用户设置 weekhelp 的文件夹位置

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [0.0.5] - 2024.05.18

### Changed

- 更新插件名称：Week Help -> Weekhelp
- 每次切换工作目录都会更新 `record` 脚本文件, 保持脚本是最新版本的状态
- 给命令添加了前缀：Weekhelp
- 文档属性部分的 date 范围：以周一作为一周的开始，周日为一周的结束。
  - 修改前 2024.20.md：2024.05.12 - 2024.05.18
  - 修改后 2024.20.md：2024.05.13 - 2024.05.19
- 更新 README

### Fixed

- 修复了：在 mac 中，周报文件路径存在空格，导致脚本运行失败

## [0.0.4]

- 对代码结构做了很大的改动，更易于维护了

### Added

- 添加了插件的 logo 图标

## [0.0.3]

- MacOS 可以用了

## [0.0.2]

### Fixed

- 修复了打包后找不到模版文件的问题

## [0.0.1]

- mvp: 自测在 windows 系统，使用 git bash 可正常工作。
- MacOS 暂不兼容
