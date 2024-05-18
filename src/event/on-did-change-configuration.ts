import * as vscode from "vscode";
import { Weekhelp } from "../class/weekhelp";

export function onDidChangeConfiguration(context: vscode.ExtensionContext) {
  const wh = new Weekhelp(context);

  // 初始的配置值
  const previousFolderPath = wh.getWeekhelpFolderPath();

  const disposable = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("weekhelp.folderPath")) {
      const newFolderPath = vscode.workspace
        .getConfiguration("weekhelp")
        .get("folderPath") as string;

      wh.updateWeekhelpFolderPath(previousFolderPath, newFolderPath);
    }
  });

  context.subscriptions.push(disposable);
}
