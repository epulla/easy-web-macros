<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Collection } from "../../lib/collection";
  import StepCard from "../cards/StepCard.svelte";
  import AddIcon from "../icons/AddIcon.svelte";
  import ArrowDownIcon from "../icons/ArrowDownIcon.svelte";
  import Input from "../Input.svelte";
  import { storage } from "../../lib/storage";

  export let collection: Collection;
  export let canPlay: boolean = true;
  $: delayBetweenSteps = collection?.delayBetweenSteps;

  const onDelayBetweenStepsChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = parseInt(target.value, 10);
    if (isNaN(value)) {
      return;
    }
    await storage.updateDelayBetweenSteps(collection.id, value);
  };

  const dispatch = createEventDispatcher();
  function onPlay(index: number) {
    dispatch("play", { index });
  }
  function onDuplicate(index: number) {
    dispatch("duplicate", { index });
  }
  function onDuplicateToBottom(id: string) {
    dispatch("duplicateToBottom", { id });
  }
  function onEdit(id: string, index: number, formData: FormData) {
    dispatch("edit", { id, index, formData });
  }
  function onDelete(id: string) {
    dispatch("delete", { id });
  }
  function onMoveUp(index: number) {
    dispatch("moveUp", { index });
  }
  function onMoveDown(index: number) {
    dispatch("moveDown", { index });
  }
  function onAddStep() {
    dispatch("addStep");
  }
  function onAddIndexedStep(index: number) {
    dispatch("addIndexedStep", { index });
  }
</script>

<section id="steps" class="pb-2 flex flex-col justify-center">
  <div class="flex gap-2 items-center py-1">
    <p>Delay between steps:</p>
    <input
      class="border border-gray-300 rounded py-2 px-4 bg-slate-50"
      type="number"
      name="delay"
      id="delay"
      value={delayBetweenSteps}
      on:input={onDelayBetweenStepsChange}
      min={0}
    />
    <p>ms</p>
  </div>
  {#each collection.steps as step, i}
    <div class="relative group w-full">
      <StepCard
        {step}
        {canPlay}
        isFirstItem={i === 0}
        isLastItem={i === collection.steps.length - 1}
        on:play={() => onPlay(i)}
        on:duplicate={() => onDuplicate(i)}
        on:duplicateToBottom={() => onDuplicateToBottom(step.id)}
        on:edit={(e) => onEdit(step.id, i, e.detail.formData)}
        on:delete={() => onDelete(step.id)}
        on:moveDown={() => onMoveDown(i)}
        on:moveUp={() => onMoveUp(i)}
      />
      {#if i !== collection.steps.length - 1}
        <div
          class="w-full justify-center absolute hidden group-hover:flex -mt-3"
        >
          <button
            on:click={() => onAddIndexedStep(i + 1)}
            aria-label="Add Step Below"
            title="Add Step Below"
            class="transition opacity-50 hover:opacity-100 rounded-full hover:text-blue-500 bg-slate-50"
            ><AddIcon width={18} height={18} /></button
          >
        </div>
      {/if}
    </div>
    {#if i !== collection.steps.length - 1}
      <div class="flex justify-center opacity-50">
        <ArrowDownIcon />
      </div>
    {/if}
  {/each}
  <div class="p-1 flex justify-center">
    <button
      on:click={onAddStep}
      aria-label="Add Step"
      title="Add Step"
      class="transition opacity-50 hover:opacity-100 hover:text-blue-500"
      ><AddIcon /></button
    >
  </div>
</section>
