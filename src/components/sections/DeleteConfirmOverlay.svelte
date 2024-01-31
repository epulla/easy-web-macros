<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Modal from "../Modal.svelte";
  import Overlay from "../layout/Overlay.svelte";

  const dispatch = createEventDispatcher();

  function onConfirm() {
    dispatch("confirm");
  }
  function onCancel() {
    dispatch("cancel");
  }
</script>

<Overlay>
  <Modal on:close={onCancel}>
    <slot />
    <div class="flex pt-1 gap-2 justify-center">
      <button
        type="button"
        on:click={onConfirm}
        aria-label="Delete"
        title="Delete"
        class="bg-black text-white hover:underline py-2 px-4 rounded-3xl"
      >
        Delete
      </button>
      <button
        aria-label="Cancel"
        title="Cancel"
        on:click={onCancel}
        class="border border-black hover:underline py-2 px-4 rounded-3xl"
      >
        Cancel
      </button>
    </div>
  </Modal>
</Overlay>
