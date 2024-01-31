<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { getStepValueFromKey, type Step } from "../../lib/step";
  import ArrowDownIcon from "../icons/ArrowDownIcon.svelte";
  import DuplicateIcon from "../icons/DuplicateIcon.svelte";
  import EditIcon from "../icons/EditIcon.svelte";
  import TrashcanIcon from "../icons/TrashcanIcon.svelte";
  import { getStrategy } from "../../lib/strategies";
  import Input from "../Input.svelte";
  import HiddenInput from "../HiddenInput.svelte";
  import ThinArrowUpIcon from "../icons/ThinArrowUpIcon.svelte";
  import ThinArrowDownIcon from "../icons/ThinArrowDownIcon.svelte";
  import PlayDownIcon from "../icons/PlayDownIcon.svelte";

  export let step: Step;
  // export let stepIndex: number;
  export let isFirstItem: boolean = false;
  export let isLastItem: boolean = false;

  export let canPlay: boolean = true;

  let isDuplicateMenuOpen = false;
  $: isOpenClass = isDuplicateMenuOpen ? "is-open" : "";

  let isEditMenuOpen = false;

  const handleOutsideClick = (event: MouseEvent) => {
    const element = event.target as HTMLElement;
    const targetElement = document.getElementById(`open-edit-menu-${step.id}`);
    if (
      isDuplicateMenuOpen &&
      element.id !== `open-edit-menu-${step.id}` &&
      targetElement?.contains(element) === false
    ) {
      if (!element.closest(".is-open")) {
        isDuplicateMenuOpen = false;
      }
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("click", handleOutsideClick);
  }

  const getProcessedCardTextElem = (rawValue: string, step: Step) => {
    const getStyledValue = (value: string) => {
      const styles = [
        "padding-left: 1rem",
        "padding-right: 1rem",
        "padding-top: 0.25rem",
        "padding-bottom: 0.25rem",
        "border-radius: 0.25rem",
        "border-width: 1px",
        "border-color: rgb(209 213 219)",
        "background-color: rgb(248 250 252)",
        "max-width: 13rem",
        "text-overflow: ellipsis",
        "overflow: hidden",
        "white-space: nowrap",
      ];
      return `<span style="${styles.join(";")}">${value}</span>`;
    };
    let processedValue = rawValue
      .replace(/{value}/g, getStyledValue(step.value || "{none}"))
      .replace(/{label}/g, getStyledValue(step.label || "{none}"))
      .replace(/{xpath}/g, getStyledValue(step.xpath || "{none}"));

    if (step.visibility === "hidden" && step.value) {
      let hiddenValue = "";
      for (let i = 0; i < step.value.length; i++) {
        hiddenValue += "*";
      }
      processedValue = processedValue.replace(step.value, hiddenValue);
    }
    return processedValue;
  };

  const dispatch = createEventDispatcher();
  function onPlay() {
    dispatch("play");
  }
  function onDelete() {
    dispatch("delete");
  }
  function onDuplicate() {
    dispatch("duplicate");
    isDuplicateMenuOpen = false;
  }
  function onDuplicateToBottom() {
    dispatch("duplicateToBottom");
    isDuplicateMenuOpen = false;
  }
  function onEdit(e: Event) {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    dispatch("edit", {
      formData,
    });
    isEditMenuOpen = false;
  }
  function onMoveUp() {
    dispatch("moveUp");
  }
  function onMoveDown() {
    dispatch("moveDown");
  }
</script>

<div class="p-1 gap-2 items-center">
  <div
    class="flex items-center border {step &&
      step.status} rounded-3xl shadow flex-auto w-auto text-pretty py-2 px-4"
  >
    <div class="flex items-center gap-2 w-full flex-auto">
      <div class="flex">
        {#if !isFirstItem}
          <button
            on:click={onMoveUp}
            aria-label="Move Up"
            title="Move Up"
            class="opacity-50 hover:opacity-100 transition"
          >
            <ThinArrowUpIcon width={16} height={16} />
          </button>
        {/if}
        {#if !isLastItem}
          <button
            on:click={onMoveDown}
            aria-label="Move Down"
            title="Move Down"
            class="opacity-50 hover:opacity-100 transition"
          >
            <ThinArrowDownIcon width={16} height={16} />
          </button>
        {/if}
      </div>
      {@html getProcessedCardTextElem(
        getStrategy(step.strategy).cardInnerRawHtml,
        step
      )}
    </div>
    <div class="flex gap-2 pl-2 border-l border-l-[#e5e7eb]">
      {#if canPlay}
        <button
          on:click={onPlay}
          class="flex-none opacity-50 hover:opacity-100 hover:text-green-600 transition"
          aria-label="Play from this step"
          title="Play from this step"><PlayDownIcon /></button
        >
      {/if}
      <button
        on:click={() => (isEditMenuOpen = !isEditMenuOpen)}
        class="flex-none opacity-50 hover:opacity-100 hover:text-blue-600 transition"
        aria-label="Edit"
        title="Edit"><EditIcon /></button
      >
      <div class="flex-none relative flex items-center gap-1">
        <button
          on:click={onDuplicate}
          class="opacity-50 hover:opacity-100 transition"
          aria-label="Duplicate"
          title="Duplicate"><DuplicateIcon /></button
        >
        <button
          id={`open-edit-menu-${step.id}`}
          class="opacity-50 hover:opacity-100 transition hover:bg-slate-100 h-full rounded"
          on:click={() => {
            isDuplicateMenuOpen = !isDuplicateMenuOpen;
          }}><ArrowDownIcon width={12} height={12} /></button
        >
        <div
          class="{isOpenClass} opacity-0 absolute hidden whitespace-nowrap flex-col top-7 right-1 bg-slate-100 rounded shadow -z-50 text-sm"
        >
          <button
            on:click={onDuplicate}
            class="flex p-2 text-left transition hover:bg-slate-200"
            >Duplicate</button
          >
          <button
            on:click={onDuplicateToBottom}
            class="flex p-2 text-left transition hover:bg-slate-200"
            >Duplicate to the bottom</button
          >
        </div>
      </div>
      <button
        on:click={onDelete}
        class="flex-none opacity-50 hover:opacity-100 hover:text-red-500 transition"
        aria-label="Delete"
        title="Delete"><TrashcanIcon /></button
      >
    </div>
  </div>
  {#if step && step.error}
    <div
      class="flex flex-col mx-4 p-4 rounded-xl border border-t-0 border-gray-100 shadow"
    >
      <p class="text-red-500">{step.error}</p>
    </div>
  {/if}
  {#if isEditMenuOpen}
    <div
      class="flex flex-col mx-4 p-4 rounded-xl border border-t-0 border-gray-100 shadow"
    >
      <form
        class="w-full flex flex-col gap-2"
        on:submit|preventDefault={onEdit}
      >
        {#each getStrategy(step.strategy).required as { name, label, placeholder, type }}
          {#if type === "text"}
            <label for={name}>{label}</label>
            {#if name === "value" && step.visibility === "hidden"}
              <HiddenInput
                id={name}
                {name}
                value={getStepValueFromKey(name, step)}
              />
            {:else}
              <Input
                id={name}
                {name}
                {type}
                value={getStepValueFromKey(name, step)}
              />
            {/if}
          {:else if type === "checkbox"}
            <div class="flex gap-2">
              <label for={name}>{label}</label>
              <Input
                id={name}
                {name}
                {type}
                checked={getStepValueFromKey(name, step) === "hidden"}
              />
              <p class="opacity-50">{placeholder}</p>
            </div>
          {/if}
        {/each}
        <div class="flex justify-center gap-2">
          <button
            type="submit"
            aria-label="Save"
            title="Save"
            class="bg-black text-white hover:underline py-2 px-4 rounded-3xl"
          >
            Save
          </button>
          <button
            type="button"
            aria-label="Cancel"
            title="Cancel"
            on:click={() => (isEditMenuOpen = false)}
            class="border border-black hover:underline py-2 px-4 rounded-3xl"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  {/if}
</div>

<style>
  .is-open {
    display: flex;
    opacity: 1;
    z-index: 50;
  }

  .success {
    border-color: #34d399;
  }

  .error {
    border-color: #f87171;
  }

  .running {
    border-color: #fbbf24;
  }

  .idle {
    border-color: #6b7280;
  }
</style>
