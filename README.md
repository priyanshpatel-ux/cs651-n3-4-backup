# NodeJS + Express (w/EJS) Code to exercise reading in form data and returning a response

This code has a / path (mapped to index.js --> index.ejs) which displays 3 forms each mapped to a different 
uri path in index.js that executes different controller code (for simplicity --as this is simple code, left controller
code in index.js rather than in the controllers directory --which is a better MVC code styling format).   Here is the interface

![image](https://github.com/grewe/FormData/assets/11790686/58f45881-96d6-4275-82a1-f8b291d1475c)


After hitting the Go button on the first form this is what the results will look like (notice it has read in the form data)
![image](https://github.com/grewe/FormData/assets/11790686/06ab7aed-cdaf-4e18-867b-2bf82061a372)

## N3.2: HTML forms compared with REST / JSON

Assignment: [From HTML Forms to REST/JSON APIs](https://borg.csueastbay.edu/~grewe/CS651/Projects/LabFormToREST_API.pdf).
This extends the N3.1 starter; all three original forms remain available.

### Run and test

From the repository directory, run `npm ci`, then `npm start`. Open
[http://localhost:3000](http://localhost:3000). `PORT` can override the default.
Run `npm test` with Node.js 18 or newer for the built-in HTTP integration tests.
No new dependencies are required. This demo does not save customer data or send email.

### Demo checklist

1. In the traditional customer form, enter a name and email and select Go. The
   browser navigates to `/readCustomerInfoAndRespond` and displays server-generated HTML.
2. Return to `/`. In the REST form, enter a name and email and select Submit with
   fetch (or press Enter). The greeting appears below the form; the URL and document
   stay on `/`. Input values and the other forms remain on screen.
3. In browser developer tools, select Network and compare the requests. Traditional
   submission sends `application/x-www-form-urlencoded` and receives `text/html` as
   a document navigation. The REST form sends `application/json` to `/api/customer`
   and receives JSON as a fetch request, without a new document request.
4. Submit the REST form with an empty field or invalid email: browser validation
   prevents submission. A direct JSON request with missing, blank, or non-string
   fields receives HTTP 400 and a JSON `error`. Non-JSON content receives 415.
5. Try an HTML-like name such as `<b>Linn</b>`: the REST result displays it literally.
6. With the page already loaded, switch developer tools Network to Offline and
   submit. An error appears and the submit button becomes available again. Restore
   networking and retry successfully. A stalled request times out after ten seconds.

### What to explain in class

Traditional: Browser → HTML form → Express → HTML response → browser navigation.

REST: Browser JavaScript → fetch with JSON → Express API → JSON response → JavaScript
updates part of the existing page.

The backend still reads the same name/email and produces a greeting. The main
change is the communication and rendering model, rather than the business logic.
Both models are widely used; the traditional forms also work without JavaScript.

### API example

`POST /api/customer` with `Content-Type: application/json`:

```json
{"name":"Linn","email":"linn@example.com"}
```

HTTP 200 response:

```json
{"message":"Welcome Linn","email":"linn@example.com"}
```

Malformed JSON returns 400; the existing Express JSON body-size limit returns 413.
The REST client reports request errors inline and allows a retry. The design and
security rationale are recorded in [the decision note](docs/decisions/n3-2-customer-api.md).

### Team handoff

Keep N3.1 deployment changes separate from N3.2 application changes. Review the
traditional form and REST form together after integration. Each member should
author their own commits with an email linked to their GitHub account; code must
reach `main` before it is reflected in the repository contributor graph. Initial
starter/dependency imports are not a measure of original student-written code.
