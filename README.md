# BankAssist — Banking Complaint Assistant
An HCI Assignment #2 conversational interface prototype for filing and tracking simulated banking complaints.

## Live / local
- GitHub Pages (after Pages deployment succeeds): https://sabahat-abbas.github.io/Bank-Assistant/
- Local folder: `C:\Users\susma\Desktop\Bank-Assistant`
- While the local web server is running: http://localhost:5180/
- To start a local server without npm dependencies: `python -m http.server 5180 --bind 127.0.0.1` from this folder.
- Automated checks: `npm test` and `npm run check`

## User tasks and intents
1. File a complaint: category → amount → date → description → review → explicit confirmation → local demo ID.
2. Track a complaint by ID (new local demo records or built-in sample BA-100001).
3. Read refund guidance.
4. Get failed transaction and wrong-transfer guidance.
5. Learn how to contact official human support.

## Interaction quality
- Quick replies and free-text intent recognition; ambiguous-intent clarification.
- Error prevention through restricted categories, validated amount and date, sensitive data warning, and review before submission.
- Back/undo, cancel, main menu, restart, exit, and clear demo data.
- Progress bar, visible agent identity and system state, screen-reader live message log, keyboard accessible buttons, responsive layout.
- LocalStorage is used **only for simulated** complaint records. No genuine bank integration, transactions, refunds, or human agent are provided.

## User testing (collect genuine evidence)
Prepare a signed/acknowledged consent note for each participant, never record bank credentials. Give participants these tasks:
- T1: File a failed-transaction complaint for PKR 2500 on 2026-10-01 using fictional details; confirm and save the reference.
- T2: Track the newly submitted demo complaint.
- T3: Enter an impossible date and recover successfully.
- T4: Use Back to correct a field, then confirm.
- T5: Ask for refund and human support guidance.
- T6: Send an unclear/off-topic request and recover using suggestions.

For each participant record task completion (yes/no), time (seconds), number of errors, whether help was required, satisfaction (1–5), and qualitative comments. Never fabricate user results.

## Assignment deliverables
1. 2,000–3,000 word Word report, with Q1 topic proposal; Q2 8–10 prioritized requirements (shall/so that), HCI mapping and feedback revisions; Q3 persona, Norman interaction model, 5 intents × 4 utterances, dialogue flowchart; Q4 prototype screenshots and design rationale, real-user evaluation with sources in APA/IEEE style.
2. GitHub Pages URL or repository and exported local prototype.
3. A 2–3 minute video of core complaint task and an error recovery.
4. Genuine testing evidence: participant consent, tasks, raw results and feedback.

## Demo sequence for video
Open landing page → File a complaint → category/amount/date/description → show invalid date recovery → review and confirm → copy case ID → Track complaint → show human support guidance → describe the local-data-only limitation.

## Academic note
This is an educational demonstration, not a bank-operated or financial-advice service. Never input actual customer data. Design claims and expected success criteria are not measured results until evaluated with real users.
