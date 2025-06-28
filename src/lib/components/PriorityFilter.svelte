<script>
  import Important from "$lib/icon/Important.svelte";
  import Urgent from "$lib/icon/Urgent.svelte";

  let { important = $bindable(false), urgent = $bindable(false), onclick } = $props();
</script>

<div class="flex gap-2 m-2">
  <button
    type="button"
    class="{important
      ? 'bg-yellow-100 border-yellow-700 text-yellow-700'
      : 'bg-primary-20l border-primary '}  p-2 rounded-lg border w-full text-sm shadow-sm transition-colors flex gap-1 justify-center items-center"
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
    class="{urgent
      ? 'bg-red-100 border-red-400 text-red-700'
      : 'bg-primary-20l border-primary '} p-2 rounded-lg border w-full text-sm shadow-sm transition-colors flex gap-1 justify-center items-center"
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
