import * as vscode from "vscode";
import * as path from "path";
import { getCurrentWeekFileName } from "../lib";

const command = "weekhelp.openWeekhelpFolder";

// 打开文件夹
export function registerOpenWeekhelpFolderCommand(
  context: vscode.ExtensionContext
) {
  const disposable = vscode.commands.registerCommand(command, () => {
    vscode.commands.executeCommand(
      "vscode.openFolder",
      context.globalStorageUri,
      true
    );
  });

  context.subscriptions.push(disposable);
}
