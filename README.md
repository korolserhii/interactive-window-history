# Interactive Window History Search

Search everything you ran in the Jupyter **Interactive Window** and put it back in the input box — like `Ctrl+R` reverse search in IPython or the history in Spyder and RStudio.

Answers the long-standing request [microsoft/vscode-jupyter#4716](https://github.com/microsoft/vscode-jupyter/issues/4716).

## How to use

1. Run code in the Interactive Window as usual (for example *Jupyter: Create Interactive Window*, or Shift+Enter on a `# %%` cell).
2. With the Interactive Window focused, press **Ctrl+R** (or run **Interactive Window: Search History** from the Command Palette).
3. Type any part of a command — multi-line commands are searched in full.
4. Press Enter: the command goes into the input box. Edit it if needed and run it with **Shift+Enter**.

The built-in Up/Down arrows still work as before.

## What it keeps

- Every code cell run in any Interactive Window, newest first, **kept across sessions and VS Code restarts**.
- A command you run again moves to the top instead of being stored twice.
- Up to 2000 distinct commands by default (`interactiveHistory.maxItems`).
- History stays on your computer, in VS Code's own extension storage. Nothing is sent anywhere.

**Interactive Window: Clear History** deletes it.

## Notes

- `Ctrl+R` is taken over only while the Interactive Window is the active editor; elsewhere it still opens *Recent*.
- Commands run before the extension was installed are not known, except for those still visible in an open Interactive Window.
- Requires the [Jupyter extension](https://marketplace.visualstudio.com/items?itemName=ms-toolsai.jupyter).

## License

MIT
