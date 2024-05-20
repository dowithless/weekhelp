import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);

const RECORD_SCRIPT_FILE_NAME = "record.weekhelp.sh";
const RECORD_SCRIPT_TEMPLATE_FILE_NAME = `${RECORD_SCRIPT_FILE_NAME}.template`;
const POST_COMMIT_RELATIVE_PATH = ".git/hooks/post-commit"; // 相对项目根目录（workspaceFolder）的位置
const RECORD_SCRIPT_FILE_RELATIVE_PATH = `.git/hooks/${RECORD_SCRIPT_FILE_NAME}`;

export class Weekhelp {
  vsContext: vscode.ExtensionContext;

  constructor(vsContext: vscode.ExtensionContext) {
    this.vsContext = vsContext;
  }

  /**
   * 检查指定文件夹是否为Git仓库。
   *
   * @param folderPath - 指定要检查的文件夹路径。
   * @returns 返回一个布尔值，如果文件夹内存在 .git 目录，则为 true，否则为 false。
   */
  static isGitRepositoryFolder(folderPath: string) {
    // 检查指定路径下是否存在 .git 目录
    return fs.existsSync(path.join(folderPath, ".git"));
  }

  /**
   * 检查指定文件夹是否为Git仓库且存在post-commit钩子文件
   * @param folderPath 要检查的文件夹路径
   * @returns 返回布尔值，如果文件夹是Git仓库且存在post-commit文件则为true，否则为false
   */
  static isExistPostCommitFile(folderPath: string) {
    // 先检查文件夹是否为Git仓库
    if (!Weekhelp.isGitRepositoryFolder(folderPath)) {
      return false;
    }

    // 检查指定路径下是否存在 post-commit 文件
    return fs.existsSync(path.join(folderPath, POST_COMMIT_RELATIVE_PATH));
  }

  /**
   * 检查指定文件夹中是否存在记录脚本。
   * @param folderPath 要检查的文件夹路径。
   * @returns 返回一个布尔值，表示记录脚本文件是否存在于指定的文件夹中。
   */
  static isExistRecordScriptFile(folderPath: string) {
    // 使用 fs.existsSync 和 path.join 检查指定文件夹中是否存在记录脚本文件
    return fs.existsSync(path.join(folderPath, RECORD_SCRIPT_FILE_NAME));
  }

  /**
   * 检查git post-commit钩子脚本中是否调用了记录脚本
   * @param workspaceFolder 工作空间文件夹的路径
   * @returns 返回一个布尔值，表示post-commit脚本中是否包含了调用记录脚本的语句
   */
  static isPostCommitIncludeRecordScript(workspaceFolder: string) {
    // 获取post-commit钩子脚本的完整路径
    const postCommitPath = path.join(
      workspaceFolder,
      POST_COMMIT_RELATIVE_PATH
    );

    // 读取post-commit脚本的内容
    const postCommit = fs.readFileSync(postCommitPath, "utf8");

    // 检查脚本内容中是否包含调用记录脚本的语句
    const isExistCallStatement = postCommit.includes(
      `${RECORD_SCRIPT_FILE_NAME}`
    );

    return isExistCallStatement;
  }

  /**
   * 在指定的工作空间文件夹中创建一个post-commit文件。
   * @param workspaceFolder 工作空间的文件夹路径，将在此路径下创建post-commit文件。
   * @returns 无返回值。
   */
  static createPostCommitFile(workspaceFolder: string) {
    // 拼接文件路径
    const filePath = path.join(workspaceFolder, POST_COMMIT_RELATIVE_PATH);

    // 写入文件内容
    fs.writeFileSync(filePath, `#!/bin/bash\n`);

    // 设置文件的执行权限
    fs.chmod(filePath, 0o755, (err) => {
      if (err) {
        throw err; // 如果设置权限时发生错误，抛出异常
      }

      console.log(`post-commit file created at ${filePath}`); // 打印创建文件成功的消息
    });
  }

  /**
   * 在指定的工作空间文件夹中创建记录脚本文件。
   * @param workspaceFolder 工作空间文件夹的路径
   * @param weekhelpFolderPath WEEKHELP文件夹的路径，将被插入到脚本文件中作为路径配置
   */
  static createRecordScriptFile(
    workspaceFolder: string,
    weekhelpFolderPath: string
  ) {
    // 读取记录脚本模板文件的内容
    const templateFile = fs.readFileSync(
      path.join(__dirname, "../../", RECORD_SCRIPT_TEMPLATE_FILE_NAME),
      "utf8"
    );

    // 将模板文件中的WEEKHELP_FOLDER_PATH占位符替换为实际的weekhelpFolderPath值
    const fileContent = templateFile.replace(
      `WEEKHELP_FOLDER_PATH=""`,
      `WEEKHELP_FOLDER_PATH="${weekhelpFolderPath}"`
    );

    // 拼接生成脚本文件的完整路径
    const filePath = path.join(
      workspaceFolder,
      RECORD_SCRIPT_FILE_RELATIVE_PATH
    );

    // 将内容写入文件，并设置文件权限
    fs.writeFileSync(filePath, fileContent);
    fs.chmodSync(filePath, 0o755); // 设置文件为可执行权限
  }

  static deleteRecordScriptFile(workspaceFolder: string) {
    const filePath = path.join(
      workspaceFolder,
      RECORD_SCRIPT_FILE_RELATIVE_PATH
    );

    fs.unlinkSync(filePath);
  }

  /**
   * 将记录脚本追加到post-commit文件中。
   * 该函数尝试在给定的工作空间文件夹中找到post-commit文件，并在文件末尾追加记录脚本的调用。
   *
   * @param workspaceFolder 工作空间文件夹的路径，此文件夹中应包含post-commit文件。
   * @returns 如果成功执行，则不返回任何内容。如果遇到错误，则返回错误对象。
   */
  static appendRecordScriptToPostCommit(workspaceFolder: string) {
    try {
      if (!Weekhelp.isExistPostCommitFile(workspaceFolder)) {
        Weekhelp.createPostCommitFile(workspaceFolder);
      }

      // 尝试将记录脚本的调用追加到post-commit文件的末尾
      fs.appendFileSync(
        path.join(workspaceFolder, POST_COMMIT_RELATIVE_PATH),
        `\n${RECORD_SCRIPT_FILE_RELATIVE_PATH}`
      );
    } catch (error) {
      // 如果在追加文件内容时发生错误，则打印错误并返回错误对象
      console.error(error);
      return error;
    }
  }

  static moveFile(srcPath: string, destPath: string) {
    var readStream = fs.createReadStream(srcPath);
    var writeStream = fs.createWriteStream(destPath);

    readStream.on("error", onError);
    writeStream.on("error", onError);

    readStream.on("close", function () {
      Weekhelp.deleteFile(srcPath);
    });

    readStream.pipe(writeStream);

    function onError(error: any) {
      readStream.destroy();
      writeStream.end();

      console.error(error);
      vscode.window.showErrorMessage(error.message ?? "An error occurred");
    }
  }

  /**
   * 删除指定路径的文件。
   * @param path 要删除的文件的路径。
   * 该函数不返回任何内容。
   */
  static deleteFile(path: string) {
    try {
      // 尝试删除指定路径的文件
      fs.unlinkSync(path);
    } catch (error: any) {
      // 如果删除过程中出现错误，打印错误信息，并在VS Code窗口显示错误消息
      console.error(error);
      vscode.window.showErrorMessage(error.message ?? `remove file failed`);
    }
  }

  /**
   * 将指定路径下的周文件移动到新路径下。
   * 此函数会遍历旧路径下的所有文件，找到符合命名规则（YYYY-MM.md）的文件，并将其移动到新路径下。
   *
   * @param oldPath 旧路径，文件将从此路径下被移动。
   * @param newPath 新路径，文件将被移动到此路径下。
   */
  static moveWeekFiles(oldPath: string, newPath: string) {
    // 读取旧路径下的所有文件
    const files = fs.readdirSync(oldPath);

    for (const file of files) {
      // 检查文件名是否符合要求
      if (/^\d{4}-\d{2}\.md$/.test(file)) {
        const oldFilePath = path.join(oldPath, file); // 拼接旧文件路径
        const newFilePath = path.join(newPath, file); // 拼接新文件路径

        /**
         * 尝试将文件从旧路径重命名为新路径。
         * windows 系统没有内置的 mv、rename 命令
         * 如果重命名失败，则使用Weekhelp.moveFile方法尝试再次移动文件。
         *
         * @param oldFilePath 旧文件路径
         * @param newFilePath 新文件路径
         */
        try {
          fs.renameSync(oldFilePath, newFilePath); // 尝试同步重命名文件
        } catch (error) {
          Weekhelp.moveFile(oldFilePath, newFilePath); // 如果重命名失败，使用备用方法移动文件
        }
      }
    }
  }

  /**
   * 更新 Weekhelp 的工作目录路径。
   * 该函数首先检查新路径是否存在，如果不存在则显示错误消息。
   * 如果新路径存在，它将移动 Weekhelp 文件到新路径，并显示一个成功消息。
   * 如果过程中发生错误，将显示错误消息。
   * @param oldPath 旧的工作目录路径。
   * @param newPath 新的工作目录路径。如果未提供，则使用全局存储路径。
   */
  updateWeekhelpFolderPath(oldPath: string, newPath: string) {
    try {
      // 如果未指定新路径，则使用全局存储路径
      if (!newPath) {
        newPath = this.vsContext.globalStorageUri.fsPath;
      }

      // 检查新路径是否存在
      if (!fs.existsSync(newPath)) {
        vscode.window.showErrorMessage(`Weekhelp: 目标目录不存在 ${newPath}`);
        return;
      }

      // 移动 Weekhelp 文件到新路径
      Weekhelp.moveWeekFiles(oldPath, newPath);

      // 显示工作目录已更新的信息
      vscode.window.showInformationMessage("Weekhelp: 工作目录已更新");
    } catch (error: any) {
      // 输出错误到控制台并显示错误消息
      console.error(error);
      vscode.window.showErrorMessage(
        error.message ??
          `Weekhelp: 更新目录失败, oldPath: ${oldPath}, newPath: ${newPath}`
      );
    }
  }

  /**
   * 获取Weekhelp文件夹的路径。
   *
   * @function getWeekhelpFolderPath
   * @memberof this
   * @returns {string} 返回Weekhelp文件夹在文件系统上的绝对路径。
   */
  getWeekhelpFolderPath(): string {
    // 配置的路径
    const configedPath = vscode.workspace
      .getConfiguration("weekhelp")
      .get("folderPath") as string;

    if (configedPath && fs.existsSync(configedPath)) {
      return configedPath;
    }

    return this.vsContext.globalStorageUri.fsPath;
  }

  /**
   * 创建weekhelp文件夹。
   * 该函数首先通过调用getWeekhelpFolderPath方法获取文件夹路径。
   * 如果该路径不存在，则创建该文件夹。
   *
   * 无参数。
   * 无返回值。
   */
  createWeekhelpFolder() {
    // 获取weekhelp文件夹的路径
    const folderPath = this.getWeekhelpFolderPath();

    // 如果路径不存在，则创建文件夹
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  }
  /**
   * 获取当前周的文件名，格式为"年份-周数.md"
   * 无参数
   * @returns {string} 返回当前周的文件名
   */
  getCurrentWeekFileName() {
    // 使用dayjs获取当前时间，并格式化为"年份-周数"的形式
    // WW: ISO 周数
    const name = dayjs().format("YYYY-WW");

    // 返回格式化后的周数文件名，添加.md后缀
    return `${name}.md`;
  }

  /**
   * 创建当前周的文件。
   * 此函数首先会确定文件名和文件存储的文件夹路径。
   * 如果该文件在指定路径下不存在，则会创建一个新的文件，记录当前周的起始和结束日期。
   *
   * 无参数
   * 无返回值
   */
  createCurrentWeekFile() {
    // 获取当前周的文件名
    const fileName = this.getCurrentWeekFileName();
    // 获取存储文件的文件夹路径
    const weekhelpFolderPath = this.getWeekhelpFolderPath();

    // 拼接完整的文件路径
    const filePath = path.join(weekhelpFolderPath, fileName);

    // 检查文件是否存在，若不存在则创建
    if (!fs.existsSync(filePath)) {
      // 获取当前周的开始和结束日期
      const start = dayjs().startOf("isoWeek").format("YYYY.MM.DD");
      const end = dayjs().endOf("isoWeek").format("YYYY.MM.DD");

      // 创建并写入文件，包含markdown的YAML front matter
      fs.writeFileSync(
        filePath,
        `---
date:
  - ${start} - ${end}
---
`
      );
    }
  }

  /**
   * 打开当前周的文件。
   * 该函数首先获取当前周的文件名，然后获取“Weekhelp”文件夹的路径，
   * 接着拼接出文件的绝对路径，并最后打开这个文件。
   * 注意：该函数不接受任何参数，也不直接返回任何值，它的结果是通过打开文件文档的方式呈现。
   */
  openCurrentWeekFile() {
    // 获取当前周的文件名
    const fileName = this.getCurrentWeekFileName();

    // 获取Weekhelp文件夹的路径
    const weekhelpFolderPath = this.getWeekhelpFolderPath();

    // 拼接出文件的绝对路径
    const filePath = vscode.Uri.file(path.join(weekhelpFolderPath, fileName));

    // 打开文件
    vscode.workspace.openTextDocument(filePath).then((doc) => {
      vscode.window.showTextDocument(doc);
    });
  }

  /**
   * 打开Weekhelp文件夹
   * 本函数无参数。
   * 本函数无返回值。
   */
  openWeekhelpFolder() {
    console.log("open weekhelp folder", this);
    // 获取Weekhelp文件夹的路径
    const weekhelpFolderPath = this.getWeekhelpFolderPath();

    // 执行VS Code命令以打开Weekhelp文件夹
    vscode.commands.executeCommand(
      "vscode.openFolder",
      vscode.Uri.file(weekhelpFolderPath),
      true
    );
  }

  setupWorkspaceFolder(folderPath: string) {
    // 不是一个git仓库
    if (!Weekhelp.isGitRepositoryFolder(folderPath)) {
      console.log(`${folderPath} is not a git repository`);
      return;
    }

    // 没有 post-commit，就创建一个
    if (!Weekhelp.isExistPostCommitFile(folderPath)) {
      Weekhelp.createPostCommitFile(folderPath);
    }

    // 在post-commit 中调用 record 脚本
    if (!Weekhelp.isPostCommitIncludeRecordScript(folderPath)) {
      Weekhelp.appendRecordScriptToPostCommit(folderPath);
    }

    // 保持更新
    if (Weekhelp.isExistRecordScriptFile(folderPath)) {
      Weekhelp.deleteRecordScriptFile(folderPath);
    }
    Weekhelp.createRecordScriptFile(folderPath, this.getWeekhelpFolderPath());
  }
}
