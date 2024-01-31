import { log } from "./log";
import { sleep } from "./sleep";
import { storage } from "./storage";
import { getStrategy } from "./strategies";
import { lookupElementByXPath } from "./xpath";

export const runSteps = async () => {
  let el;
  const { collections, stepIndex, activeCollectionId } = await storage.get();
  const collection = collections[activeCollectionId];
  let i = stepIndex;
  log("Running steps from index: ", stepIndex);
  while (
    i < collection.steps.length &&
    (await storage.get()).playStatus === "playing"
  ) {
    const step = collection.steps[i];
    // remove the triggering class from the previous element and add the triggered class
    if (el !== undefined && el !== null) {
      try {
        el.classList.remove("easy-web-macros-triggering");
        el.classList.add("easy-web-macros-triggered");
      } catch (error) {
        log("Error removing triggering class from element", error);
      }
    }

    // if the previous step wasn't set to sucess after running, then set it to success
    if (i !== 0 && collection.steps[i - 1].status === "running") {
      const previousId = collection.steps[i - 1].id;
      await storage.updateStepStatus("success", activeCollectionId, previousId);
    }

    const { xpath, strategy, value } = step;
    log(
      `Running step:\nxpath: ${xpath}\nstrategy: ${strategy}\nvalue: ${value}`
    );
    try {
      await storage.updateStepStatus("running", activeCollectionId, step.id);
      const nodeEl = lookupElementByXPath(xpath ?? "");
      if (nodeEl === undefined || nodeEl === null) {
        throw new Error("Element not found");
      }
      el = nodeEl as HTMLElement;
      el.classList.add("easy-web-macros-triggering");
      getStrategy(strategy).func(el, value ?? "");
      // if (strategy === "Goto" || strategy === "Opentabto") {
      //   // the upper for loop has to change to a while loop with a condition that checks if the playStatus is pending
      //   await storage.update({ playStatus: "pending" });
      // }
      await storage.updateStepStatus("success", activeCollectionId, step.id);
      i++;
    } catch (error) {
      await storage.update({ playStatus: "idle" });
      await storage.updateStepStatus(
        "error",
        activeCollectionId,
        step.id,
        error as Error
      );
      log("Error running step", error);
      return "error";
    }

    await sleep(50); // wait for the window.onbeforeunload to be called

    // if an user event has changed the page, then stop running steps and save the current step index + 1
    // so that the next time the page loads, it will continue running the steps from that index
    // i.e. if the user clicks on a link, then the page will change and the steps will stop running
    if ((await storage.get()).playStatus === "pending") {
      await storage.update({ stepIndex: i + 1 });
      return "pending";
    }

    await sleep(collection.delayBetweenSteps);
  }
  return "success";
};
