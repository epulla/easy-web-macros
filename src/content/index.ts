import { log } from "../lib/log";
import { sleep } from "../lib/sleep";
import { runSteps } from "../lib/runner";
import { storage, type IStorage } from "../lib/storage";
import { createXPathFromElement } from "../lib/xpath";

import { v4 as uuidv4 } from "uuid";

// Content scripts
// https://developer.chrome.com/docs/extensions/mv3/content_scripts/

// Some global styles on the page
// import "../tailwind.css";
import "./styles.css";
import type { Step } from "../lib/step";

// Storage vars
let storageData: IStorage | undefined = undefined;
const reloadStorageData = async () => {
  storageData = await storage.get();
};

const onScriptLoad = async () => {
  // if page has changed before finishing running a collection, then continue running steps
  log("onScriptLoad");
  const { playStatus, activeCollectionId } = await storage.get();
  if (playStatus === "pending") {
    await storage.update({ playStatus: "playing" });
    await sleep(50);
    const stepsRunStatus = await runSteps();
    if (stepsRunStatus === "success") {
      await storage.update({ playStatus: "idle" });
    }
  }
  if (!activeCollectionId) {
    await storage.update({ activeCollectionId: "default" });
  }
  await reloadStorageData();
};

onScriptLoad();

// if page starts to get unloaded, then set a flag to let the content script
// know that the page has changed so that it can stop running the steps
window.onbeforeunload = (event) => {
  storage.get(["playStatus"]).then(({ playStatus }) => {
    if (playStatus === "playing") {
      storage.update({ playStatus: "pending" });
    }
  });
};

//// Extension Listeners
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (sender.tab) {
    log("Message from a content script (not useful):", sender.tab.url);
    return;
  }

  if (request.action === "play") {
    log("Playing steps from collection:", request.collectionName);
    try {
      // await storage.update({ playStatus: "playing" });
      const collectionRunStatus = await runSteps();
      log("stepsRunStatus", collectionRunStatus);
      if (collectionRunStatus === "success") {
        await storage.update({ playStatus: "idle" });
      }
      chrome.runtime.sendMessage({
        action: "play",
        status: collectionRunStatus,
      });
    } catch (error) {
      log("Error playing steps", error);
      // chrome.runtime.sendMessage({ action: "play", status: "error", error });
    }
  }

  log("Action from the extension:", request.action);
  if (request.action === "printStorage") {
    log("storage from printStorage", await storage.get());
  }
  await reloadStorageData();
});

//// Page Listeners
const btns = document.querySelectorAll(
  "button, [role='button'], [role='treeitem'], input[type='submit']"
);
btns.forEach((btn) => {
  btn.addEventListener("mousedown", async (e) => {
    if ((await storage.get()).isRecording) {
      // target element xpath extraction
      const target = e.target as HTMLElement;
      const path = createXPathFromElement(
        target,
        (await storage.get()).skipIdSearch
      );
      if (!path) {
        log("No path found for element", target);
        return;
      }
      await storage.appendStepToCollection(
        await storage.getActiveCollectionId(),
        {
          id: uuidv4(),
          xpath: path,
          strategy: "ButtonClick",
          visibility: "visible",
          status: "idle",
          label: (e.target as HTMLElement).innerText
            ? (e.target as HTMLElement).innerText
            : (e.target as HTMLElement).id ?? "button",
        } as Step
      );
    }
  });
});

const submits = document.querySelectorAll("input[type='submit']");
submits.forEach((submit) => {
  submit.addEventListener("click", async (e) => {
    if ((await storage.get()).isRecording) {
      // target element xpath extraction
      const target = e.target as HTMLElement;
      const path = createXPathFromElement(
        target,
        (await storage.get()).skipIdSearch
      );
      if (!path) {
        log("No path found for element", target);
        return;
      }
      await storage.appendStepToCollection(
        await storage.getActiveCollectionId(),
        {
          id: uuidv4(),
          xpath: path,
          strategy: "ButtonClick",
          visibility: "visible",
          status: "idle",
          label: (e.target as HTMLElement).innerText
            ? (e.target as HTMLElement).innerText
            : (e.target as HTMLElement).id ?? "button",
        } as Step
      );
    }
  }); 
})

const inputs = document.querySelectorAll(
  "input[type='text'], input[type='password'], textarea"
);
inputs.forEach((input) => {
  input.addEventListener("input", async (e) => {
    if ((await storage.get()).isRecording) {
      // target element xpath extraction
      const target = e.target as HTMLInputElement;
      const path = createXPathFromElement(
        target,
        (await storage.get()).skipIdSearch
      );
      if (!path) {
        log("No path found for element", target);
        return;
      }
      await storage.appendStepToCollection(
        await storage.getActiveCollectionId(),
        {
          id: uuidv4(),
          xpath: path,
          strategy: "InputSendKeys",
          value: target.value,
          visibility: target.type === "password" ? "hidden" : "visible",
          status: "idle",
          label: target.name ?? target.placeholder ?? target.id ?? "input",
        } as Step,
        true
      );
    }
  });
});

const links = document.querySelectorAll("a");
links.forEach((link) => {
  link.addEventListener("click", async (e) => {
    if ((await storage.get()).isRecording) {
      // target element xpath extraction
      const target = e.target as HTMLElement;
      const path = createXPathFromElement(
        target,
        (await storage.get()).skipIdSearch
      );
      if (!path) {
        log("No path found for element", target);
        return;
      }
      await storage.appendStepToCollection(
        await storage.getActiveCollectionId(),
        {
          id: uuidv4(),
          xpath: path,
          strategy: "AClick",
          visibility: "visible",
          status: "idle",
          label:
            (e.target as HTMLAnchorElement).innerHTML ??
            (e.target as HTMLElement).id ??
            (e.target as HTMLAnchorElement).href ??
            "link",
        } as Step
      );
    }
  });
});
