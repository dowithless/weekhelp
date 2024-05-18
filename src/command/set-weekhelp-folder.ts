import * as vscode from "vscode";

const command = "weekhelp.setWeekhelpFolder";

export function setWeekhelpFolder(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(command, async () => {
    const folderUri = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
    });

    if (folderUri && folderUri[0]) {
      const config = vscode.workspace.getConfiguration("weekhelp");

      await config.update("folderPath", folderUri[0].fsPath, true);
    }
  });

  context.subscriptions.push(disposable);
}
