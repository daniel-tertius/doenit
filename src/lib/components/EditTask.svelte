<script>
  import InputTaskName from "$lib/components/element/input/InputTaskName.svelte";
  import ButtonSubmitTask from "./element/button/ButtonSubmitTask.svelte";
  import CategoryPicker from "$lib/components/CategoryPicker.svelte";
  import DateTimeRangePicker from "./DateTimeRangePicker.svelte";
  import Herhaling from "$lib/components/task/Herhaling.svelte";
  import DatePickerShortcut from "./DatePickerShortcut.svelte";
  import PhotoGallery from "./photo/PhotoGallery.svelte";
  import { Photos } from "$lib/services/photos.svelte";
  import Button from "./element/button/Button.svelte";
  import { t } from "$lib/services/language.svelte";
  import ShareTask from "./ShareTask.svelte";
  import User from "$lib/core/user.svelte";
  import { Important } from "$lib/icon";
  import { slide } from "svelte/transition";
  import { tick } from "svelte";

  let { task = $bindable(), error = $bindable(), other_interval = $bindable(), onsubmit } = $props();

  let show = $state(false);
  let loading = $state(false);
  let invalid = $state(false);

  const title = $derived(!!task.start_date ? t("date") : t("due_date"));

  /**
   * Handle form submission
   * @param {Event} event
   */
  async function handleSubmit(event) {
    event.preventDefault();

    if (!task.name?.trim()) {
      await tick();
      invalid = true;
      return;
    }

    loading = true;
    if (onsubmit) await onsubmit(event);
    loading = false;
  }

  function showMore() {
    show = !show;
    invalid = false;
  }
</script>

<form onsubmit={handleSubmit}>
  <InputTaskName {onsubmit} {invalid} {show} focus_on_mount bind:value={task.name} />

  {#if !show}
    <div class="flex justify-center mt-10">
      <button class="bg-card rounded-full px-4 py-1" type="button" onclick={showMore}> Show More </button>
    </div>
  {:else}
    <div transition:slide={{ axis: "y" }} class="space-y-4">
      <div>
        <label class="font-semibold" for="category">{t("category")}</label>
        <CategoryPicker bind:category_id={task.category_id} />
      </div>

      <div class="w-full">
        <label class="font-semibold" for="date">{title}</label>
        <DateTimeRangePicker
          start={task.start_date}
          end={task.due_date}
          onchange={({ start_date = "", start_time = "", end_date = "", end_time = "" }) => {
            task.start_date = start_date ? `${start_date} ${start_time}`.trim() : null;
            task.due_date = end_date ? `${end_date} ${end_time}`.trim() : null;
          }}
          bind:error_message={error.date}
        />
        <DatePickerShortcut bind:date={task.due_date} />
      </div>

      {#if task.due_date}
        <Herhaling
          bind:repeat_interval_number={task.repeat_interval_number}
          bind:repeat_interval={task.repeat_interval}
          bind:specific_days={task.repeat_specific_days}
          bind:other_interval
        />
      {/if}

      <div>
        <div class="grid grid-cols-[40px_auto_128px] py-2 border-t border-default">
          <Important class="m-auto" />
          <div class="flex flex-col">
            <span class="font-semibold">{t("is_this_important")}</span>
            <span class="italic">{t("this_will_appear_higher")}</span>
          </div>
          <Button
            class={{
              "bg-card border border-default": !task.important,
              "bg-warning/10! border-warning! text-warning!": task.important,
            }}
            type="button"
            aria-label={t("important")}
            onclick={() => {
              task.important = !task.important;
            }}
          >
            <Important />
            <span>{t("important")}</span>
          </Button>
        </div>

        {#if User.value?.is_friends_enabled}
          <ShareTask bind:room_id={task.room_id} />
        {/if}
      </div>

      {#if Photos.PHOTOS_ENABLED}
        <div class="border-t border-default pt-4">
          <PhotoGallery bind:photo_ids={task.photo_ids} />
        </div>
      {/if}
    </div>
  {/if}

  <ButtonSubmitTask {loading} />
</form>
