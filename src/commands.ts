export const COMMANDS = ["run", "create", "list"] as const;
export type Command = (typeof COMMANDS)[number];

const commandDescription: Record<Command, string> = {
    run: "Create new files from a template",
    create: "Create a new template through a wizard",
    list: "List and configure templates",
};

export const getCommandDescription = (command: Command) => commandDescription[command];
