/**
 *
 * @param {Node} node
 * @returns
 */
export function longpress(node) {
  const TIME_MS = 500;
  /** @type {number} */
  let timeoutPtr;

  /**
   *
   * @param {Event} e
   */
  function handleMouseDown(e) {
    e.stopPropagation();
    window.addEventListener("mousemove", handleMoveBeforeLong);
    timeoutPtr = window.setTimeout(() => {
      console.log("looooong press!");
      window.removeEventListener("mousemove", handleMoveBeforeLong);
      node.dispatchEvent(new CustomEvent("long"));
      // TODO - ideally make this not trigger long press again
      window.setTimeout(() => node.dispatchEvent(e), 0);
    }, TIME_MS);
  }

  function handleMoveBeforeLong() {
    window.clearTimeout(timeoutPtr);
    window.removeEventListener("mousemove", handleMoveBeforeLong);
  }

  function handleMouseUp() {
    window.clearTimeout(timeoutPtr);
    window.removeEventListener("mousemove", handleMoveBeforeLong);
  }

  node.addEventListener("mousedown", handleMouseDown);
  node.addEventListener("mouseup", handleMouseUp);
  return {
    destroy: () => {
      node.removeEventListener("mousedown", handleMouseDown);
      node.removeEventListener("mouseup", handleMouseUp);
    },
  };
}
