**English** · [Türkçe](CHANGELOG.tr.md)

# Changelog

## v0.4.1 — Window-close hotfix

- Fixed a missing Tauri permission that prevented the window from closing after saving.
- After pending writes complete, the window is destroyed directly instead of requesting another close event.
- Save failures continue to keep the window open.

## v0.4.0 — November 8, 2026

- Modern integrated window controls replace the native Windows title bar.
- Maximized startup with the Windows taskbar kept accessible.
- Consistent geometric logo for the window, executable and installer.
- Theme-aware pointer spotlight and subtle 3D tilt across cards, with reduced-motion support.
- Optional study-plan assistant: ChatGPT account connection and a personal Gemini API key alternative.
- Review shared information, edit suggested tasks, and explicitly save selected tasks to Planner.
- Windows-encrypted credentials, bounded plan validation and clear quota/error handling.

**Assistant preview:** Live account authorization and plan generation still require user verification. ChatGPT eligibility and provider quotas apply; Gemini free-tier availability and billing depend on the user's project. Core study features remain usable without an AI connection. [Assistant setup](docs/AI-SETUP.md).

## v0.3.0 — November 8, 2026

- Adjustable glass dashboard with saved appearance preferences.
- Animated bottom navigation and a study timer accessible across pages.
- New geometric logo, glass reveal at startup and a transition to the top-left logo.
- Hold-to-delete for tasks, subjects and PDFs, with a short-click confirmation alternative.
- Task topics, notes, start times, durations and overlap indicators.
- Linked records preserved when a subject is removed; atomic SQLite operations for PDF deletion.
- Fixes for blank screens during development and invalid logo scaling.

## v0.2.1 — November 8, 2026

- Signed in-app update support through GitHub Releases.
- Fixed public-key configuration for installer signing.
- New-version notifications and saving records before installation.

## v0.1.0 — Initial prototype

- Dashboard, study room, subjects, planner, PDF library and statistics.
- Light/dark themes and local SQLite storage.

[All published releases](https://github.com/ahmeterdi21/SutudyOS/releases).
