import document from "document";

/**
 * Cycle views menu entry
 */

const NUM_CYCLE_VIEWS = 3;

let cycleCurrent;
let cycleViewsLoaded;

function cycleToView(pos) {
  /* Validate input */
  if (pos != -1 && pos != 1) {
    return;
  }

  /* When at either edge of the cycle array, return immediately. */
  if ((pos > 0 && cycleCurrent == NUM_CYCLE_VIEWS - 1) ||
      (pos < 0 && cycleCurrent == 0)) {
    return;
  }

  cycleCurrent += pos;

  /* Go to previous view */
  if (pos < 0) {
    document.history.back();
    return;
  }

  /**
   * Lazy initialize the view. Note that event handlers are invalidated after when calling
   * `document.location.assign()`, but will be set back in `update()`
   */
  if (cycleViewsLoaded[cycleCurrent] == false) {
    document.location.assign(`cycle${cycleCurrent}.view`).then(update);
    cycleViewsLoaded[cycleCurrent] = true;
  } else {
    document.history.forward();
  }

}

export function update() {
  document.getElementById("btn-prev").addEventListener("click", () => {
    console.log("btn-prev clicked");
    cycleToView(-1);
  });

  document.getElementById("btn-next").addEventListener("click", () => {
    console.log("btn-next clicked");
    cycleToView(1);
  });

  document.onbeforeunload = (evt) => {
    console.log("onbeforeunload called");
    evt.preventDefault();
    document.history.go(-cycleCurrent - 1);
    document.onbeforeunload = undefined;
  }
}

export function init() {
  console.log("cycle-views start");
  cycleCurrent = 0;
  cycleViewsLoaded = [true, false, false];
  return document.location.assign(`cycle${cycleCurrent}.view`);
}
