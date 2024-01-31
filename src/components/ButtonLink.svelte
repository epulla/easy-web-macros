<script lang="ts">
  import { push } from "svelte-spa-router";
  export let href;
</script>

<button
  on:click={() => push(href)}
  class="hover:underline text-blue-500 text-left"
>
  <slot />
</button>
