// netlify/functions/submission-created.js
//
// Netlify runs a function with this exact name automatically for every
// *verified* form submission (after its spam filter). It does not change the
// form, the /thank-you redirect, or your existing email notifications.
//
// Job: forward real "booking" submissions to a GoHighLevel inbound webhook.
// The webhook URL lives ONLY in the GHL_WEBHOOK_URL environment variable.

const FORM_NAME = "booking";
const TIMEOUT_MS = 10000;

// Missing / null values become "" (never undefined).
const str = (v) => (v === undefined || v === null ? "" : String(v));

const ok = (msg) => ({ statusCode: 200, body: msg });

exports.handler = async (event) => {
  // 1. Parse the event body defensively.
  let payload;
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64").toString("utf8")
      : event.body || "";
    payload = JSON.parse(raw).payload;
  } catch (err) {
    console.error("submission-created: could not parse event body:", err.message);
    return ok("ignored: unparseable body");
  }

  if (!payload) {
    console.error("submission-created: event body had no payload");
    return ok("ignored: no payload");
  }

  // 2. Only handle the booking form.
  if (payload.form_name !== FORM_NAME) {
    console.log(`submission-created: ignoring form "${payload.form_name}"`);
    return ok("ignored: other form");
  }

  const webhookUrl = process.env.GHL_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("submission-created: GHL_WEBHOOK_URL is not set; skipping forward");
    return ok("skipped: no webhook configured");
  }

  const data = payload.data || {};

  // 3. Flat object for GoHighLevel.
  const body = {
    firstName: str(data["first-name"]),
    lastName: str(data["last-name"]),
    email: str(data.email),
    phone: str(data.phone),
    preferredContact: str(data["preferred-contact"]),
    style: str(data.style),
    howFound: str(data["how-found"]),
    placementSize: str(data["placement-size"]),
    message: str(data.message),
    consent: data.consent ? "yes" : "no",
    source: "artbycarlostattoo.com",
    form: FORM_NAME,
    tags: ["art by carlos"],
    submittedAt: str(payload.created_at),
  };

  // 4. POST with a 10 second timeout. Any failure is logged, never thrown,
  //    and we always return 200 so Netlify doesn't keep retrying.
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "<could not read response body>");
      console.error(
        `submission-created: GHL webhook failed: ${res.status} ${res.statusText} — ${text.slice(0, 1000)}`
      );
      return ok("forward failed (logged)");
    }

    console.log(`submission-created: forwarded booking submission ${str(payload.id)} to GHL (status ${res.status})`);
    return ok("forwarded");
  } catch (err) {
    const reason = err && err.name === "TimeoutError" ? `timed out after ${TIMEOUT_MS} ms` : str(err && err.message);
    console.error(`submission-created: GHL webhook request error: ${reason}`);
    return ok("forward failed (logged)");
  }
};
