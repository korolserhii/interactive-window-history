import * as vscode from "vscode";
import { addCommand, detail, label } from "./history";

const KEY = "interactiveHistory.commands";
// The Interactive Window is a notebook of this type; its input box is a text editor with this URI scheme.
const IW_NOTEBOOK = "interactive";
const IW_INPUT_SCHEME = "vscode-interactive-input";

function maxItems(): number {
  return vscode.workspace.getConfiguration("interactiveHistory").get<number>("maxItems", 2000);
}

export function activate(context: vscode.ExtensionContext): void {
  const read = (): string[] => context.globalState.get<string[]>(KEY, []);
  const write = (h: string[]) => context.globalState.update(KEY, h);

  const record = (cells: readonly vscode.NotebookCell[]) => {
    let h = read();
    for (const cell of cells) {
      if (cell.kind === vscode.NotebookCellKind.Code) {
        h = addCommand(h, cell.document.getText(), maxItems());
      }
    }
    return write(h);
  };

  // Every command run in the Interactive Window is appended to its notebook as a new cell.
  context.subscriptions.push(
    vscode.workspace.onDidChangeNotebookDocument((e) => {
      if (e.notebook.notebookType !== IW_NOTEBOOK) {
        return;
      }
      const added = e.contentChanges.flatMap((c) => c.addedCells);
      if (added.length) {
        void record(added);
      }
    })
  );

  // 0.1.1: history saved by 0.1.0 could hold the same command twice (CRLF vs LF) — re-normalize it once on start.
  const saved = read();
  const cleaned = [...saved].reverse().reduce<string[]>((h, cmd) => addCommand(h, cmd, maxItems()), []);
  if (cleaned.length !== saved.length) {
    void write(cleaned);
  }

  // Windows already open when the extension starts (e.g. after a reload).
  for (const nb of vscode.workspace.notebookDocuments) {
    if (nb.notebookType === IW_NOTEBOOK) {
      void record(nb.getCells());
    }
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("interactiveHistory.search", async () => {
      const history = read();
      if (!history.length) {
        void vscode.window.showInformationMessage(
          "Interactive Window history is empty — run something in the Interactive Window first."
        );
        return;
      }
      const picked = await vscode.window.showQuickPick(
        history.map((cmd) => ({ label: label(cmd), detail: detail(cmd), cmd })),
        {
          title: "Interactive Window history",
          placeHolder: "Type to search everything you ran (newest first)",
          matchOnDetail: true,
        }
      );
      if (!picked) {
        return;
      }
      await insert(picked.cmd);
    }),

    vscode.commands.registerCommand("interactiveHistory.clear", async () => {
      const ok = await vscode.window.showWarningMessage(
        `Delete all ${read().length} saved Interactive Window commands?`,
        { modal: true },
        "Delete"
      );
      if (ok === "Delete") {
        await write([]);
      }
    })
  );
}

/** Puts the command into the Interactive Window's input box, replacing what is there, ready to run with Shift+Enter. */
async function insert(cmd: string): Promise<void> {
  const editor = vscode.window.visibleTextEditors.find((e) => e.document.uri.scheme === IW_INPUT_SCHEME);
  if (!editor) {
    await vscode.env.clipboard.writeText(cmd);
    void vscode.window.showInformationMessage("No Interactive Window is open — the command was copied to the clipboard.");
    return;
  }
  const doc = editor.document;
  const all = new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length));
  await editor.edit((b) => b.replace(all, cmd));
  await vscode.window.showTextDocument(doc, editor.viewColumn);
  const end = doc.positionAt(doc.getText().length);
  editor.selection = new vscode.Selection(end, end);
}

export function deactivate(): void {}
