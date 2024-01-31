<script lang="ts">
  import PlayIcon from "./PlayIcon.svelte";

  export let width = 24;
  export let height = 24;
</script>

<div class="relative">
  <PlayIcon {width} {height} />
  <span class="absolute -bottom-0.5 right-0">
    <svg
      width={width / 2}
      height={height / 2}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      transform="rotate(0)"
      ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g><g id="SVGRepo_iconCarrier">
        <path
          d="M12 7L12 16"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M8 13L12 17L16 13"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </g></svg
    >
  </span>
</div>
