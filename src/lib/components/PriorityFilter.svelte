<script>
  import { Important, Urgent } from "$lib/icon";

  let { important = $bindable(false), urgent = $bindable(false), onclick } = $props();
</script>

<div class="flex gap-2 m-2 transition-colors">
  <button
    type="button"
    class={{
      "text-tertiary p-2 rounded-lg border w-full text-sm shadow-sm transition-colors flex gap-1 justify-center items-center": true,
      "bg-yellow-100 border-yellow-700 text-yellow-700": important,
      "bg-t-primary border-primary-600 text-t-secondary": !important,
    }}
    onclick={(event) => {
      if (event) event.stopPropagation();

      important = !important;
      if (onclick) onclick();
    }}
  >
    <Important />
    <span>Belangrik</span>
  </button>

  <button
    type="button"
    class={{
      "p-2 rounded-lg border w-full text-sm shadow-sm transition-colors flex gap-1 justify-center items-center": true,
      "bg-error-30d border-error-invert-30d text-t-secondary": urgent,
      "bg-t-primary border-primary-600 text-t-secondary": !urgent,
    }}
    onclick={(event) => {
      if (event) event.stopPropagation();

      urgent = !urgent;
      if (onclick) onclick();
    }}
  >
    <Urgent />
    Dringend
  </button>
</div>
