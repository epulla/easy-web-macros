import Router from "./Router.svelte";
import "../tailwind.css";

// Options
// https://developer.chrome.com/docs/extensions/mv3/options/

function render() {
  const target = document.getElementById("app");

  if (target) {
    new Router({ target, props: {} });
  }
}

document.addEventListener("DOMContentLoaded", render);
