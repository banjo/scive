import pc from "picocolors";

export const standout = (message: string) => pc.cyan(message);
export const highlight = (message: string) => pc.green(message);
export const dim = (message: string) => pc.dim(message);
export const underline = (message: string) => pc.underline(message);
export const bold = (message: string) => pc.bold(message);
export const newline = () => console.log();
