<script lang="ts">
  import Container from "../../components/layout/Container.svelte";
  import { type Collection } from "../../lib/collection";
  import { storage } from "../../lib/storage";
  import CleanIcon from "../../components/icons/CleanIcon.svelte";
  import Overlay from "../../components/layout/Overlay.svelte";
  import Modal from "../../components/Modal.svelte";
  import Layout from "../../components/layout/Layout.svelte";
  import Input from "../../components/Input.svelte";
  import ButtonLink from "../../components/ButtonLink.svelte";
  import {
    StepStrategyKeys,
    getStrategy,
    strategies,
  } from "../../lib/strategies";
  import type { Step } from "../../lib/step";
  import Title from "../../components/Title.svelte";
  import StepsSection from "../../components/sections/StepsSection.svelte";
  import DeleteConfirmOverlay from "../../components/sections/DeleteConfirmOverlay.svelte";
  import OptionsHeader from "../../components/headers/OptionsHeader.svelte";
  import { log } from "../../lib/log";
  import { v4 as uuidv4 } from "uuid";

  export let params: any = {};
  let collection: Collection;
  let isAddStepModalOpen = false;
  let isConfirmDeleteOneStepModalOpen = false;
  let isConfirmDeleteAllStepsModalOpen = false;
  let idForConfirmDelete: string = "";
  let strategy: string = "";
  let selectedIndexForAddStep: number | undefined = undefined;

  storage.get().then(({ collections }) => {
    collection = collections[params.id];
    // v0.0.2 patch: add numberOfRuns and doesLoopInfinitely (default values) to old collections
    if (collection.numberOfRuns === undefined) {
      storage.updateNumberOfRuns(collection.id, 1);
      storage.getCollection(collection.id).then((collection) => {
        collection = collection;
      });
    }
    if (collection.doesLoopInfinitely === undefined) {
      storage.updateDoesLoopInfinitely(collection.id, false);
      storage.getCollection(collection.id).then((collection) => {
        collection = collection;
      });
    }
    log("collection", collection);
  });

  const reloadStorageVars = async () => {
    collection = (await storage.getCollection(params.id)) as Collection;
  };
  const resetReactiveVars = () => {
    strategy = "";
    isAddStepModalOpen = false;
    selectedIndexForAddStep = undefined;
  };

  const addStep = async (e: Event) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    let isConfidential = formData.get("visibility") ?? "off";
    const step: Step = {
      id: uuidv4(),
      strategy: formData.get(
        "strategy-type"
      ) as (typeof StepStrategyKeys)[number],
      xpath: formData.get("xpath") as string,
      visibility: isConfidential === "on" ? "hidden" : "visible",
      label: formData.get("label") as string,
      value: formData.get("value") as string,
      status: "idle",
    };
    if (selectedIndexForAddStep !== undefined) {
      await storage.insertStepToCollection(
        collection.id,
        step,
        selectedIndexForAddStep
      );
    } else {
      await storage.appendStepToCollection(collection.id, step);
    }
    await reloadStorageVars();
    resetReactiveVars();
  };
  const duplicateStep = async (stepIndex: number) => {
    await storage.duplicateStep(stepIndex, collection.id);
    await reloadStorageVars();
  };
  const duplicateStepToBottom = async (id: string) => {
    await storage.duplicateStepToBottom(id, collection.id);
    await reloadStorageVars();
  };
  const editStep = async (
    id: string,
    stepIndex: number,
    formData: FormData
  ) => {
    const originalStep = collection.steps.find((step) => step.id === id)!;
    let isConfidential = formData.get("visibility") ?? "off";
    const step = {
      ...originalStep,
      xpath: (formData.get("xpath") as string) ?? originalStep.xpath,
      visibility:
        isConfidential === "on"
          ? "hidden"
          : "visible" ?? originalStep.visibility,
      label: (formData.get("label") as string) ?? originalStep.label,
      value: (formData.get("value") as string) ?? originalStep.value,
    } as Step;
    await storage.editStep(step, stepIndex, collection.id);

    await reloadStorageVars();
  };
  const deleteStep = async (id: string) => {
    await storage.deleteStep(id, collection.id);
    await reloadStorageVars();
  };
  const moveStepUp = async (stepIndex: number) => {
    await storage.moveStepUp(stepIndex, collection.id);
    await reloadStorageVars();
  };
  const moveStepDown = async (stepIndex: number) => {
    await storage.moveStepDown(stepIndex, collection.id);
    await reloadStorageVars();
  };
  const removeAllSteps = async () => {
    await storage.update({ stepIndex: 0, playStatus: "idle" });
    await storage.resetActiveCollectionSteps();
    await reloadStorageVars();
  };
</script>

<Layout>
  <OptionsHeader />
  <Container>
    <section id="steps-menu" class="pb-2 flex flex-col">
      <div class="flex flex-col gap-2">
        <span>
          <ButtonLink href="/">
            <span class="text-sm">{"< Back to collections"}</span>
          </ButtonLink>
        </span>
        <Title>Collection: {collection && collection.name}</Title>
        <Title>Steps:</Title>
        <div class="flex flex-row-reverse gap-2">
          <button
            on:click={() => (isConfirmDeleteAllStepsModalOpen = true)}
            class="opacity-50 transition hover:opacity-100 hover:text-gray-600"
            aria-label="Remove all steps"
            title="Remove all steps"
            ><CleanIcon />
          </button>
        </div>
      </div>
    </section>
    {#if collection}
      <div class="text-sm">
        <StepsSection
          {collection}
          canPlay={false}
          on:duplicate={(e) => duplicateStep(e.detail.index)}
          on:duplicateToBottom={(e) => duplicateStepToBottom(e.detail.id)}
          on:edit={(e) =>
            editStep(e.detail.id, e.detail.index, e.detail.formData)}
          on:delete={(e) => {
            isConfirmDeleteOneStepModalOpen = true;
            idForConfirmDelete = e.detail.id;
          }}
          on:moveDown={(e) => moveStepDown(e.detail.index)}
          on:moveUp={(e) => moveStepUp(e.detail.index)}
          on:addStep={() => (isAddStepModalOpen = true)}
          on:addIndexedStep={(e) => {
            isAddStepModalOpen = true;
            selectedIndexForAddStep = e.detail.index;
          }}
        />
      </div>
    {/if}
  </Container>
  {#if isAddStepModalOpen}
    <Overlay>
      <Modal on:close={() => (isAddStepModalOpen = false)}>
        <h2 class="text-xl pb-4 font-bold text-center">Add a step</h2>
        <form
          on:submit|preventDefault={addStep}
          class="text-base flex flex-col gap-2 pt-4"
        >
          <label for="strategy-type">Step Type </label>
          <select
            name="strategy-type"
            id="strategy-type"
            class="border border-gray-300 rounded py-2 px-4 bg-slate-50"
            bind:value={strategy}
            required
          >
            <option disabled selected value>Select an option</option>
            {#each strategies as { key, selectLabel }}
              <option value={key}>{selectLabel}</option>
            {/each}
          </select>

          {#if strategy}
            {#each getStrategy(strategy).required as { name, label, placeholder, type }}
              {#if type === "text"}
                <label for={name}>{label}</label>
                <Input id={name} {name} {placeholder} {type} required />
              {:else if type === "checkbox"}
                <div class="flex gap-2">
                  <label for={name}>{label}</label>
                  <Input id={name} {name} {type} required />
                  <p class="opacity-50">{placeholder}</p>
                </div>
              {/if}
            {/each}
            <div class="flex pt-1 gap-2 justify-center">
              <button
                type="submit"
                aria-label="Save"
                title="Save"
                class="bg-black text-white hover:underline py-2 px-4 rounded-3xl"
              >
                Save
              </button>
              <button
                aria-label="Cancel"
                title="Cancel"
                on:click={() => (isAddStepModalOpen = false)}
                class="border border-black hover:underline py-2 px-4 rounded-3xl"
              >
                Cancel
              </button>
            </div>
          {/if}
        </form>
      </Modal>
    </Overlay>
  {/if}
  {#if isConfirmDeleteOneStepModalOpen}
    <DeleteConfirmOverlay
      on:confirm={async () => {
        await deleteStep(idForConfirmDelete);
        isConfirmDeleteOneStepModalOpen = false;
      }}
      on:cancel={() => (isConfirmDeleteOneStepModalOpen = false)}
    >
      <h2 class="text-xl pb-4 font-bold text-center">Delete Step</h2>
      <p class="text-base pb-4 text-center">
        Are you sure you want to delete this step?
      </p>
    </DeleteConfirmOverlay>
  {/if}
  {#if isConfirmDeleteAllStepsModalOpen}
    <DeleteConfirmOverlay
      on:confirm={async () => {
        await removeAllSteps();
        isConfirmDeleteAllStepsModalOpen = false;
      }}
      on:cancel={() => (isConfirmDeleteAllStepsModalOpen = false)}
    >
      <h2 class="text-sm pb-4 font-bold text-center">Delete All Steps</h2>
      <p class="text-xs pb-4 text-center">
        Are you sure you want to clear/delete all step?
      </p>
    </DeleteConfirmOverlay>
  {/if}
</Layout>
