# Contributing to ScaleX

Thank you for showing an interest in contributing to ScaleX! All kinds of contributions are valuable to us.

## Submitting an issue

Before submitting a new issue, please search the issues tab — an existing one may already inform you of a workaround.

When reporting a bug, please provide a minimal reproduction (a repo or Gist), along with:

- 3rd-party libraries being used and their versions
- a use-case that fails

### Naming conventions for issues

When opening a new issue, please use a clear and concise title:

- For bugs: `🐛 Bug: [short description]`
- For features: `🚀 Feature: [short description]`
- For improvements: `🛠️ Improvement: [short description]`
- For documentation: `📘 Docs: [short description]`

## Project setup and architecture

### Requirements

- Docker Engine installed and running
- Node.js 20+ LTS
- Python 3.8+
- Postgres 14
- Redis 6.2.7
- **Memory**: 12 GB RAM recommended

### Setup

The project is a monorepo with backend (Django) inside `apps/api` and frontend apps elsewhere.

```bash
git clone <your-fork-url> [folder-name]
cd [folder-name]
chmod +x setup.sh
./setup.sh
docker compose -f docker-compose-local.yml up
pnpm dev
```

Then open `http://localhost:3001/god-mode/` to register as instance admin, and `http://localhost:3000` to log in.

## Coding guidelines

- All features or bug fixes must be covered by one or more specs (unit tests).
- We lint with [OxLint](https://oxc.rs/docs/guide/usage/linter) and format with [oxfmt](https://oxc.rs/docs/guide/usage/formatter).

## Ways to contribute

- Add new integrations
- Add or update translations
- Help triage open issues
- Improve documentation
- Submit a bug report or feature request

## Contributing to language support

Translations live in `packages/i18n/src/locales/<lang>/`. Use English as the source of truth — copy a JSON file and translate values while keeping the keys and ICU format intact.

We use [IntlMessageFormat](https://formatjs.github.io/docs/intl-messageformat/) for variables and pluralization:

```json
{
  "greeting": "Hello, {name}!",
  "items": "{count, plural, one {Work item} other {Work items}}"
}
```

### Quality checklist

- All translation keys exist in every language file.
- Nested structures match across all language files.
- ICU message formats are correctly implemented.
- No missing or untranslated keys.

## Questions

Open a GitHub discussion or issue and we'll get back to you.
