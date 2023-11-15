export type Template = {
    name: string;
    description: string;
    tags: string[];
    variables: string[];
    templateFileName: string;
};

export const Template = {
    from: (template: Template) => template,
};
