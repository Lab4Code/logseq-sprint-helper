import React, { useRef } from "react";
import { useAppVisible } from "./utils";
import moment from "moment";
import type { Block } from "./types/block";
import { IBatchBlock } from "@logseq/libs/dist/LSPlugin.user";

export type Root = Block[];

type Option = {
  id: string;
  name: string;
  descrption: string;
  active: boolean;
  notCompatibleWith?: string[];
  handler: () => Promise<void>;
};

function Toolbar() {
  function getWeekInfo() {
    const startDate = moment().weekday(1).subtract(1, "days");
    const endDate = moment().weekday(6);
    const sunday = startDate.format("DD.MM.YYYY");
    const saturday = endDate.format("DD.MM.YYYY");
    return {
      startDate,
      endDate,
      sunday,
      saturday,
    };
  }
  async function getWeekPage() {
    const { sunday, saturday } = getWeekInfo();
    const pageName = `${sunday} - ${saturday}`;
    const page = await logseq.Editor.getPage(pageName);
    return page;
  }
  const handleNewNews = async () => {
    const { sunday, saturday } = getWeekInfo();
    let weekPage = await getWeekPage();
    if (weekPage === null) {
      weekPage = await logseq.Editor.createPage(
        `${sunday} - ${saturday}`,
        {},
        {
          format: "markdown",
          createFirstBlock: false,
        }
      );
      if (weekPage === null) {
        throw new Error("page not created");
      }
    }

    const pageBlocks = await logseq.Editor.getPageBlocksTree(weekPage.uuid);
    if (
      pageBlocks.length === 0 ||
      (pageBlocks.length === 1 &&
        pageBlocks[0].content === "" &&
        pageBlocks[0].children?.length === 0)
    ) {
      const newsTemplate = await logseq.Editor.getPage("Template/News");
      if (!newsTemplate) throw new Error("Template not found");
      const newsPageBlocks = await logseq.Editor.getPageBlocksTree(
        newsTemplate.uuid
      );
      for (let i = 0; i < newsPageBlocks.length; i++) {
        const content = newsPageBlocks[i].content
          .split("\n")
          .filter((c) => !c.includes("template"))
          .join("\n");

        const createdBlock = await logseq.Editor.appendBlockInPage(
          weekPage.uuid,
          content
        );

        const children = newsPageBlocks[i].children;
        if (createdBlock && children) {
          for (let j = 0; j < children.length; j++) {
            const child = children[j] as unknown as IBatchBlock;
            const childContent = child.content;
            if (!childContent) throw new Error("child content error");
            logseq.Editor.appendBlockInPage(weekPage.uuid, childContent);
          }
        }
      }
    }
    await handleDynamicTemplate();
    await logseq.Editor.selectBlock(weekPage.uuid);
  };
  const handleDynamicTemplate = async () => {
    const { endDate } = getWeekInfo();

    const page = await getWeekPage();

    if (!page) throw new Error("page not found");

    const pageBlocksTree = await logseq.Editor.getPageBlocksTree(page.uuid);

    const rootBlock = pageBlocksTree[0]!;
    if (!rootBlock) throw new Error("block error");

    const days =
      rootBlock.children?.length ?? 0 > 0
        ? (rootBlock.children as unknown as Root)
        : (pageBlocksTree as unknown as Root);
    if (!days) throw new Error("days error");

    let index = 0;
    for (const day of days) {
      const uuid = day.uuid;
      const content = day.content;
      if (!content) throw new Error("content error");
      if (!content.includes("Good News") && content.includes("###")) {
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
  };
  const handleTopics = async () => {
    console.log("topics");
  };
  const defaultOptions: Option[] = [
    {
      id: "new-news",
      name: "New News",
      descrption: "Create a new news page for the current week, if missing",
      active: false,
      notCompatibleWith: ["dynamic-template", "topics"],
      handler: handleNewNews,
    },
    {
      id: "dynamic-template",
      name: "Dynamic Template",
      descrption: "Fixes the dates from the template if the template is used",
      active: false,
      notCompatibleWith: ["new-news"],
      handler: handleDynamicTemplate,
    },
    // {
    //   id: "topics",
    //   name: "Topics",
    //   descrption:
    //     "Try to get the topics from the text by semantically analyzing it",
    //   active: false,
    //   notCompatibleWith: ["new-news"],
    //   handler: handleTopics,
    // },
  ];
  const innerRef = useRef<HTMLDivElement>(null);
  const [options, setOptions] = React.useState(defaultOptions);
  const visible = useAppVisible();
  function isOptionDisabled(option: Option) {
    const notCompatibleOptions = options.filter(
      (o) => o.notCompatibleWith?.includes(option.id) && o.active
    );
    if (notCompatibleOptions.length > 0) {
      return true;
    }
    return false;
  }

  function updateOptions(option: Option) {
    const newOptions = options.map((o) => {
      const notCompatibleOptions = options.filter(
        (o) => o.notCompatibleWith?.includes(option.id) && o.active
      );
      if (notCompatibleOptions.length > 0) {
        return o;
      } else if (o.id === option.id) {
        o.active = !o.active;
      }
      return o;
    });
    setOptions(newOptions);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedOptions = options.filter((o) => o.active);
    if (selectedOptions.length === 0) {
      return;
    }
    for (const option of selectedOptions) {
      await option.handler();
    }
  };

  const handleClose = () => {
    setOptions(defaultOptions);
    window.logseq.hideMainUI();
  };

  if (visible) {
    return (
      <main
        className="backdrop-filter backdrop-blur-md fixed inset-0 flex items-center justify-center"
        onClick={(e) => {
          const current = innerRef.current;
          if (current !== null && !current.contains(e.target as any)) {
            handleClose();
          }
        }}
      >
        <div
          ref={innerRef}
          className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-7xl mx-auto bg-black text-white p-4"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {options.map((option) => (
              <fieldset key={option.id} className="border rounded-lg p-2">
                <legend className="text-sm font-semibold leading-6">
                  {option.name}
                </legend>
                <div className="flex items-center">
                  <input
                    id={option.id}
                    name={option.id}
                    checked={option.active}
                    disabled={isOptionDisabled(option)}
                    onChange={(e) => {
                      updateOptions(option);
                    }}
                    type="checkbox"
                    className="w-4 h-4 text-green-500 bg-black border-gray-300 rounded focus:ring-0 disabled:border-gray-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <label
                    htmlFor={option.id}
                    className={
                      "ms-2 text-sm leading-6 " +
                      (isOptionDisabled(option)
                        ? "text-gray-500"
                        : "text-white")
                    }
                  >
                    {option.descrption}
                  </label>
                </div>
              </fieldset>
            ))}
            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                className="rounded-md border border-gray-600 px-3 py-2 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }
  return null;
}

export default Toolbar;
