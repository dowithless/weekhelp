// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import advancedFormat from "dayjs/plugin/advancedFormat";

import { registerOpenWeekhelpFileCommand } from "./command/open-weekhelp-file";
import { registerOpenWeekhelpFolderCommand } from "./command/open-weekhelp-folder";

import { Weekhelp } from "./class/weekhelp";

dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);

function workspaceFolderChange(context: vscode.ExtensionContext) {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) {
    return;
  }

  const wh = new Weekhelp(context);

  workspaceFolders.forEach((folder) => {
    const folderPath = folder.uri.fsPath;

    // 不是一个git仓库
    if (!Weekhelp.isGitRepositoryFolder(folderPath)) {
      console.log(`${folderPath} is not a git repository`);
      return;
    }

    // 没有 post-commit，就创建一个
    if (!Weekhelp.isExistPostCommitFile(folderPath)) {
      Weekhelp.createPostCommitFile(folderPath);
    }

    // 没有 record-commit-msg.sh 就创建一个
    if (!Weekhelp.isExistRecordScriptFile(folderPath)) {
      Weekhelp.createRecordScriptFile(folderPath, wh.getWeekhelpFolderPath());
    }

    if (!Weekhelp.isPostCommitIncludeRecordScript(folderPath)) {
      Weekhelp.appendRecordScriptToPostCommit(folderPath);
    }
  });
}

// 插件被激活时执行这个方法
export function activate(context: vscode.ExtensionContext) {
  const wh = new Weekhelp(context);

  // 注册命令
  registerOpenWeekhelpFolderCommand(context);
  registerOpenWeekhelpFileCommand(context);

  wh.createWeekhelpFolder();

  // 初始化本周的文件
  // initCurrentWeekFile(weekhelpFolderPath);
  wh.createCurrentWeekFile();

  vscode.workspace.onDidChangeWorkspaceFolders(() => {
    workspaceFolderChange(context);
  });

  // 插件被激活时，执行一次.
  workspaceFolderChange(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
