import React, { useRef, useState, useEffect } from "react";
import { useAppVisible } from "./utils";
import moment from "moment";
import type { Block } from "./types/block";
import { handleNewNews, getWeekOptions } from "./logseq/news";

export type Root = Block[];

function Toolbar() {
  const innerRef = useRef<HTMLDivElement>(null);
  const [relativeWeekOffset, setRelativeWeekOffset] = useState<number>(0); // 0 = current week
  const [weekOptions, setWeekOptions] = useState<
    { value: number; label: string; isCurrentWeek: boolean }[]
  >([]);
  const visible = useAppVisible();

  // Load week options when component mounts
  useEffect(() => {
    // Get week options from news.ts helper function
    const options = getWeekOptions(12); // 12 weeks before and after current
    setWeekOptions(options);

    // Pre-select current week (value 0)
    setRelativeWeekOffset(0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await handleNewNews(relativeWeekOffset);
    } catch (error) {
      console.error("Error creating/updating news page:", error);
    } finally {
      handleClose();
    }
  };

  const handleClose = () => {
    // Reset to current week when closing
    setRelativeWeekOffset(0);
    window.logseq.hideMainUI();
  };

  if (visible) {
    return (
      <main
        className="backdrop-filter backdrop-blur-md fixed inset-0 flex items-center justify-center z-50"
        onClick={(e) => {
          const current = innerRef.current;
          if (current !== null && !current.contains(e.target as any)) {
            handleClose();
          }
        }}
      >
        <div
          ref={innerRef}
          className="bg-yellow-300 border-[4px] border-black rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full max-w-md mx-auto p-6"
        >
          <h2 className="text-2xl font-black mb-5 text-center uppercase tracking-tight">
            News Week Helper
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <label className="block text-base font-black uppercase mb-2 text-black">
                Select Week
              </label>
              <select
                value={relativeWeekOffset}
                onChange={(e) => setRelativeWeekOffset(Number(e.target.value))}
                className="w-full border-[3px] border-black rounded-none p-2 
                           font-bold appearance-none bg-blue-100
                           focus:outline-none focus:ring-0 focus:border-black"
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.7rem top 50%",
                  backgroundSize: "0.7rem auto",
                }}
              >
                {weekOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="mt-3 text-sm font-bold border-l-4 border-black pl-2 py-1">
                Creates or updates a news page for the selected week.
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                className="px-5 py-2 text-base font-bold bg-white border-[3px] border-black 
                          shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase
                          hover:translate-y-[1px] hover:translate-x-[1px] 
                          hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                          active:translate-y-[3px] active:translate-x-[3px] active:shadow-none
                          transition-all duration-100"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-base font-bold text-white bg-blue-500 border-[3px] border-black 
                          shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase
                          hover:translate-y-[1px] hover:translate-x-[1px] 
                          hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                          active:translate-y-[3px] active:translate-x-[3px] active:shadow-none
                          transition-all duration-100"
              >
                Create Page
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
