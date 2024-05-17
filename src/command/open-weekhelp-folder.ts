import * as vscode from "vscode";
import { Weekhelp } from "../class/weekhelp";

const command = "weekhelp.openWeekhelpFolder";

// 打开文件夹
export function registerOpenWeekhelpFolderCommand(
  context: vscode.ExtensionContext
) {
  const disposable = vscode.commands.registerCommand(command, () => {
    const wh = new Weekhelp(context);
    wh.openWeekhelpFolder();
  });

  context.subscriptions.push(disposable);
}
