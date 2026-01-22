export function handleCellKeyDown(e, row, col, tableRef) {
  const rows = tableRef.current.querySelectorAll("tr");

  let targetRow = row;
  let targetCol = col;

  if (e.key === "ArrowDown") targetRow++;
  if (e.key === "ArrowUp") targetRow--;
  if (e.key === "ArrowRight") targetCol++;
  if (e.key === "ArrowLeft") targetCol--;

  const target =
    rows[targetRow]?.querySelectorAll("input, select")[targetCol];

  if (target) {
    e.preventDefault();
    target.focus();
  }

  // Copy
  if (e.metaKey && e.key === "c") {
    navigator.clipboard.writeText(
      e.target.value ?? ""
    );
  }

  // Paste
  if (e.metaKey && e.key === "v") {
    navigator.clipboard.readText().then(text => {
      e.target.value = text;
      e.target.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }
}
