import pc from "picocolors";

export const standout = (message: string) => pc.cyan(message);
export const highlight = (message: string) => pc.green(message);
export const dim = (message: string) => pc.dim(message);
export const underline = (message: string) => pc.underline(message);
export const bold = (message: string) => pc.bold(message);
export const newline = () => console.log();
export const heading = (message: string) => pc.bgCyan(` ${pc.black(message.toUpperCase())} `);
// eslint-disable-next-line n/no-unsupported-features/node-builtins
export const clear = () => console.clear();
