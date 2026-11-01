import { test } from "node:test";
import * as assert from "node:assert/strict";
import { addCommand, detail, label } from "../history";

test("newest first, no duplicates, capped", () => {
  let h: string[] = [];
  h = addCommand(h, "df.head()", 3);
  h = addCommand(h, "x = 1\n", 3);
  h = addCommand(h, "df.head()", 3);
  assert.deepEqual(h, ["df.head()", "x = 1"]);
  h = addCommand(h, "a", 3);
  h = addCommand(h, "b", 3);
  assert.deepEqual(h, ["b", "a", "df.head()"]);
});

test("empty input is ignored", () => {
  assert.deepEqual(addCommand(["a"], "   \n", 10), ["a"]);
});

test("multi-line label and searchable detail", () => {
  const cmd = "\nfor i in range(3):\n    print(i)\n";
  assert.equal(label(cmd), "for i in range(3):  … (+1 lines)");
  assert.equal(detail(cmd), "print(i)");
  assert.equal(detail("x = 1"), undefined);
});

test("CRLF, trailing spaces and blank edges do not create duplicates", () => {
  let h: string[] = [];
  h = addCommand(h, "x = 1\r\nprint(x)  \r\n", 10);
  h = addCommand(h, "\nx = 1\nprint(x)\n", 10);
  assert.deepEqual(h, ["x = 1\nprint(x)"]);
});
