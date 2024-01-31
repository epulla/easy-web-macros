export const log = (...data: any[]) =>
  console.log(
    "%cEasy Web Macros:",
    "font-family: monospace; color: orange; font-style: italic;",
    ...data
  );
