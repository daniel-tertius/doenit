<script>
  import { untrack } from "svelte";

  let { selected_hour = $bindable(new Date().getHours()), onchange } = $props();

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const item_height = 60;
  const visible_items = 3;
  const total_repeats = 5;

  /** @type {HTMLDivElement | null} */
  let scroll_container = $state(null);
  let is_scrolling = false;
  /** @type {NodeJS.Timeout | Number} */
  let scroll_timeout = 0;

  const all_hours = [...hours.slice(-1), ...Array(total_repeats).fill(hours).flat(), ...hours.slice(0, 1)];

  $effect(() => {
    if (!scroll_container) return;

    untrack(() => {
      if (!scroll_container) return;

      const middle_repeat = Math.floor(total_repeats / 2);
      const scroll = (middle_repeat * 24 + selected_hour + 1) * item_height;
      scroll_container.scrollTop = scroll;
    });
  });

  function handleScroll() {
    is_scrolling = true;
    clearTimeout(scroll_timeout);

    scroll_timeout = setTimeout(() => {
      snapToNearestHour();
      is_scrolling = false;
    }, 150);
  }

  function snapToNearestHour() {
    if (!scroll_container) return;

    const scrollTop = scroll_container.scrollTop;
    const nearestIndex = Math.round(scrollTop / item_height);
    const snappedScroll = nearestIndex * item_height;

    scroll_container.scrollTo({
      top: snappedScroll,
      behavior: "smooth",
    });

    const hour = all_hours[nearestIndex] % 24;
    if (hour !== selected_hour) {
      selected_hour = hour;
      if (onchange) onchange({ hour: selected_hour });
    }

    handleInfiniteScroll(nearestIndex);
  }

  /**
   * @param {number} index
   */
  function handleInfiniteScroll(index) {
    if (!scroll_container) return;

    const middle_repeat = Math.floor(total_repeats / 2);
    const middle_start = middle_repeat * 24 + 1;
    const middle_end = (middle_repeat + 1) * 24;

    if (index < middle_start - 5) {
      const offset = 24 * item_height;
      scroll_container.scrollTop += offset;
    } else if (index > middle_end + 5) {
      const offset = 24 * item_height;
      scroll_container.scrollTop -= offset;
    }
  }
</script>

<div class="relative w-full" style="height: {item_height * visible_items}px;">
  <!-- Selection indicator -->
  <div
    class="absolute left-0 right-0 pointer-events-none z-10 border-y border-default"
    style="top: {item_height}px; height: {item_height}px;"
  ></div>

  <!-- Scroll container -->
  <div
    bind:this={scroll_container}
    onscroll={handleScroll}
    class="h-full overflow-y-scroll scrollbar-none"
    style="scroll-snap-type: y mandatory;"
  >
    <div style="padding: {item_height}px 0;">
      {#each all_hours as hour}
        {@const display_hour = hour % 24}
        {@const is_center = display_hour === selected_hour}

        <div
          class="flex items-center justify-center transition-opacity duration-200"
          class:opacity-30={!is_center}
          style="height: {item_height}px; scroll-snap-align: center;"
        >
          <span class="text-3xl font-medium">
            {display_hour.toString().padStart(2, "0")}
          </span>
        </div>
      {/each}
    </div>
  </div>
</div>
