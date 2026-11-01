// Pure history logic, independent of VS Code, so it can be unit-tested.

/** Adds a command to the front of the history: trims trailing whitespace, skips empty input,
 *  moves an existing identical command to the front instead of duplicating it, and caps the size. */
export function addCommand(history: readonly string[], command: string, maxItems: number): string[] {
  const text = command.replace(/\s+$/u, "");
  if (!text.trim()) {
    return history.slice();
  }
  const rest = history.filter((h) => h !== text);
  return [text, ...rest].slice(0, Math.max(1, maxItems));
}

/** One line for the picker: the first non-empty line, with a marker when the command spans several lines. */
export function label(command: string): string {
  const lines = command.split(/\r?\n/u);
  const first = lines.find((l) => l.trim()) ?? "";
  const more = lines.filter((l) => l.trim()).length - 1;
  return more > 0 ? `${first.trim()}  … (+${more} lines)` : first.trim();
}

/** The rest of a multi-line command, flattened for the picker's detail row so it is searchable too. */
export function detail(command: string): string | undefined {
  const lines = command.split(/\r?\n/u).map((l) => l.trim()).filter(Boolean);
  return lines.length > 1 ? lines.slice(1).join("  ⏎  ") : undefined;
}
