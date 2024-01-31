<script lang="ts">
  export let name: string;
  export let id: string;
  export let placeholder: string = "";
  export let required: boolean = false;
  export let type: string = "text";

  // checkbox
  export let checked: boolean = false;

  // number
  export let min: number | undefined = undefined;
  export let max: number | undefined = undefined;

  export let value: string | number | undefined = undefined;
</script>

{#if type === "text"}
  <input
    type="text"
    {name}
    {id}
    {placeholder}
    {required}
    bind:value
    class="border border-gray-300 rounded py-2 px-4 bg-slate-50"
  />
{:else if type === "password"}
  <input
    type="password"
    {name}
    {id}
    {placeholder}
    {required}
    bind:value
    class="border border-gray-300 rounded py-2 px-4 bg-slate-50"
  />
{:else if type === "number"}
  <input
    class="border border-gray-300 rounded py-2 px-4 bg-slate-50"
    type="number"
    {name}
    {id}
    {value}
    {required}
    {min}
    {max}
  />
{:else if type === "checkbox"}
  <input type="checkbox" {name} {id} {checked} {required} />
{:else}
  <input
    type="text"
    value="Not supported"
    class="border border-gray-300 rounded py-2 px-4 bg-slate-50 opacity-50"
    disabled
  />
{/if}
