import document from "document";

/**
 * Handlers for the tile list buttons. Each button navigates to a different scenario
 * involving multiple views.
 */
const buttonCallbacks = [
  ["single-view/start",   () => import("./views/single")],
  ["session-view/start",  () => import("./views/session")],
  ["cycle-views/start",   () => import("./views/cycle")],
];

/**
 * Assign button click handlers for all items in the menu. The view's
 * associated JavaScript is loaded and executed, and the new view is loaded on
 * top of the current one.
 */
buttonCallbacks.forEach((view) => {
  const [buttonID, viewJSLoader] = view;

  document.getElementById(buttonID).addEventListener("click", () => {
    viewJSLoader().then(({ init, update }) => {
      init().then(update).catch((err) => {
        console.error(`Error loading view: ${err.message}`);
      });
    }).catch((err) => {
      console.error(`Failed to load view JS: ${buttonID} - ${err.message}`);
    });
  });
});
