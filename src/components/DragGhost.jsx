/** Small label that follows the pointer while dragging. */
export default function DragGhost({ drag }) {
  if (!drag) return null;
  return (
    <div className="drag-ghost" style={{ transform: `translate(${drag.x + 14}px, ${drag.y + 14}px)` }}>
      {drag.payload.label}
    </div>
  );
}
