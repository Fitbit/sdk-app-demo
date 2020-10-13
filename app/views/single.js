import document from "document";

/**
 * Single view menu entry
 */

export function update() {
}

export function init() {
  console.log("single-view clicked");
  return document.location.assign('single.view');
}
