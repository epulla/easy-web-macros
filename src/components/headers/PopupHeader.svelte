<script lang="ts">
  import MaximizeIcon from "../icons/MaximizeIcon.svelte";

  const onMaximize = () => {
    chrome.runtime.openOptionsPage();
  };
</script>

<header
  class="w-full px-5 py-2 bg-black text-white shadow-xl flex justify-between text-base"
>
  <div class="flex"><slot /></div>
  <button
    aria-label="Maximize"
    title="Maximize"
    class="opacity-75 hover:opacity-100"
    on:click={onMaximize}
  >
    <MaximizeIcon width={16} height={16} />
  </button>
</header>
