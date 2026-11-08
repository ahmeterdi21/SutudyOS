**English** · [Türkçe](INSTALLATION.tr.md)

# Install StudyOS and get started

The current app interface is in Turkish. This guide includes the Turkish control names so you can find them in the app.

## Install on Windows

1. Open the [latest release](https://github.com/ahmeterdi21/SutudyOS/releases/latest).
2. Under **Assets**, download the installer ending in `x64-setup.exe`.
3. Close any running StudyOS window, launch the installer and follow its instructions.
4. Open StudyOS from the Start menu or a shortcut.

You do not need `.sig`, `latest.json` or **Source code** for normal installation. Using the app does not require Node.js, Rust or a GitHub account. See the separate [development guide](DEVELOPMENT.md) to run from source.

The installer targets Windows x64. StudyOS uses Microsoft Edge WebView2. If it does not open, [report the problem](https://github.com/ahmeterdi21/SutudyOS/issues/new/choose) with the error message. An updater signature is different from a Windows code-signing certificate; Windows may still display a security notification. Check the download source before proceeding.

## Your first five minutes

1. **Subjects — Derslerim:** Add a subject or learning area, such as Mathematics, Languages or Reading.
2. **Planner — Planlayıcı:** Create a task with a date, topic, start time and duration.
3. **Study Room — Çalışma Odası:** Choose the subject and a focus duration, then start the timer with **Başlat**.
4. **Library — Kütüphane:** Import PDF notes. The per-file limit is 25 MB.
5. **Glass appearance — Cam görünümü:** Adjust the appearance from the top bar. Light and dark themes are available too.

A new installation starts empty. Complete focus sessions to populate the charts. Planned task duration and measured focus time are separate: marking a task complete does not create a timer session.

## Removing items and keeping records

Hold a task, subject or PDF removal button for two seconds to confirm removal. A short click opens a standard confirmation dialog. Removing a subject preserves its linked tasks, files and history. Removing a PDF deletes the app's copy, not your original file.

The timer retains its state across pages and app restarts. Time spent asleep or with the app closed counts toward the countdown. Only completed focus sessions appear in statistics; resetting a partial session does not record that time.

## Updates

The app checks for published updates at startup. Select **Güncelle** to install one, or use **Ayarlar → Kontrol et** to check manually. Pause a running timer before installation.

Core features work offline. Update checks and downloads require a connection. Updates are distributed through GitHub Releases and their signatures are verified. Draft releases do not appear in update checks.

## Backups

Desktop records and imported PDFs are stored in a SQLite database, typically under `%APPDATA%\com.studyos.desktop\`.

Close the app and copy the entire data folder to a safe location for a full backup. Restore it only while the app is closed. The JSON export in Settings does not include PDFs, and this version has no JSON import interface. The database is not encrypted.
