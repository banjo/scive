export type Template = {
    id: string;
    name: string;
    description: string;
    tags: string[];
    variables: string[];
    files: string[];
};

export const Template = {
    from: (template: Template) => template,
};
