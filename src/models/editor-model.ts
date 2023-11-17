export const EDITORS = ["code", "nano", "vim", "micro", "emacs"] as const;
export type Editor = (typeof EDITORS)[number];

const editorCommands: Record<Editor, string> = {
    code: "code --wait -n",
    nano: "nano",
    vim: "vim",
    micro: "micro",
    emacs: "emacs",
};

export const getEditorCommand = (editor: Editor) => editorCommands[editor];
