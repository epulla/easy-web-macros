<script lang="ts">
  import { log } from "../lib/log";
  import Input from "./Input.svelte";
  import EyeIcon from "./icons/EyeIcon.svelte";

  export let name: string;
  export let id: string;
  export let placeholder: string = "";

  export let value = "";

  let isPasswordVisible = false;
  $: type = isPasswordVisible ? "text" : "password";
</script>

<div class="flex">
  <Input {name} {id} {placeholder} {type} {value} />
  <button
    type="button"
    aria-label="Toggle password visibility"
    title="Toggle password visibility"
    on:click={() => (isPasswordVisible = !isPasswordVisible)}
    class="opacity-50 hover:opacity-100 transition bg-slate-50 hover:bg-white border border-gray-300 rounded p-1"
  >
    <EyeIcon />
  </button>
</div>
