/* N3.2: submit JSON and update only the result, keeping the document loaded. */
(function () {
  'use strict';

  var form = document.getElementById('customer-api-form');
  var button = document.getElementById('customer-submit');
  var result = document.getElementById('customer-result');
  var submitting = false;

  // Listen to submit so keyboard submission and button clicks behave alike.
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (submitting) return;

    submitting = true;
    button.disabled = true;
    result.textContent = 'Sending customer data…';

    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 10000);

    try {
      var response = await fetch('/api/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('customer-name').value,
          email: document.getElementById('customer-email').value
        }),
        signal: controller.signal
      });
      var data = await response.json();
      if (!data || typeof data !== 'object') {
        throw new Error('The server returned an unexpected response.');
      }
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Customer request failed.');
      }
      if (typeof data.message !== 'string' || typeof data.email !== 'string') {
        throw new Error('The server returned an unexpected response.');
      }

      // These values include user input. Render text, never HTML (see decision doc).
      result.textContent = data.message + '\nWe will contact you at ' + data.email;
    } catch (error) {
      result.textContent = error.name === 'AbortError' ?
        'The request timed out. Please try again.' :
        'Unable to submit: ' + error.message + ' Please try again.';
    } finally {
      clearTimeout(timeout);
      submitting = false;
      button.disabled = false;
    }
  });
}());
