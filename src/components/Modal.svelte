<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import CancelIcon from "./icons/CancelIcon.svelte";

  const dispatch = createEventDispatcher();

  function onClose() {
    dispatch("close");
  }
</script>

<dialog class="rounded-xl bg-white p-4 flex flex-col w-full max-w-xl">
  <article class="w-full">
    <div class="flex flex-row-reverse">
      <button
        class="transition opacity-50 hover:opacity-100"
        aria-label="Close"
        title="Close"
        on:click={onClose}
      >
        <CancelIcon width={18} height={18} />
      </button>
    </div>
    <div class="m-5">
      <slot />
    </div>
  </article>
</dialog>
