# DevDiary (ugd)

**DevDiary** (`ugd`) is a powerful CLI tool designed to automate your weekly reporting and code review processes. By leveraging your Git history and Large Language Models (LLMs), it generates high-quality, insightful summaries and reviews, saving you valuable time.

## Features

- **Automated Weekly Reports**: Generates detailed weekly reports based on your git commit history.
- **AI-Powered Code Review**: Analyzes staged changes or specific branches for bugs, code style, performance, and security issues.
- **Flexible Configuration**: Supports custom LLM providers (OpenAI, local models, etc.) via `~/.ddrc`.
- **Customizable Prompts**: Fully customizable prompts using Markdown templates stored in `~/.dd/prompts/`.
- **Multi-Branch Support**: Easily aggregate work from multiple branches.

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd DevDiary

# Install dependencies
npm install

# Build the project
npm run build

# Link the binary globally
npm link
```

## Configuration

### 1. Setup LLM
Configure your LLM provider (e.g., OpenAI, LocalAI).

```bash
ugd config --baseURL https://api.openai.com/v1 --key YOUR_API_KEY --model gpt-3.5-turbo
```

Or use the interactive mode:
```bash
ugd config
```

View current configuration:
```bash
ugd config --list
```

### 2. Customize Prompts
Initialize default prompt templates:

```bash
ugd config --init-prompts
```

This creates `report.md` and `review.md` in `~/.dd/prompts/`. You can edit these files to tailor the output to your needs (e.g., change language to Chinese, adjust tone).

**Supported Placeholders:**
- **Report**: `{{user}}`, `{{from}}`, `{{to}}`, `{{commits}}`
- **Review**: `{{diff}}`

## Usage

### Generating Weekly Reports

Generate a report for the current week (default):
```bash
ugd report --user "Your Name" --from 2023-10-01 --to 2023-10-07
```

Generate a report including multiple branches:
```bash
ugd report --user "Your Name" --from 2023-10-01 --branches develop,feature-login
```

### Code Review

Review staged changes (pre-commit):
```bash
ugd review --staged
```

Review a specific branch against the default branch:
```bash
ugd review --branch feature-login
```

Review changes in a specific time range on a branch:
```bash
ugd review --branch develop --from 2023-10-01 --to 2023-10-07
```

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build
```

## License

ISC
