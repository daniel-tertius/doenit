/**
 * Creates a longpress action for both mouse and touch events
 * @param {Node} node - The DOM node to attach the longpress to
 * @param {Object} [options] - Configuration options
 * @param {number} [options.duration=500] - Duration in ms to trigger long press
 * @param {number} [options.moveThreshold=10] - Max pixels to move before canceling
 * @returns {Object} - Object with destroy and update methods
 */
export function longpress(node, options = {}) {
  // Configuration with defaults
  let config = {
    duration: 500,
    moveThreshold: 10,
    ...options,
  };

  /**
   * State management
   * @type {{timer: number?, isPressed: boolean, hasTriggered: boolean, startPosition: {x: number, y: number}}}
   */
  const state = {
    timer: null,
    isPressed: false,
    hasTriggered: false,
    startPosition: { x: 0, y: 0 },
  };

  // Event listener definitions
  const eventListeners = [
    // Mouse events
    { target: node, type: "mousedown", handler: handleStart },
    { target: window, type: "mousemove", handler: handleMove },
    { target: window, type: "mouseup", handler: handleEnd },

    // Touch events
    { target: node, type: "touchstart", handler: handleStart },
    { target: window, type: "touchmove", handler: handleMove },
    { target: window, type: "touchend", handler: handleEnd },
    { target: window, type: "touchcancel", handler: handleEnd },
  ];

  // Initialize event listeners
  eventListeners.forEach(({ target, type, handler }) => {
    target.addEventListener(type, handler, { passive: true });
  });

  /**
   * Calculate distance between two points
   * @param {{x: number, y: number}} point1 - First point with x, y coordinates
   * @param {{x: number, y: number}} point2 - Second point with x, y coordinates
   * @returns {number} - Distance in pixels
   */
  function calculateDistance(point1, point2) {
    const deltaX = Math.abs(point2.x - point1.x);
    const deltaY = Math.abs(point2.y - point1.y);
    return Math.max(deltaX, deltaY); // Use max for square threshold
  }

  /**
   * Start the longpress timer and track initial position
   * @param {Event} event - Mouse or touch start event
   */
  function handleStart(event) {
    state.isPressed = true;
    state.startPosition = getEventCoordinates(/** @type {MouseEvent|TouchEvent} */ (event));

    state.timer = window.setTimeout(() => {
      if (state.isPressed) {
        node.dispatchEvent(
          new CustomEvent("longpress", {
            detail: {
              event,
              duration: config.duration,
              startPosition: state.startPosition,
            },
          })
        );
      }
      state.timer = null;
    }, config.duration);
  }

  /**
   * Check for movement and cancel if threshold exceeded
   * @param {Event} event - Mouse or touch move event
   */
  function handleMove(event) {
    if (!state.isPressed) return;

    const currentPosition = getEventCoordinates(/** @type {MouseEvent|TouchEvent} */ (event));
    const distance = calculateDistance(state.startPosition, currentPosition);

    if (distance > config.moveThreshold) {
      cancelPress();
    }
  }

  /**
   * End the press interaction
   * @param {Event} event - Mouse or touch end event
   */
  function handleEnd(event) {
    cancelPress();
  }

  /**
   * Cancel the current press and clean up
   */
  function cancelPress() {
    state.isPressed = false;
    if (state.timer !== null) {
      clearTimeout(state.timer);
      state.timer = null;
    }
  }

  return {
    /**
     * Clean up all event listeners and cancel any active press
     */
    destroy() {
      // Remove all event listeners
      eventListeners.forEach(({ target, type, handler }) => {
        target.removeEventListener(type, handler);
      });
      cancelPress();
    },

    /**
     * Update configuration options
     * @param {Object} newOptions - New configuration options
     */
    update(newOptions = {}) {
      config = {
        ...config,
        ...newOptions,
      };
    },
  };
}

/**
 * Extract coordinates from mouse or touch event
 * @param {MouseEvent|TouchEvent} event - Mouse or touch event
 * @returns {{x: number, y: number}} - Object with x and y coordinates
 */
function getEventCoordinates(event) {
  if (isMouseEvent(event)) {
    return { x: event.clientX, y: event.clientY };
  }

  if (event.touches && event.touches.length > 0) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }

  // Fallback for touch end events
  if (event.changedTouches && event.changedTouches.length > 0) {
    return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
  }

  return { x: 0, y: 0 };
}

/**
 * @param {MouseEvent|TouchEvent} event
 * @returns {event is MouseEvent}
 */
function isMouseEvent(event) {
  return event.type.startsWith("mouse");
}
