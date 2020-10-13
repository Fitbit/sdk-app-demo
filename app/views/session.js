import clock from "clock";
import document from "document";

/**
 * Session view menu entry
 */

/**
 * Delta between the toggle click event is sent out, and the toggle value actually updates.
 **/
const TOGGLE_VALUE_DELAY_MS = 300;
/**
 * Leave some room to observe the view coming back when backswipe is canceled. Not mandatory.
 */
const VIEW_RESET_DELAY_MS = 200;

let sessionBackswipeCallback = undefined;
let sessionStart = undefined;
let sessionResult = "00:00:000"
let durationText = undefined;

function resetSession() {
  /* Reset internal session variables */
  sessionStart = undefined;
  clock.ontick = undefined;
}

function sessionDurationUpdate() {
  if (durationText === undefined) {
    return;
  }

  const now = new Date();
  const millis = now - sessionStart;
  const secs = Math.floor(millis / 1000);
  const mins = Math.floor(secs / 60);
  durationText.text = [`0${mins}`.slice(-2), `0${secs}`.slice(-2), millis % 1000].join(':');
}

function updateFinishView() {
  /* When this view exits, we want to restore the document.onbeforeunload handler */
  document.onunload = () => {
    document.onbeforeunload = sessionBackswipeCallback;
  }

  /* Finishing the session will reload the view. Update just the last session duration. */
  document.getElementById("btn-finish").addEventListener("click", () => {
    console.log("Finishing session");

    /* Final updates */
    sessionDurationUpdate();
    sessionResult = durationText.text;

    resetSession();
    document.history.back(); /* we know that this is the topmost view */

    /*
     * NOTE: The side-effect is that the forward view stack history is cleared and the views are
     * unloaded.
     */
    document.location.replace("session.view").then(update).catch((err) => {
      console.error(`Error returning to session view - ${err.message}`);
    });
  });

  /**
   * Hitting cancel will go back to the previous view, which doesn't unload the current one. We also
   * don't want to replace the previous view (session), but we need to re-set the document backswipe
   * handler, since it's been cleared when loading this view.
   */
  document.getElementById("btn-cancel").addEventListener("click", () => {
    document.history.back(); /* We know that this is the topmost view */
    document.onbeforeunload = sessionBackswipeCallback;
  });
}

export function update() {
  const sessionToggle = document.getElementById("session-toggle");
  /* Display of the current session time. */
  durationText = document.getElementById("duration");
  durationText.text = sessionResult;

  /* Session start / stop logic */
  sessionToggle.addEventListener("click", () => {
    setTimeout(() => {
      if (sessionToggle.value == false) {
        resetSession();
        document.onbeforeunload = undefined;
        return;
      }

      sessionStart = new Date();
      durationText.text = "00:00:000";

      clock.granularity = "seconds";
      clock.ontick = sessionDurationUpdate;

      document.onbeforeunload = (evt) => {
        console.log("onbeforeunload called");
        evt.preventDefault();

        const background = document.getElementById("background");
        const animateToggle = document.getElementById("animate-toggle");

        if (animateToggle.value == true) {
          console.log("resetting view with animation");
          background.animate("enable");
        } else {
          console.log("resetting view directly");
          background.x = 0;
        }

        /* save the old session handling, we'll need it in case session is not finished */
        sessionBackswipeCallback = document.onbeforeunload;

        /* leave some time for the animation to happen, then load the new view */
        setTimeout(() => {
          document.location.assign('session-finish.view').then(updateFinishView).catch((err) => {
            console.error(`Error loading finish view - ${err.message}`);
          });
        }, VIEW_RESET_DELAY_MS);
      }
    }, TOGGLE_VALUE_DELAY_MS);
  });
};

export function init() {
  console.log("session-view start");
  return document.location.assign('session.view');
}
