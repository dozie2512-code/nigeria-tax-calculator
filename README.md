# Nigeria Tax Calculator

A tax calculation application with Firebase authentication and Stripe payment integration.

## Configuring Payment Keys

- **Revoke any leaked keys immediately** and rotate them in your provider dashboard (Stripe, Firebase, etc.).
- Store publishable keys via environment variables or provide them at build time; **never commit secret keys** (sk_, mk_ or similar) into the repository.
- Create a local `.env` from `.env.example` for local development and **never commit it**.
- If secrets were pushed to history, consider using `git-filter-repo` or BFG Repo-Cleaner to purge history and coordinate force-push with collaborators:
  - **⚠️ WARNING: These commands are DESTRUCTIVE and will rewrite git history. Do NOT run without understanding implications.**
  - Using `git-filter-repo` (example - requires customization): `git filter-repo --path index.html --invert-paths --force`
  - Using BFG (example - requires customization): `bfg --delete-files index.html`
  - After purging: `git push origin --force --all`
  - **CRITICAL**: Coordinate with ALL collaborators before force-pushing. They will need to re-clone the repository.

## Setup

1. Copy `.env.example` to `.env`
2. Fill in your actual API keys and configuration values in `.env`
3. Configure your server or build process to inject these values at runtime
4. Never commit `.env` to version control

## License

See license file for details.
