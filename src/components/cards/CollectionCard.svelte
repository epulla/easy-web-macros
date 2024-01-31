<script lang="ts">
  import { push } from "svelte-spa-router";
  import type { Collection } from "../../lib/collection";
  import PlayIcon from "../icons/PlayIcon.svelte";
  import DuplicateIcon from "../icons/DuplicateIcon.svelte";
  import TrashcanIcon from "../icons/TrashcanIcon.svelte";
  import { createEventDispatcher } from "svelte";
  import EditIcon from "../icons/EditIcon.svelte";
  import CheckIcon from "../icons/CheckIcon.svelte";
  import CancelIcon from "../icons/CancelIcon.svelte";
  import ExportIcon from "../icons/ExportIcon.svelte";

  export let collection: Collection;

  let isEditing = false;

  const handleClickEditName = (isEditingValue: boolean) => {
    isEditing = isEditingValue;
    if (isEditing) {
      document.getElementById(`${collection.id}-editing-group`)!.style.display =
        "flex";
      document.getElementById(
        `${collection.id}-non-editing-group`
      )!.style.display = "none";
      document.getElementById(`${collection.id}-name`)?.focus();
    } else {
      document.getElementById(`${collection.id}-editing-group`)!.style.display =
        "none";
      document.getElementById(
        `${collection.id}-non-editing-group`
      )!.style.display = "flex";
      document.getElementById(`${collection.id}-name`)?.focus();
    }
  };

  const dispatch = createEventDispatcher();

  // function onPlay() {
  //   dispatch("play");
  // }
  function onDuplicate() {
    dispatch("duplicate");
  }
  function onDelete() {
    dispatch("delete");
  }
  function onExport() {
    dispatch("export");
  }
  function onNameUpdate() {
    dispatch("nameUpdate", { name: collection.name });
    handleClickEditName(false);
  }
  function onClickOnName() {
    dispatch("clickOnName");
  }
</script>

<div class="p-1 flex gap-2 items-center text-sm">
  <div
    class="flex items-center border rounded-3xl shadow flex-auto w-auto text-pretty py-2 px-4"
  >
    <div class="w-full flex-auto">
      <div id={`${collection.id}-editing-group`} class="hidden gap-1">
        <input
          id={`${collection.id}-name`}
          class="border border-[#e5e7eb] w-auto"
          type="text"
          bind:value={collection.name}
        />
        <button
          class="opacity-50 transition hover:opacity-100 hover:text-green-600"
          on:click={() => onNameUpdate()}
          ><CheckIcon width={12} height={12} /></button
        >
        <button
          class="opacity-50 transition hover:opacity-100 hover:text-red-500"
          on:click={() => handleClickEditName(false)}
          ><CancelIcon width={12} height={12} /></button
        >
      </div>
      <div id={`${collection.id}-non-editing-group`} class="flex gap-1 group">
        <button
          title={`Edit Collection '${collection.name}'`}
          class="text-left hover:text-blue-500 hover:underline"
          on:click={onClickOnName}
        >
          {collection.name}
        </button>
        <button
          title="Edit Collection Name"
          class="hidden group-hover:block opacity-50 transition hover:opacity-100"
          on:click={() => handleClickEditName(true)}
          ><EditIcon width={12} height={12} /></button
        >
      </div>
    </div>
    <div class="flex gap-2 pl-2 border-l border-l-[#e5e7eb]">
      <!-- <button
        on:click={onPlay}
        class="flex-none opacity-50 hover:opacity-100 hover:text-green-600 transition"
        aria-label="Play"
        title="Play"><PlayIcon /></button
      > -->
      <button
        on:click={onDuplicate}
        class="flex-none opacity-50 hover:opacity-100 transition"
        aria-label="Duplicate"
        title="Duplicate"><DuplicateIcon /></button
      >
      <button
        on:click={onDelete}
        class="flex-none opacity-50 hover:opacity-100 hover:text-red-500 transition"
        aria-label="Delete"
        title="Delete"><TrashcanIcon /></button
      >
      <button
        on:click={onExport}
        class="flex-none opacity-50 hover:opacity-100 hover:text-blue-400 transition"
        aria-label="Import"
        title="Import"><ExportIcon /></button
      >
    </div>
  </div>
</div>
