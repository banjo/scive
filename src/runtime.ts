let DEBUG = false;

export const setDebug = (value: boolean) => (DEBUG = value);
export const isDebug = () => DEBUG;
export const isDev = () => {
    return process.env.NODE_ENV === "development";
};
