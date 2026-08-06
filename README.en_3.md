# Application Tracker

A simple job application tracker to follow your job search from start to finish: applied, interview, technical test, offer, or rejected.

## Features

- Log applications (company, role, link, status, date, and notes)
- Filter by status and search by company/role
- Automatic stats: total applications, in progress, offers, and response rate
- Data is saved automatically in the browser (no backend needed)

## Tech Stack

- **React 18** — via CDN (UMD), no bundler required
- **Babel Standalone** — transpiles JSX directly in the browser
- **HTML5 + CSS3**
- **localStorage** — persists data in the browser

No Node.js, no `npm install`, no build step. Just serve `index.html` through a local server (e.g. VS Code's Live Server extension, or `python3 -m http.server`) to avoid CORS issues when loading the separate files.

## Running locally

1. Clone the repository
2. Serve the folder with a simple local server, for example:
   ```bash
   python3 -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser

## Project structure

```
├── index.html   # page structure and imports
├── style.css    # global styles
└── app.jsx      # React component (logic and UI)
```

## Notes

Data is stored locally in the browser (`localStorage`), so it isn't shared across devices or visible to other people who open the project.
