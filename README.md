# RAG App UI

A lightweight frontend for the `rag-app` backend that lets users choose an intent, upload files, select a mode, and ask grounded questions about their documents or datasets. The interface is built with plain HTML, CSS, and JavaScript and connects to a FastAPI backend running at `http://localhost:8000` by default.[1][2]

## Overview

This UI is designed as a simple two-step experience:

1. A welcome screen where users choose whether they want to analyze data, query documents, or let the app decide the best path based on their files.[1][2]
2. A chat workspace where users upload files, send questions, switch modes manually, and review responses plus returned sources.[1][2]

The app uses a warm, minimal visual style with a focused chat layout, file preview badges, and a modal for backend-suggested mode switches.[3][2]

## Features

- Intent-based entry flow with cards for data analysis, document Q&A, and unsure mode selection.[1][2]
- Chat-style interface for sending questions to the backend and displaying replies.[2][3]
- File upload preview badges that show currently attached files before submission.[2][3]
- Manual mode switching through a dropdown in the chat header.[1][2]
- Modal confirmation flow when the backend suggests switching to a more appropriate mode.[1][2]
- Frontend support for repeated questions using the same attached files by keeping file clearing disabled in the current version.[2]

## Tech stack

- HTML for structure and view layout.[1]
- CSS for styling, layout, chat bubbles, cards, and modal components.[3]
- Vanilla JavaScript for API requests, file previews, mode selection, and chat updates.[2]

## Project structure

```text
index.html
app.js
styles.css
```

- `index.html` defines the welcome screen, chat view, upload controls, mode selector, and switch-confirmation modal.[1]
- `app.js` handles intent selection, mode switching, file preview updates, form submission, and response rendering.[2]
- `styles.css` provides the full UI styling for the welcome cards, chat layout, controls, and modal.[3]

## Backend integration

The frontend expects a FastAPI backend that exposes:

- `GET /rag/welcome_page?intent=...`
- `POST /rag/ask_query`

The current JavaScript is configured with:

```js
const API_BASE_URL = 'http://localhost:8000';
```

Requests to `POST /rag/ask_query` are sent as `FormData` and include:

- `query_request` as a JSON string containing the query and selected mode.[2]
- `want_to_switch` as a form field used for mode-switch confirmation flows.[2]
- `files` as one or more uploaded files appended to the request payload.[2]

## Run locally

1. Clone this repository.
2. Make sure the backend is running locally.
3. Confirm `API_BASE_URL` in `app.js` points to the correct backend server.[2]
4. Open `index.html` in a browser or serve the folder with a simple local server.

Example using Python:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500` in your browser.

## Current limitations

- The UI assumes the backend contract matches the current multipart form payload shape sent from `app.js`.[2]
- The current version is designed for a local development workflow and does not yet include deployment-specific configuration handling.[2]
- File state is intentionally retained between successful queries in the current version, which improves follow-up questioning but may resend the same files on later requests.[2]

## Future improvements

- Add clearer file removal and reset controls for switching document context.[2]
- Improve loading and error states during backend requests.[2]
- Add stronger deployment configuration support for non-local API URLs.[2]
- Continue refining responsiveness and overall UX polish.[3]

## Related repository

This frontend is intended to work with the backend repository for the RAG application:

- Backend: `rag-app`
