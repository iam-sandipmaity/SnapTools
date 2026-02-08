# Contributing to SnapTools

First off, thanks for taking the time to contribute! :tada: :heart:

The following is a set of guidelines for contributing to SnapTools. These are just guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Code of Conduct

This project and everyone participating in it is governed by the [SnapTools Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [INSERT EMAIL].

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for SnapTools. Following these guidelines helps maintainers and the community understand your report :pencil:, reproduce the behavior :computer:, and find related reports :mag_right:.

**Before Submitting a Bug Report**

*   **Check the debugging guide.**
*   **Check that a similar bug report doesn't already exist.**
*   **Make sure you can reproduce the bug.**

**How Do I Submit a (Good) Bug Report?**

Bugs are tracked as [GitHub issues](https://github.com/iam-sandipmaity/snaptools/issues). Create an issue on that repository and provide the following information by filling in [the template](.github/ISSUE_TEMPLATE/bug_report.md).

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for SnapTools, including completely new features and minor improvements to existing functionality. Following these guidelines helps maintainers and the community understand your suggestion :pencil: and find related suggestions :mag_right:.

**How Do I Submit a (Good) Enhancement Suggestion?**

Enhancement suggestions are tracked as [GitHub issues](https://github.com/iam-sandipmaity/snaptools/issues). Create an issue on that repository and provide the following information by filling in [the template](.github/ISSUE_TEMPLATE/feature_request.md).

### Your First Code Contribution

Unsure where to begin contributing to SnapTools? You can start by looking through these `good first issue` and `help wanted` issues:

*   [Good first issues](https://github.com/iam-sandipmaity/snaptools/labels/good%20first%20issue) - issues which should only require a few lines of code, and a test or two.
*   [Help wanted issues](https://github.com/iam-sandipmaity/snaptools/labels/help%20wanted) - issues which should be a bit more involved than `good first issue` issues.

## Development Process

### 1. Fork the Repository

Fork the [SnapTools repository](https://github.com/iam-sandipmaity/snaptools) to your own GitHub account.

### 2. Clone the Repository

Clone your fork to your local machine:

```bash
git clone https://github.com/YOUR_USERNAME/snaptools.git
cd snaptools
```

### 3. Create a Branch

Create a branch for your feature or fix:

```bash
git checkout -b feature/amazing-feature
# or
git checkout -b fix/annoying-bug
```

### 4. Install Dependencies

Install the project dependencies:

```bash
npm install
```

### 5. Run the Development Server

Start the development server to see your changes in real-time:

```bash
npm run dev
```

### 6. Make Your Changes

Implement your feature or fix. Ensure your code follows the project's style guidelines.

### 7. Run Tests/Linting

Make sure your changes don't break anything (if applicable):

```bash
npm run lint
```

### 8. Commit Your Changes

Commit your changes with a descriptive commit message:

```bash
git commit -m "feat: add amazing feature"
```

### 9. Push to Your Fork

Push your changes to your fork on GitHub:

```bash
git push origin feature/amazing-feature
```

### 10. Submit a Pull Request

Go to the original SnapTools repository and submit a Pull Request from your branch. Please fill out the Pull Request template.

## Styleguides

### Git Commit Messages

*   Use the present tense ("Add feature" not "Added feature")
*   Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
*   Limit the first line to 72 characters or less
*   Reference issues and pull requests liberally after the first line

### JavaScript/TypeScript Styleguide

*   We use [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for linting and formatting.
*   Please ensure your code passes linting before submitting a PR.

## Thank You!

Your contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.
