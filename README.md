# eslint-plugin-relay-imports

Additional eslint rules about relay best practices

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-relay-imports`:

```sh
npm install eslint-plugin-relay-imports --save-dev
```

## Usage

Add `relay-imports` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "relay-imports"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "relay-imports/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here


