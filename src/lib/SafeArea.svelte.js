class SafeArea {
  /** @type {number} */
  #top = $state(null);
  /** @type {number} */
  #right = $state(null);
  /** @type {number} */
  #bottom = $state(null);
  /** @type {number} */
  #left = $state(null);

  set top(value) {
    if (this.#top != null) return;

    this.#top = value;
  }

  get top() {
    return this.#top;
  }

  set right(value) {
    if (this.#right != null) return;
    this.#right = value;
  }

  get right() {
    return this.#right;
  }

  set bottom(value) {
    if (this.#bottom != null) return;
    this.#bottom = value;
  }

  get bottom() {
    return this.#bottom;
  }

  set left(value) {
    if (this.#left != null) return;
    this.#left = value;
  }

  get left() {
    return this.#left;
  }
}

export const safeArea = new SafeArea();
