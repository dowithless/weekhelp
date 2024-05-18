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
    try {
      const folderPath = folder.uri.fsPath;
      wh.setupWorkspaceFolder(folderPath);
    } catch (error) {
      console.error(error);

      // vscode 提示
      vscode.window.showErrorMessage(`Weekhelp: ${folder.name} 初始化失败`);
    }
  });
}

// 插件被激活时执行这个方法
export function activate(context: vscode.ExtensionContext) {
  try {
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
  } catch (error: any) {
    console.error(error);

    vscode.window.showErrorMessage(
      `Weekhelp: ${error.message || "插件激活时出现异常"}`
    );
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
