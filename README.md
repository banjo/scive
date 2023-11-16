# scive

Scaffold your projects effortlessly with custom templates.

![Demo](/.github/assets/demo.gif)

[![NPM version](https://img.shields.io/npm/v/scive?color=%2351A8DD&label=%20)](https://www.npmjs.com/package/scive)

-   🚀 - Quickly create custom templates for any project
-   🔮 - Interactive CLI wizard to guide you through new template setup
-   📑 - Manage multiple file templates with ease
-   ⚡ - Instantly scaffold new files with a single command
-   🏋️ - Use `handlebars` to add dynamic content to your templates
-   💾 - Local storage of templates for portability and reuse
-   ✨ - Simplifies repetitive setup tasks and enhances productivity

## Installation

```bash
npm install scive -g
```

## Usage

Initiate and manage your templates:

```bash
# Launch the template creation wizard
scive

# Launch via npx
npx scive
```

## Creating Templates

```bash
# Select create
scive

# Or launch the template creation wizard directly
scive create
```

Follow the interactive prompts to set up your custom template. You can add multiple files with custom names and content. Use `handlebars` to add dynamic content to your templates. There are two ways to add content:

-   Add files manually - the wizard will guide you through the process.
-   Select a folder - the wizard will automatically add all files in the folder.

## Scaffolding with Templates

Once a template is created, you can scaffold new files with a simple command:

```bash
# Select run
scive

# Or go to the run helper directly
scive run
```

This run helper will prompt you what template to use, which values to use for the dynamic content and where to save the new files.

## Contribution

Contributions are welcome! If you would like to help make `scive` better, please fork the repository, make your changes, and create a pull request.

Enjoy seamless project scaffolding with `scive` 🚀
