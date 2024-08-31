import React, { useRef, useState } from "react";
import { useAppVisible } from "./utils";
import moment from "moment";

export type Root = Block[];

export interface Block {
  properties: Properties;
  parent: Parent;
  children: Block[];
  id: number;
  pathRefs: PathRef[];
  propertiesTextValues?: PropertiesTextValues;
  level: number;
  uuid: string;
  content: string;
  page: Page;
  propertiesOrder: string[];
  left: Left;
  format: string;
  refs?: Ref[];
}

export interface Properties {
  backgroundColor?: string;
  heading: number;
}

export interface Parent {
  id: number;
}

export interface PathRef {
  id: number;
}

export interface PropertiesTextValues {
  backgroundColor: string;
}

export interface Page {
  id: number;
}

export interface Left {
  id: number;
}

export interface Ref {
  id: number;
}

function App() {
  const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentPage = await logseq.Editor.getCurrentPage();
    const name = currentPage?.originalName as string | null;
    if (!name) throw new Error("page error");

    const [start, end] = name.split(" - ");
    const startDate = moment(start, "DD.MM.YYYY");
    const endDate = moment(end, "DD.MM.YYYY");

    const pageBlocksTree = await logseq.Editor.getCurrentPageBlocksTree();
    const rootBlock = pageBlocksTree[0]!;
    if (!rootBlock) throw new Error("block error");

    const days = rootBlock.children as unknown as Root;
    if (!days) throw new Error("days error");

    let index = 0;
    for (const day of days) {
      const uuid = day.uuid;
      const content = day.content;
      if (!content) throw new Error("content error");
      if (!content.includes("Good News")) {
        const dayDate = endDate
          .clone()
          .subtract(index, "days")
          .format("DD.MM.YYYY");
        if (content.includes(dayDate)) {
          throw new Error("already updated");
        }
        const newContent = content.replace(/(\w+), /, `[[\$1, ${dayDate}]]`);
        index++;
        await logseq.Editor.updateBlock(uuid, newContent);
      }
    }
    window.logseq.hideMainUI();
  };

  if (visible) {
    return (
      <main
        className="backdrop-filter backdrop-blur-md fixed inset-0 flex items-center justify-center"
        onClick={(e) => {
          const current = innerRef.current;
          if (current !== null && !current.contains(e.target as any)) {
            window.logseq.hideMainUI();
          }
        }}
      >
        <div
          ref={innerRef}
          className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-md mx-auto bg-white p-4"
        >
          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend className="text-sm font-semibold leading-6 text-gray-900">
                News Week helper
              </legend>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                If you are on the news page right now, with the template in use,
                this will update the dates for the current week.
              </p>
            </fieldset>
            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                className="text-sm font-semibold leading-6 text-gray-900"
                onClick={() => window.logseq.hideMainUI()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Run
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }
  return null;
}

export default App;
