<script lang="ts">
  import { onMount } from "svelte";
  import Container from "../../components/layout/Container.svelte";
  import { type Collection } from "../../lib/collection";
  import { log } from "../../lib/log";
  import { storage } from "../../lib/storage";
  import CollectionsSection from "../../components/sections/CollectionsSection.svelte";
  import DeleteConfirmOverlay from "../../components/sections/DeleteConfirmOverlay.svelte";
  import PopupHeader from "../../components/headers/PopupHeader.svelte";
  import { push } from "svelte-spa-router";
  import { v4 as uuidv4 } from "uuid";
  import ImportIcon from "../../components/icons/ImportIcon.svelte";

  let isConfirmDeleteModalOpen = false;
  let idForConfirmDelete: string = "";

  let collections: { [key: string]: Collection } = {};
  onMount(async () => {
    collections = await storage.getCollections();
  });

  const updateStorageVars = async () => {
    collections = await storage.getCollections();
    log("collections", collections);
  };

  const duplicateCollection = async (id: string | undefined) => {
    const newId = uuidv4();
    await storage.update({
      collections: {
        ...collections,
        [newId]: {
          ...collections[id!],
          id: newId,
        },
      },
    });
    await updateStorageVars();
  };

  const deleteCollection = async (id: string | undefined) => {
    const newCollections = Object.entries(collections).filter(
      ([key, _]) => key !== id
    );
    await storage.update({
      collections: Object.fromEntries(newCollections),
    });
    await updateStorageVars();
  };
  const exportCollection = (id: string | undefined) => {
    const collection = collections[id!];
    const blob = new Blob([JSON.stringify(collection)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${collection.name}.em.json`;
    a.click();
  };
  const importCollection = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const contents = e.target?.result;
          if (typeof contents === "string") {
            let collection = JSON.parse(contents);
            collection.id = uuidv4();
            await storage.update({
              collections: {
                ...collections,
                [collection.id]: collection,
              },
            });
            await updateStorageVars();
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  const addCollection = async () => {
    await storage.addDefaultCollection();
    await updateStorageVars();
  };
  const updateCollectionName = async (id: string, name: string) => {
    await storage.update({
      collections: {
        ...collections,
        [id]: {
          ...collections[id],
          name,
        },
      },
    });
    await updateStorageVars();
  };
</script>

<PopupHeader />
<div class="min-w-[375px] px-4 text-sm">
  <Container>
    <section id="title" class="pb-2">
      <h2 class="text-lg">Select a Collection:</h2>
    </section>
    <section id="extra-btns" class="text-xs">
      <div class="flex">
        <button
          class="flex items-center justify-center gap-1 pl-1 pr-2 py-1 rounded-3xl border shadow bg-black hover:bg-slate-500 transition text-white w-4/12"
          on:click={() => importCollection()}><ImportIcon />Import</button
        >
      </div>
      <!-- <button
      on:click={async () => log("storage", await storage.get())}
      >Print</button> -->
    </section>
    <CollectionsSection
      {collections}
      on:duplicate={(e) => duplicateCollection(e.detail.id)}
      on:delete={(e) => {
        isConfirmDeleteModalOpen = true;
        idForConfirmDelete = e.detail.id;
      }}
      on:export={(e) => exportCollection(e.detail.id)}
      on:nameUpdate={(e) => updateCollectionName(e.detail.id, e.detail.name)}
      on:addCollection={addCollection}
      on:clickOnName={async (e) => {
        await storage.setActiveCollectionId(e.detail.id);
        push("/");
      }}
    />
  </Container>

  {#if isConfirmDeleteModalOpen}
    <DeleteConfirmOverlay
      on:confirm={() => {
        deleteCollection(idForConfirmDelete);
        isConfirmDeleteModalOpen = false;
      }}
      on:cancel={() => (isConfirmDeleteModalOpen = false)}
    >
      <h2 class="text-xl pb-4 font-bold text-center">Delete Collection</h2>
      <p class="text-base pb-4 text-center">
        Are you sure you want to delete this collection?
      </p>
    </DeleteConfirmOverlay>
  {/if}
</div>
