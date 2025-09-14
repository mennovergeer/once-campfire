# Repository Guidelines

## Project Structure & Module Organization
- Source: `app/` (models, controllers, views, jobs, channels, JS via Stimulus/Turbo).
- Config: `config/` (Puma, Redis, environments, routes), `Procfile` for processes.
- Data: SQLite DBs in `storage/db/`; Active Storage files in `storage/files/`.
- Tests: `test/` (unit, controller, system with Capybara/Selenium); fixtures in `test/fixtures/`.
- Scripts: `bin/` (setup, rails, rubocop, brakeman, ci) and `script/` (admin/dev helpers).

## Build, Test, and Development Commands
- Setup: `bin/setup` — install gems, prepare DB, clear logs/tmp.
- Run app: `bin/rails server` (Puma on port 3000). Ensure Redis is running: `redis-server config/redis.conf`.
- Background jobs: `FORK_PER_JOB=false INTERVAL=0.1 bundle exec resque-pool`.
- Full CI locally: `bin/ci` — style, security audits, tests, seeds.
- Lint: `bin/rubocop`; Security: `bin/brakeman`, `bin/bundler-audit`, `bin/importmap audit`.
- System tests only: `bin/rails test:system`; all tests: `bin/rails test`.

## Coding Style & Naming Conventions
- Ruby/Rails Omakase via RuboCop (`.rubocop.yml`); 2-space indentation; no trailing whitespace.
- Files and methods: `snake_case`; Classes/Modules: `CamelCase`; controllers end with `Controller`, jobs with `Job`.
- Keep Rails autoloading: place code under the conventional `app/**` path that matches the constant name.

## Testing Guidelines
- Framework: Minitest with Capybara/Selenium for `test/system`.
- Name tests `*_test.rb` mirroring `app/**` structure; prefer fixtures in `test/fixtures/`.
- Write model validations/callback tests and request/controller tests for new endpoints; add happy-path system tests for user-visible features.
- Run `bin/rails test` locally and ensure `bin/ci` passes before opening a PR.

## Commit & Pull Request Guidelines
- Commits: use Conventional Commit prefixes where sensible (e.g., `feat:`, `fix:`, `chore:`, `docs:`, `test:`). Keep messages imperative and scoped.
- PRs: include a clear description, linked issues, testing notes, and screenshots for UI changes. Note any migrations or ops impacts.
- Requirements to merge: green `bin/ci`, no RuboCop/Brakeman warnings.

## Security & Configuration Tips
- Secrets via env vars. Common: `RAILS_MASTER_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `SENTRY_DSN`, `SSL_DOMAIN`/`DISABLE_SSL`.
- Do not commit secrets; `.env.erb` is for local secret generation.
- Docker: build `docker build -t campfire .`; run with volumes for `/rails/storage` and required env vars.

