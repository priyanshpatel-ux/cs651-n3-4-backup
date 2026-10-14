# Decision: Keep both customer submission models for N3.2

## Context
The assignment extends the N3.1 Express/EJS starter. Its deliverables require the
traditional form to keep working, a JSON endpoint, fetch submission, dynamic page
updates, and an explanation of the two architectures.

## Decision
Keep the existing routes and add a separate REST form on the same page.
`POST /api/customer` accepts an application/json object with non-empty string
`name` and `email` fields, returning `{ "message": "Welcome " + name, "email": email }`.
Validation failures return JSON with an `error` string (400); other content types
return 415. Parser errors also return JSON, including 413 for oversized bodies.
Use textContent to display returned user input, a pending guard to prevent duplicate
submissions, and a ten-second client timeout so a stalled request can be retried.

## Rationale
Both forms remain available for direct comparison. The business data and greeting
are essentially the same; request encoding, response representation, and document
navigation differ. Rendering text prevents returned names from becoming executable
HTML. JSON error handling must live after app-level parsing to catch malformed bodies.

## Alternatives Considered
Replacing the original form would remove the comparison and violate a deliverable.
Using innerHTML as in the example would interpret user input as HTML.
Adding a frontend framework is unnecessary for this single interaction.

## Constraints and Assumptions
This is a stateless teaching example: no customer data is stored and no email is
sent. The API checks field types and non-blank values; the REST form additionally
uses browser email validation. Existing traditional routes retain starter behavior.

## Consequences
Both architectures share the same origin, so no CORS configuration is necessary.
The client timeout aborts waiting, not server execution; repeating this stateless
request has no persistent side effects. No dependencies or cloud settings change.

## Verification
`npm test` exercises the HTTP contract, rejection paths, parser errors, repeat
requests, Unicode, HTML-like input, static assets, and existing routes. The README
provides browser checks for reload behavior, keyboard input, errors, and recovery.

## Revisit Conditions
Reconsider validation, authentication, persistence, and idempotency before storing
real customer records or sending messages. Changes to deployment belong to N3.1.

## Related Code
`routes/index.js`, `app.js`, `views/index.ejs`,
`public/javascripts/customer.js`, `test/customer-api.test.js`.
