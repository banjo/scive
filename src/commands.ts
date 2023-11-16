export const COMMANDS = ["run", "create", "list", "settings"] as const;
export type Command = (typeof COMMANDS)[number];

const commandDescription: Record<Command, string> = {
    run: "Create new files from a template",
    create: "Create a new template through a wizard",
    list: "List and configure templates",
    settings: "Configure the CLI",
};

export const getCommandDescription = (command: Command) => commandDescription[command];
