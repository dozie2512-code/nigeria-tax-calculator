# Nigeria Tax Calculator

A tax calculation application with Firebase authentication and Stripe payment integration.

## Configuring Payment Keys

- **Revoke any leaked keys immediately** and rotate them in your provider dashboard (Stripe, Firebase, etc.).
- Store publishable keys via environment variables or provide them at build time; **never commit secret keys** (sk_, mk_ or similar) into the repository.
- Create a local `.env` from `.env.example` for local development and **never commit it**.
- If secrets were pushed to history, consider using `git-filter-repo` or BFG Repo-Cleaner to purge history and coordinate force-push with collaborators:
  - Using `git-filter-repo`: `git filter-repo --path index.html --invert-paths --force` (example - adjust as needed)
  - Using BFG: `bfg --delete-files index.html` (example - adjust as needed)
  - After purging: `git push origin --force --all`
  - **Note:** Do not run these commands without understanding the implications and coordinating with your team.

## Setup

1. Copy `.env.example` to `.env`
2. Fill in your actual API keys and configuration values in `.env`
3. Configure your server or build process to inject these values at runtime
4. Never commit `.env` to version control

## License

See license file for details.
