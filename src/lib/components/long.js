/**
 * Creates a longpress action for both mouse and touch events
 * @param {Node} node - The DOM node to attach the longpress to
 * @param {Object} [options] - Configuration options
 * @param {number} [options.duration=500] - Duration in ms to trigger long press
 * @returns {Object} - Destroy method for cleanup
 */
export function longpress(node, options = {}) {
  const duration = options.duration || 300;
  let timer = null;
  let isPressed = false;
  let startX, startY;
  const MOVE_THRESHOLD = 10;

  function handleStart(event) {
    // Don't prevent default - only do that when we confirm it's a long press
    isPressed = true;
    
    // Track the start position to detect movement
    startX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
    startY = event.type.includes('mouse') ? event.clientY : event.touches[0].clientY;
    
    timer = window.setTimeout(() => {
      if (isPressed) {
        node.dispatchEvent(new CustomEvent('longpress', {
          detail: { originalEvent: event }
        }));
      }
      timer = null;
    }, duration);
  }

  function handleMove(event) {
    if (!isPressed) return;
    
    const clientX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
    const clientY = event.type.includes('mouse') ? event.clientY : event.touches[0].clientY;
    
    // Calculate movement distance
    const moveX = Math.abs(clientX - startX);
    const moveY = Math.abs(clientY - startY);
    
    // Cancel long press if moved too much
    if (moveX > MOVE_THRESHOLD || moveY > MOVE_THRESHOLD) {
      cancelPress();
    }
  }

  function handleEnd() {
    cancelPress();
  }

  function cancelPress() {
    isPressed = false;
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  // Add mouse event listeners
  node.addEventListener('mousedown', handleStart);
  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleEnd);
  
  // Add touch event listeners
  node.addEventListener('touchstart', handleStart);
  window.addEventListener('touchmove', handleMove);
  window.addEventListener('touchend', handleEnd);
  window.addEventListener('touchcancel', handleEnd);

  return {
    destroy() {
      // Clean up all event listeners
      node.removeEventListener('mousedown', handleStart);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      
      node.removeEventListener('touchstart', handleStart);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
      
      cancelPress();
    },
    
    update(newOptions = {}) {
      options = newOptions;
    }
  };
}
