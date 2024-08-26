<script lang="ts">
  import { onMount } from "svelte";
  import { type Collection } from "../../lib/collection";
  import { defaultStorage, storage } from "../../lib/storage";
  import { log } from "../../lib/log";
  import StepsSection from "../../components/sections/StepsSection.svelte";
  import { push } from "svelte-spa-router";
  import PopupHeader from "../../components/headers/PopupHeader.svelte";
  import ArrowLeftIcon from "../../components/icons/ArrowLeftIcon.svelte";
  import { getDefaultInitialStep, type Step } from "../../lib/step";
  import {
    strategies,
    type StepStrategyKeys,
    getStrategy,
  } from "../../lib/strategies";
  import Overlay from "../../components/layout/Overlay.svelte";
  import Modal from "../../components/Modal.svelte";
  import Input from "../../components/Input.svelte";
  import DeleteConfirmOverlay from "../../components/sections/DeleteConfirmOverlay.svelte";
  import RecordIcon from "../../components/icons/RecordIcon.svelte";
  import PlayIcon from "../../components/icons/PlayIcon.svelte";
  import CleanIcon from "../../components/icons/CleanIcon.svelte";
  import PauseIcon from "../../components/icons/PauseIcon.svelte";
  import { v4 as uuidv4 } from "uuid";

  let isPlaying: boolean;
  let isRecording: boolean;
  let webMacroStepIndex: number;
  let activeCollectionId: string;
  let collections: { [key: string]: Collection } = {};
  $: activeCollection = collections[activeCollectionId];
  // v0.0.2 patch: add numberOfRuns and doesLoopInfinitely (default values) to old collections
  $: if (activeCollection) {
    if (activeCollection.numberOfRuns === undefined) {
      storage.updateNumberOfRuns(activeCollection.id, 1);
      storage.getCollection(activeCollection.id).then((collection) => {
        reloadStorageVars();
      });
    }
    if (activeCollection.doesLoopInfinitely === undefined) {
      storage.updateDoesLoopInfinitely(activeCollection.id, false);
      storage.getCollection(activeCollection.id).then((collection) => {
        reloadStorageVars();
      });
    }
  }

  let skipIdSearch: boolean;
  $: if (skipIdSearch !== undefined) {
    storage.update({ skipIdSearch });
  }

  onMount(async () => {
    if (await storage.isUndefined()) {
      await storage.set(defaultStorage);
    }
    if (await storage.hasMissingKeys()) {
      await storage.updateMissingKeys();
    }
    if (await storage.hasNoCollections()) {
      const newId = await storage.addDefaultCollection();
      await storage.setActiveCollectionId(newId);
    }
    // if (
    //   (await storage.hasNoActiveCollection()) &&
    //   !(await storage.hasNoCollections())
    // ) {
    //   const firstCollectionId = Object.keys(await storage.getCollections())[0];
    //   await storage.setActiveCollectionId(firstCollectionId);
    // }
    await reloadStorageVars();
    if ((await storage.getCollection(activeCollectionId)) === undefined) {
      push("/collections");
    }
  });

  const reloadStorageVars = async () => {
    const {
      isRecording: storageIsRecording,
      playStatus,
      activeCollectionId: storageActiveCollectionId,
      collections: storageCollections,
      skipIdSearch: storageSkipIdSearch,
      stepIndex,
    } = await storage.get();
    isRecording = storageIsRecording;
    isPlaying = playStatus === "playing" || playStatus === "pending";
    skipIdSearch = storageSkipIdSearch;
    activeCollectionId = storageActiveCollectionId;
    collections = storageCollections;
    webMacroStepIndex = stepIndex;
  };

  const sendActionToContentScript = async (action: string) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    // if (!tab) throw new Error("No active tab found");
    if (!tab) return;
    await chrome.tabs.sendMessage(tab.id!, {
      action,
      collectionName: "default",
    });
  };

  const startPlaying = async (index: number) => {
    await storage.update({
      playStatus: "playing",
      stepIndex: index,
      isRecording: false,
      count: 0, // reset count of runs
    });
    await reloadStorageVars();
    await sendActionToContentScript("play");
    window.close();
  };

  const stopPlaying = async () => {
    await storage.update({ playStatus: "idle" });
    await reloadStorageVars();
    await sendActionToContentScript("stopPlaying");
  };

  const startRecording = async () => {
    await storage.update({ isRecording: true, playStatus: "idle" });
    await reloadStorageVars();
    await sendActionToContentScript("startRecording");
    window.close();
  };

  const stopRecording = async () => {
    await storage.update({ isRecording: false });
    await reloadStorageVars();
    await sendActionToContentScript("stopRecording");
    isRecording = false;
  };

  const removeAllSteps = async () => {
    await storage.update({ stepIndex: 0, playStatus: "idle" });
    await storage.resetActiveCollectionSteps();
    await reloadStorageVars();
    await sendActionToContentScript("resetSteps");
  };

  const printStorage = async () => {
    await sendActionToContentScript("printStorage");
  };

  chrome.runtime.onMessage.addListener(async (request, sender) => {
    log("onMessage", request);
    if (request.action === "play") {
      await storage.update({ playStatus: "idle" });
      await reloadStorageVars();
    }
  });

  // ui actions
  let strategy: string = "";
  let selectedIndexForAddStep: number | undefined = undefined;
  let isAddStepModalOpen = false;
  let isConfirmDeleteOneStepModalOpen = false;
  let isConfirmDeleteAllStepsModalOpen = false;
  let idForConfirmDelete: string = "";
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
        activeCollectionId,
        step,
        selectedIndexForAddStep
      );
    } else {
      await storage.appendStepToCollection(activeCollectionId, step);
    }
    await reloadStorageVars();
    resetReactiveVars();
  };
  const duplicateStep = async (stepIndex: number) => {
    await storage.duplicateStep(stepIndex, activeCollectionId);
    await reloadStorageVars();
  };
  const duplicateStepToBottom = async (id: string) => {
    await storage.duplicateStepToBottom(id, activeCollectionId);
    await reloadStorageVars();
  };
  const editStep = async (
    id: string,
    stepIndex: number,
    formData: FormData
  ) => {
    const originalStep = activeCollection.steps.find((step) => step.id === id)!;
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
    await storage.editStep(step, stepIndex, activeCollectionId);

    await reloadStorageVars();
  };
  const deleteStep = async (id: string) => {
    await storage.deleteStep(id, activeCollectionId);
    await reloadStorageVars();
  };
  const moveStepUp = async (stepIndex: number) => {
    await storage.moveStepUp(stepIndex, activeCollectionId);
    await reloadStorageVars();
  };
  const moveStepDown = async (stepIndex: number) => {
    await storage.moveStepDown(stepIndex, activeCollectionId);
    await reloadStorageVars();
  };
</script>

<div class="min-w-[500px] min-h-[200px]">
  <PopupHeader>
    <button
      on:click={async () => {
        await storage.setActiveCollectionId("");
        push("/collections");
      }}
      aria-label="All Collections"
      title="All Collections"
      class="opacity-75 hover:opacity-100"
    >
      <ArrowLeftIcon width={16} height={16} />
    </button>
  </PopupHeader>
  <div class="min-w-[450px] px-4 text-xs">
    <section
      id="action-btns"
      class="sticky top-0 z-40 py-2 text-xs flex flex-col gap-1"
    >
      <div class="flex gap-0.5 bg-slate-50/50">
        {#if isRecording}
          <button
            on:click={stopRecording}
            id="recording-btn"
            class="flex items-center justify-center gap-1 pl-2 pr-3 py-1 rounded-3xl border shadow bg-red-500 hover:bg-red-600 transition text-white w-4/12 animate-pulse"
          >
            <PauseIcon width={20} height={20} />
            Recording
          </button>
        {:else}
          <button
            on:click={startRecording}
            class="flex items-center justify-center gap-1 pl-2 pr-3 py-1 rounded-3xl border shadow bg-red-500 hover:bg-red-600 transition text-white w-4/12"
          >
            <RecordIcon width={20} height={20} />
            Record
          </button>
        {/if}
        {#if isPlaying}
          <button
            on:click={stopPlaying}
            class="flex items-center justify-center gap-1 pl-2 pr-3 py-1 rounded-3xl border shadow bg-green-600 hover:bg-green-700 transition text-white w-4/12 animate-pulse"
          >
            <PauseIcon width={20} height={20} />
            Playing
          </button>
        {:else}
          <button
            on:click={() => startPlaying(0)}
            class="flex items-center justify-center gap-1 pl-2 pr-3 py-1 rounded-3xl border shadow bg-green-600 hover:bg-green-700 transition text-white w-4/12"
          >
            <PlayIcon width={20} height={20} />
            Re-Play
          </button>
        {/if}
        <button
          on:click={() => (isConfirmDeleteAllStepsModalOpen = true)}
          class="flex items-center justify-center gap-1 pl-1 pr-2 py-1 rounded-3xl border shadow bg-slate-400 hover:bg-slate-500 transition text-white w-4/12"
        >
          <CleanIcon width={20} height={20} />
          Remove all
        </button>
        <!-- <button on:click={printStorage}>Print</button> -->
      </div>
      <div class="flex gap-1 px-2">
        <span class="opacity-50">Skip Id search?</span>
        <input
          type="checkbox"
          id="skip-id-search"
          name="skip-id-search"
          bind:checked={skipIdSearch}
        />
        <span class="opacity-50">(recommended)</span>
      </div>
    </section>
    {#if activeCollection}
      <StepsSection
        collection={activeCollection}
        on:play={(e) => {
          startPlaying(e.detail.index);
        }}
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
      ></StepsSection>
    {/if}
  </div>
  {#if isAddStepModalOpen}
    <Overlay>
      <Modal on:close={() => (isAddStepModalOpen = false)}>
        <h2 class="text-sm pb-4 font-bold text-center">Add a step</h2>
        <form
          on:submit|preventDefault={addStep}
          class="text-xs flex flex-col gap-2 pt-4"
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
            {#each getStrategy(strategy).required as { name, label, placeholder, type, required }}
              {#if type === "text"}
                <label for={name}>{label}</label>
                <Input
                  id={name}
                  {name}
                  {placeholder}
                  {type}
                  required={required ?? true}
                />
              {:else if type === "checkbox"}
                <div class="flex gap-2">
                  <label for={name}>{label}</label>
                  <Input id={name} {name} {type} required={required ?? true} />
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
      <h2 class="text-sm pb-4 font-bold text-center">Delete Step</h2>
      <p class="text-xs pb-4 text-center">
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
</div>
