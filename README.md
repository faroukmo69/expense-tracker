# Expense Tracker (Angular)

A small expense tracker backed by a local REST API (json-server) with full create / edit / delete support and an AI chatbot connected to an n8n agent.

## Features

- Add / edit / delete expenses (Reactive Form + custom future-date validator)
- Filter by category, search notes, sort by date or amount (signals + computed)
- Custom pipe (category icons) and custom attribute directive (highlight over budget)
- Running total of the currently visible (filtered) expenses, formatted as currency
- AI chatbot connected to an n8n AI Agent workflow (answers from your expense data)
- Bonus: loading/error states, per-category subtotals, adjustable highlight threshold, load more

## Prerequisites

- Node.js + npm
- Angular CLI: `npm i -g @angular/cli`
- json-server: `npm install -g json-server`

## Run

1. **Terminal 1** — start the local API:
   ```
   json-server --watch db.json --port 3000
   ```
2. **Terminal 2** — start the app:
   ```
   ng serve
   ```
3. Open [http://localhost:4200](http://localhost:4200)

## AI Chatbot (n8n)

The chatbot sends the user's message + the current expenses to an n8n AI Agent workflow (Webhook → AI Agent → Google Gemini Chat Model) and shows the answer.

The workflow file is included in this repo: `n8n/expense-chatbot.json`

To run the chatbot with your own n8n account:

1. Create a free account at [https://www.n8n.io](https://www.n8n.io)
2. Import the workflow: create a new workflow → menu (⋯) → Import from File → select `n8n/expense-chatbot.json`
3. Open the Google Gemini Chat Model node and connect your own credential (a free API key from [https://aistudio.google.com](https://aistudio.google.com))
4. Click **Publish** to activate the workflow
5. Copy the Production URL from the Webhook node and put it in `src/environments/environment.development.ts`:
   ```
   aiAgentWebhookUrl: 'YOUR_PRODUCTION_WEBHOOK_URL'
   ```

### Request / response contract used by the app

- **Request:**
  ```json
  { "message": "...", "sessionId": "...", "expenses": [...] }
  ```
- **Response:**
  ```json
  { "output": "..." }
  ```

If the workflow is unavailable, the chatbot shows a friendly error message and the rest of the app keeps working normally.

## Notes

- `db.json` contains sample expenses — feel free to edit it.
- Keep json-server running in a separate terminal alongside `ng serve`.
