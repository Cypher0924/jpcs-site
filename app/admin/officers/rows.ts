// the lineup is stored as "row breaks" (end a row after these 0-based positions), but officers think in row sizes

/** [0, 2, 5] -> "1, 2, 3": one in the first row, two in the next, three after that */
export const breaksToSizes = (breaks: number[]) => breaks.map((b, i) => b - (i ? breaks[i - 1] : -1)).join(", ");

/** "1, 2, 3" -> [0, 2, 5]. officers past the last listed row flow on in even rows */
export function sizesToBreaks(sizes: number[]) {
  let end = -1;
  return sizes.map((n) => (end += n));
}
