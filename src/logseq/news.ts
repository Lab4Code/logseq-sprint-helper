import moment from "moment";
import { IBatchBlock, PageEntity } from "@logseq/libs/dist/LSPlugin.user";

const config = {
    startDay: 0, // Sunday
    endDay: 6, // Saturday
}

// Template configuration with day colors
const templateConfig = {
    properties: {
        'page-type': 'news',
        author: '',
        topics: ''
    },
    days: [
        { name: 'Good News', color: 'green', isDay: false },
        { name: 'Sat', color: 'yellow', isDay: true, day: 6 },
        { name: 'Fri', color: 'red', isDay: true, day: 5 },
        { name: 'Thu', color: 'pink', isDay: true, day: 4 },
        { name: 'Wed', color: 'blue', isDay: true, day: 3 },
        { name: 'Tue', color: 'purple', isDay: true, day: 2 },
        { name: 'Mon', color: 'gray', isDay: true, day: 1 },
        { name: 'Sun', color: '', isDay: true, day: 0 },
    ]
};


export function getWeekInfo(weekNumber: number, year: number) {

    // If weekNumber is set, use that week, otherwise use current week
    const currentDate = moment();
    // Use specified year or current year
    const targetYear = year || currentDate.year();
    const targetDate = weekNumber
        ? moment().year(targetYear).week(weekNumber).startOf('week')
        : currentDate;

    // Get to Sunday (0) of the current week
    const startDate = targetDate.clone().day(config.startDay); // Sunday of current week

    // Get Saturday (6) of the SAME week (not next week)
    const endDate = startDate.clone().add(config.endDay, "days"); // Saturday is 6 days after Sunday

    const startDay = startDate.format("DD.MM.YYYY");
    const endDay = endDate.format("DD.MM.YYYY");

    return {
        startDate,
        endDate,
        startDay,
        endDay,
    };
}

/**
 * Generate week options for the dropdown in the UI
 * @param range How many weeks before and after current week to include
 * @returns Array of week options with value, label, and isCurrentWeek flag
 */
export function getWeekOptions(range: number = 12) {
    const options = [];
    const currentDate = moment();

    for (let i = -range; i <= range; i++) {
        // Calculate the target week and year
        const targetDate = moment().add(i, 'weeks');
        const targetWeek = targetDate.week();
        const targetYear = targetDate.year();

        // Use getWeekInfo for consistent date formatting and calculation
        const { startDay, endDay } = getWeekInfo(targetWeek, targetYear);

        options.push({
            value: i,
            label: i === 0
                ? `Current Week (${startDay} - ${endDay})`
                : `${startDay} - ${endDay}`,
            isCurrentWeek: i === 0
        });
    }

    return options;
}

export async function getNewsWeekPage(weekNumber: number, year: number) {
    const { startDay, endDay } = getWeekInfo(weekNumber, year);
    const pageName = `${startDay} - ${endDay}`;
    const page = await logseq.Editor.getPage(pageName);
    return page;
}


const createNewsTemplate = async (startDate: moment.Moment, page: PageEntity) => {
    const blocks = await logseq.Editor.getPageBlocksTree(page.uuid)
    if (blocks[0]?.content === "") {
        await logseq.Editor.updateBlock(blocks[0].uuid,
            "",
            { properties: templateConfig.properties }
        )
    } else if (blocks.length === 0 || !blocks[0]?.content?.includes("page-type")) {
        await logseq.Editor.prependBlockInPage(page.uuid,
            "",
            { properties: templateConfig.properties }
        )
    } else {
        console.warn("Template already exists");
        return;
    }

    let currentDay = startDate;
    for (const day of templateConfig.days) {
        let content = ""
        if (day.isDay && day.day !== undefined) {
            currentDay = currentDay.clone().day(day.day);
            const dateStr = currentDay.format("DD.MM.YYYY");
            content = `### **[[${day.name}, ${dateStr}]]**`;
        } else {
            content = `### **[[${day.name}]]**`;
        }
        const prop = day.color ? {
            "background-color": day.color
        } : {}
        await logseq.Editor.appendBlockInPage(page.uuid, content, {
            properties: prop
        });
    }

}


export const initializeWeeklyNewsPage = async (weekNumber: number, year: number) => {
    const { startDay, endDay } = getWeekInfo(weekNumber, year);
    let weekPage = await getNewsWeekPage(weekNumber, year);
    if (weekPage === null) {
        weekPage = await logseq.Editor.createPage(
            `${startDay} - ${endDay}`,
            {},
            {
                format: "markdown",
                createFirstBlock: false,
                redirect: false
            }
        );
        if (weekPage === null) {
            throw new Error("page not created");
        }
    }
    return weekPage;
};


export const handleNewNews = async (weekOffset: number = 0) => {
    // Calculate the target week based on current week plus offset
    const targetDate = moment().add(weekOffset, 'weeks');
    const targetWeek = targetDate.week();
    const targetYear = targetDate.year();

    const { startDate } = getWeekInfo(targetWeek, targetYear);

    // Create or update the news week page
    const weekPage = await initializeWeeklyNewsPage(targetWeek, targetYear);
    // Get page reference and template it if it exists
    await createNewsTemplate(startDate, weekPage);
    setTimeout(() => logseq.App.pushState('page', { name: weekPage.name }), 500);
};