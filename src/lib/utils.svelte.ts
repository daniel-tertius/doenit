export class Value<T> {
  #value: T | null = $state(null);

  constructor(value?: T) {
    if (value) this.#value = value;
  }

  set value(value: T | null) {
    if (!value) value = null;
    if (value === this.#value) return;

    this.#value = value;
  }

  get value(): T | null {
    return this.#value;
  }
}
