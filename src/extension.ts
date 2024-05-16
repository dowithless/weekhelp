// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import advancedFormat from "dayjs/plugin/advancedFormat";

import { getCurrentWeekFileName } from "./lib/index";
import { registerOpenWeekhelpFileCommand } from "./command/open-weekhelp-file";
import { registerOpenWeekhelpFolderCommand } from "./command/open-weekhelp-folder";

dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);

const RECORD_COMMIT_MSG_SCRIPT_FILE_NAME = "record-commit-msg.weekhelp.sh";
const RECORD_COMMIT_MSG_SCRIPT_FILE_FULL_PATH = `.git/hooks/${RECORD_COMMIT_MSG_SCRIPT_FILE_NAME}`;
const POST_COMMIT_FULL_PATH = ".git/hooks/post-commit";

// 准备当周的文件 YYYY-ww.md
function initCurrentWeekFile(folderPath: string) {
  const filename = getCurrentWeekFileName();
  const filepath = path.join(folderPath, filename);

  if (!fs.existsSync(filepath)) {
    const start = dayjs().startOf("week").format("YYYY.MM.DD");
    const end = dayjs().endOf("week").format("YYYY.MM.DD");

    // 创建文件
    fs.writeFileSync(
      filepath,
      `---
date:
  - ${start} - ${end}
---
`
    );
  }
}

function isGitRepository(dir: string) {
  return fs.existsSync(path.join(dir, ".git"));
}

function isExistsPostCommit(dir: string) {
  return fs.existsSync(path.join(dir, POST_COMMIT_FULL_PATH));
}

function isExistRecordCommitMsgScript(dir: string) {
  return fs.existsSync(path.join(dir, RECORD_COMMIT_MSG_SCRIPT_FILE_FULL_PATH));
}

// 在 post-commit 钩子中添加执行语句: `sh .git/hooks/record-commit-msg.sh`
function appendCallStatement(dir: string) {
  fs.appendFileSync(
    path.join(dir, POST_COMMIT_FULL_PATH),
    `\nsh ${RECORD_COMMIT_MSG_SCRIPT_FILE_FULL_PATH}`
  );
}

// 确保 post-commit 中执行了脚本：record-commit-msg.sh
function setupPostCommitHook(dir: string) {
  const postCommitHook = fs.readFileSync(
    path.join(dir, POST_COMMIT_FULL_PATH),
    "utf8"
  );

  const isExistCallStatement = postCommitHook.includes(
    `sh ${RECORD_COMMIT_MSG_SCRIPT_FILE_FULL_PATH}`
  );

  if (!isExistCallStatement) {
    appendCallStatement(dir);
  }
}

// 创建 record-commit-msg.weekhelp.sh
function createRecordCommitMsgScript(dir: string, weekhelpFolderPath: string) {
  // 将 src/record-commit-msg.template.sh 脚本写入到 record-commit-msg.weekhelp.sh 中
  console.log("__dirname", __dirname);
  const recordCommitMsgScriptTemplate = fs.readFileSync(
    path.join(__dirname, "..", "record-commit-msg.template.sh"),
    "utf8"
  );

  // 将 WEEKHELP_FOLDER_PATH="" 替换为真实值
  const recordCommitMsgScript = recordCommitMsgScriptTemplate.replace(
    'WEEKHELP_FOLDER_PATH=""',
    `WEEKHELP_FOLDER_PATH="${weekhelpFolderPath}"`
  );

  const scriptFileFullPath = path.join(
    dir,
    RECORD_COMMIT_MSG_SCRIPT_FILE_FULL_PATH
  );
  fs.writeFileSync(scriptFileFullPath, recordCommitMsgScript);

  // 确保有执行权限
  fs.chmod(scriptFileFullPath, 0o755, (err) => {
    if (err) {
      console.error(`无法设置执行权限: ${err}`);
    } else {
      console.log(`'${scriptFileFullPath}' 的执行权限已设置`);
    }
  });
}

function initPostCommitHook(dir: string) {
  const filePath = path.join(dir, POST_COMMIT_FULL_PATH);

  fs.writeFileSync(filePath, `#!/bin/sh\n\n`);

  // 确保有执行权限
  fs.chmod(filePath, 0o755, (err) => {
    if (err) {
      console.error(`无法设置执行权限: ${err}`);
    } else {
      console.log(`'${filePath}' 的执行权限已设置`);
    }
  });
}

function workspaceFolderChange(weekhelpFolderPath: string) {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) {
    return;
  }

  workspaceFolders.forEach((folder) => {
    const dir = folder.uri.fsPath;

    // 不是一个git仓库
    if (!isGitRepository(dir)) {
      vscode.window.showInformationMessage(`${dir} is not a git repository`);
      return;
    }

    // 没有 post-commit，就创建一个
    if (!isExistsPostCommit(dir)) {
      initPostCommitHook(dir);
    }

    // 没有 record-commit-msg.sh 就创建一个
    if (!isExistRecordCommitMsgScript(dir)) {
      createRecordCommitMsgScript(dir, weekhelpFolderPath);
    }

    // 确保 post-commit 中执行了脚本：record-commit-msg.sh
    setupPostCommitHook(dir);
  });
}

function initWeekhelpFolder(context: vscode.ExtensionContext) {
  const globalStorageUri = context.globalStorageUri;

  // 创建全局目录
  if (!fs.existsSync(globalStorageUri.fsPath)) {
    fs.mkdirSync(globalStorageUri.fsPath);
  }
  console.log("weekhelp folder created:", globalStorageUri.fsPath);
}

function getWeekhelpFolderPath(context: vscode.ExtensionContext) {
  const globalStorageUri = context.globalStorageUri;

  return globalStorageUri.fsPath;
}

// 插件被激活时执行这个方法
export function activate(context: vscode.ExtensionContext) {
  const weekhelpFolderPath = getWeekhelpFolderPath(context);

  // 注册命令
  registerOpenWeekhelpFolderCommand(context);
  registerOpenWeekhelpFileCommand(context);

  // 创建全局目录
  initWeekhelpFolder(context);

  // 初始化本周的文件
  initCurrentWeekFile(weekhelpFolderPath);

  vscode.workspace.onDidChangeWorkspaceFolders(() => {
    workspaceFolderChange(weekhelpFolderPath);
  });

  // 插件被激活时，执行一次.
  workspaceFolderChange(weekhelpFolderPath);
}

// This method is called when your extension is deactivated
export function deactivate() {}
