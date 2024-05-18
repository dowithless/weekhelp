// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import advancedFormat from "dayjs/plugin/advancedFormat";

import { registerOpenWeekhelpFileCommand } from "./command/open-weekhelp-file";
import { registerOpenWeekhelpFolderCommand } from "./command/open-weekhelp-folder";
import { setWeekhelpFolder as registerSetWeekhelpFolderCommand } from "./command/set-weekhelp-folder";
import { onDidChangeConfiguration } from "./event/on-did-change-configuration";

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

    // 监听配置的修改
    onDidChangeConfiguration(context);

    // 注册命令
    registerOpenWeekhelpFolderCommand(context);
    registerOpenWeekhelpFileCommand(context);
    registerSetWeekhelpFolderCommand(context);

    wh.createWeekhelpFolder();

    // 初始化本周的文件
    // initCurrentWeekFile(weekhelpFolderPath);
    wh.createCurrentWeekFile();

    // 切换了文件夹时，检查文件夹是否是 git 仓库
    // 如果是，要进行初始化工作
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
