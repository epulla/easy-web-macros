<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Collection } from "../../lib/collection";
  import CollectionCard from "../cards/CollectionCard.svelte";
  import AddIcon from "../icons/AddIcon.svelte";

  export let collections: { [key: string]: Collection } = {};

  const dispatch = createEventDispatcher();

  // function onPlay(id: string) {
  //   dispatch("play", { id });
  // }
  function onDuplicate(id: string) {
    dispatch("duplicate", { id });
  }
  function onDelete(id: string) {
    dispatch("delete", { id });
  }
  function onExport(id: string) {
    dispatch("export", { id });
  }
  function onNameUpdate(id: string, name: string) {
    dispatch("nameUpdate", { id, name });
  }
  function onAddCollection() {
    dispatch("addCollection");
  }
  function onClickOnName(id: string) {
    dispatch("clickOnName", { id });
  }
</script>

<section id="collections" class="pb-2 flex flex-col">
  <p class="text-sm opacity-50">Ordered alphabetically</p>
  {#each Object.values(collections).toSorted( (a, b) => a.name.localeCompare(b.name) ) as collection}
    <CollectionCard
      {collection}
      on:duplicate={() => onDuplicate(collection.id)}
      on:delete={() => onDelete(collection.id)}
      on:export={() => onExport(collection.id)}
      on:nameUpdate={(e) => onNameUpdate(collection.id, e.detail.name)}
      on:clickOnName={() => onClickOnName(collection.id)}
    ></CollectionCard>
  {/each}
  <div class="p-1 flex justify-center">
    <button
      on:click={onAddCollection}
      aria-label="Add Collection"
      title="Add Collection"
      class="transition opacity-50 hover:opacity-100"><AddIcon /></button
    >
  </div>
</section>
