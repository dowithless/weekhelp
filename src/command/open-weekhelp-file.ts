import * as vscode from "vscode";
import * as path from "path";
import { getCurrentWeekFileName } from "../lib";

const command = "weekhelp.openWeekhelpFile";

// 打开文件

export function registerOpenWeekhelpFileCommand(
  context: vscode.ExtensionContext
) {
  const disposable = vscode.commands.registerCommand(command, () => {
    const filename = getCurrentWeekFileName();

    const openPath = vscode.Uri.file(
      path.join(context.globalStorageUri.fsPath, filename)
    );

    vscode.workspace.openTextDocument(openPath).then((doc) => {
      vscode.window.showTextDocument(doc);
    });
  });

  context.subscriptions.push(disposable);
}
