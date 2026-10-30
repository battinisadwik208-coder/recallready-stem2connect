# RecallReady

RecallReady is a small, local-first study-card app for the STEM2Connect hackathon. It was created on October 30, 2026, within the supplied October 11–November 21 build window. This is a new prototype, not a claimed deployed service or a classroom evaluation.

## Run

Open `index.html` in a current desktop or mobile browser. There is no installation, account, build step, external font, CDN, or API key. The HTML contains all its CSS, JavaScript, and the review engine. Keep the file at a stable location; browser storage behavior for local files differs between browsers.

For more consistent storage, serve the folder with a local static server. If Python is installed, run `python -m http.server 8000` from this directory, then visit http://localhost:8000. Use the same origin and port to return to the same saved deck. No Python package is needed. The server is optional and is not part of the app.

## Use

The first successful empty-storage visit creates six synthetic computer science example cards. Add your own question and answer in the Create panel. Recall the answer before selecting Reveal answer. Then choose Again, Hard, or Good. Due only captures currently due cards when a session starts; each card appears once per session. Check due cards starts a fresh session. All cards includes future cards, and ratings there also reschedule them.

The library supports search and individual deletion, with confirmation. Add sample cards adds only missing sample questions. Export backup downloads the deck, including schedule and review counts. Import JSON validates the entire file before asking to replace the deck. Cancel preserves existing cards. Export a backup first: replacement and deletion are not undoable inside the app.

## Scheduling rules

- Again: due in 10 minutes; successful-review repetitions reset to zero.
- Hard: due in max(1, ceil(previous interval × 1.2)) days.
- Good: first successful rating is 1 day, second is 3 days, then ceil(previous interval × 2.3) days.
- Hard and Good intervals are capped at 365 days. Both increment successful-review repetitions.

This is a transparent heuristic, not an implementation of a validated memory model. The system uses the device clock and self-ratings, not correctness detection. Review activity is not proof of learning or mastery.

## JSON format

A minimal import is:

```json
{"format":"recallready","version":1,"cards":[{"front":"What is a stack?","back":"A last-in, first-out data structure."}]}
```

Optional card fields preserved in full backups: id, createdAt and due (epoch milliseconds), interval (days), repetitions, reviews, and lastRating (null, again, hard, good). Missing schedule fields initialize as a new card. Import limits: 6 MB, 500 cards, 2,000 characters per question, and 8,000 per answer. Duplicate IDs, invalid numeric fields, empty content, unsupported versions, and invalid ratings are rejected. Import accepts plain text; displayed content uses textContent rather than HTML interpretation.

## Storage and privacy

No user data is sent to a server by the app. Decks are stored under localStorage key recallready.deck.v1. Browser extensions, other scripts on the same origin, or someone using this browser profile may still access them; do not put secrets in cards. There is no cloud sync or recovery service. Clearing browser data can delete the deck. Export backups regularly.

Storage read errors show a warning and do not automatically overwrite unreadable data. Storage write errors keep the current session usable in memory and ask you to export before closing. Closing the page without a successful save or export can lose those changes. A file download may still be blocked by browser settings; verify that your backup downloaded.

## Tests

Node.js 18+ is sufficient. Run `node --test core.test.cjs ui.test.cjs` in this directory. Core tests cover scheduling, validation, queues, statistics, and failed storage. UI tests use a small simulated DOM to exercise the inline script and check it embeds the exact tested engine. They do not substitute for browser rendering, file-picker, download, or accessibility checks.

To edit review logic, change core.js and replace the first inline script in index.html with its full contents. The parity test fails if they drift. No npm dependencies are required.

## Limitations and remaining checks

No accounts, collaboration, rich-text cards, AI inference, automatic card generation, or edit-in-place UI. To revise cards, export, edit the JSON, then import it. No timers auto-insert cards into an active session; press Check due cards or change modes. Mobile layout and keyboard behavior are designed in the code but still require real-device/browser verification. There are no measured student outcomes, real user testimonials, or efficacy results.

## AI assistance disclosure

This prototype's code, automated tests, documentation, and draft submission text were produced with AI coding assistance through Strawberry. RecallReady itself does not call an AI model or provide model-generated study answers. The human submitter must review the implementation, confirm personal learning and authorship statements, and check the event's eligibility and AI-use rules before submitting.
