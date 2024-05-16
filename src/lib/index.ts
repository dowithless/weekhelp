import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);

// YYYY-ww.md
// eg: 2024-05.md
export function getCurrentWeekFileName() {
  const name = dayjs().format("YYYY-ww");

  return `${name}.md`;
}
