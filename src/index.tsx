import "@logseq/libs";

import React from "react";
import * as ReactDOM from "react-dom/client";
import Toolbar from "./toolbar";
import "./index.css";

function main() {
  const root = ReactDOM.createRoot(document.getElementById("app")!);

  root.render(
    <React.StrictMode>
      <Toolbar />
    </React.StrictMode>
  );

  function createModel() {
    return {
      show() {
        logseq.showMainUI();
      },
    };
  }

  logseq.provideModel(createModel());
  logseq.setMainUIInlineStyle({
    zIndex: 11,
  });

  const openIconName = "open-news-week-helper";
  logseq.App.registerUIItem("toolbar", {
    key: openIconName,
    template: `
      <a data-on-click="show" class="button cursor-pointer group">
        <svg  xmlns="http://www.w3.org/2000/svg" width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="w-5 h-5 icon icon-tabler icons-tabler-outline icon-tabler-calendar-week"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M4 11h16" /><path d="M8 14v4" /><path d="M12 14v4" /><path d="M16 14v4" /></svg>
      </a>
    `,
  });
}

logseq.ready(main).catch(console.error);
