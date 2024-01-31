// reference: https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep

/**
 * Pauses the execution of the program for a specified duration.
 * 
 * @example
 * await sleep(<duration>);
 * 
 * @param {number} ms The number of milliseconds to sleep.
 * @returns {Promise} A promise that resolves after the specified duration.
 */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


