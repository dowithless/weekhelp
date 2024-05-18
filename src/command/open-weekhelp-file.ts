import * as vscode from "vscode";
import { Weekhelp } from "../class/weekhelp";

const command = "weekhelp.openWeekhelpFile";

// 打开文件

export function openWeekhelpFile(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(command, () => {
    const wh = new Weekhelp(context);
    wh.openCurrentWeekFile();
  });

  context.subscriptions.push(disposable);
}
