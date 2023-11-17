# scive

Scaffold your projects effortlessly with custom templates.

<img src="https://imgur.com/f6Q2cUP.gif?raw=true" width="500px">

> Demo of creating a template via the wizard and scaffolding it easily

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

## Scaffolding a Templates

<img src="https://imgur.com/NCSfKhY.gif?raw=true" width="500px">

Once a template is created, you can scaffold new files with a simple command:

```bash
# Select run
scive

# Or go to the run helper directly
scive run
```

## Creating Templates

```bash
# Select create
scive

# Or launch the template creation wizard directly
scive create
```

Follow the interactive prompts to set up your custom template. You can add multiple files with custom names and content. Use `handlebars` to add dynamic content to your templates. There are two ways to add content:

### Add files manually - the wizard will guide you through the process.

<img src="https://imgur.com/ZfP4Pel.gif?raw=true" width="500px">

### Select a folder - the wizard will automatically add all files in the folder.

<img src="https://imgur.com/mzOJfNr.gif?raw=true" width="500px">

This run helper will prompt you what template to use, which values to use for the dynamic content and where to save the new files.

## Modify templates

<img src="https://imgur.com/Z8DuLfk.gif?raw=true" width="500px">

You can modify any templates you've created with following command:

```bash
# Select list
scive

# Or go to the modify helper directly
scive list
```

## Settings

<img src="https://imgur.com/6ieeKdV.gif?raw=true" width="500px">

Update your general settings (debug, editor, etc.) with following command:

```bash
# Select settings
scive

# Or go to the settings helper directly
scive settings
```

## Contribution

Contributions are welcome! If you would like to help make `scive` better, please fork the repository, make your changes, and create a pull request.

Enjoy seamless project scaffolding with `scive` 🚀
