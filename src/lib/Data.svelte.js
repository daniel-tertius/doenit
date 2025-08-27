import { SvelteSet } from "svelte/reactivity";

export class Selected {
  static categories = new SvelteSet();
  static tasks = new SvelteSet();
}
