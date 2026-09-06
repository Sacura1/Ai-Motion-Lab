import { useEffect, useState, type FormEvent } from "react";
import { api } from "./lib/api";
import { tracks, money, type Track } from "./content";
import { Arrow, Modal } from "./components";
export function Enrollment({
  track,
  close,
}: {
  track: Track;
  close: () => void;
}) {
  const [selected, setSelected] = useState(track);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState<boolean>();
  useEffect(() => {
    api<{ ready: boolean }>("/offer")
      .then((r) => setReady(r.ready))
      .catch(() => setError("Unable to connect. Please try again shortly."));
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      const response = await api<{ authorizationUrl: string }>(
        "/payments/initialize",
        { name: data.get("name"), email: data.get("email"), track: selected },
      );
      window.location.assign(response.authorizationUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start checkout.");
      setBusy(false);
    }
  }
  return (
    <Modal close={close} label="Enroll in AI Motion Lab">
      <span className="section-label">Make your next move</span>
      <h2>
        Let’s get you
        <br />
        creating.
      </h2>
      <p>Choose your track. Your invitation follows payment.</p>
      <div className="track-picker" role="group" aria-label="Choose your track">
        {Object.entries(tracks).map(([id, t]) => (
          <button
            key={id}
            aria-pressed={selected === id}
            onClick={() => setSelected(id as Track)}
          >
            {t.name}
            <strong>{money(t.price)}</strong>
          </button>
        ))}
      </div>
      <form onSubmit={submit}>
        <label htmlFor="name">Your name</label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          maxLength={100}
          required
          placeholder="Full name"
        />
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
          placeholder="you@example.com"
        />
        <p className="input-hint">
          Your email identifies your payment and enrollment.
        </p>
        <button className="button primary" disabled={busy}>
          {busy ? "Opening Paystack…" : `Pay ${money(tracks[selected].price)}`}
          <Arrow />
        </button>
        {ready === false && (
          <p className="notice">
            Checkout is still confirming availability. You can try the payment
            button again now.
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <span className="secure">
          Secure checkout with Paystack · No account needed
        </span>
      </form>
    </Modal>
  );
}
export function Recovery({
  close,
  emailEnabled,
}: {
  close: () => void;
  emailEnabled: boolean;
}) {
  const [state, setState] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/access/request", {
        email: new FormData(e.currentTarget).get("email"),
      });
      setState(
        "If a paid enrollment matches this email, we’ll send a secure access link. Check your inbox and spam folder.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal close={close} label="Recover your access">
      <span className="section-label">Welcome back</span>
      <h2>Find your way in.</h2>
      {!emailEnabled ? (
        <p className="notice">
          If you’ve already paid, return to your payment confirmation page to
          get your Telegram invitation. If you no longer have it, contact the
          program organizer with your checkout email and payment reference so
          they can check your enrollment.
        </p>
      ) : (
        <>
          <p>Enter the email you used at checkout. No password to remember.</p>
          {state ? (
            <p role="status" className="notice">
              {state}
            </p>
          ) : (
            <form onSubmit={submit}>
              <label htmlFor="recover-email">Email address</label>
              <input
                id="recover-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@example.com"
              />
              <button className="button primary" disabled={busy}>
                {busy ? "Requesting link…" : "Email my access link"}
                <Arrow />
              </button>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
            </form>
          )}
        </>
      )}
    </Modal>
  );
}
export function AccessPage({
  recover,
  emailEnabled,
}: {
  recover: () => void;
  emailEnabled: boolean;
}) {
  const [result, setResult] = useState<{
    telegramUrl: string;
    track: string;
  }>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reference] = useState(() =>
    new URLSearchParams(window.location.search).get("reference"),
  );
  const [token] = useState(() =>
    new URLSearchParams(window.location.hash.slice(1)).get("token"),
  );
  async function verify() {
    setBusy(true);
    setError("");
    try {
      if (!reference && !token)
        throw new Error(
          "No access reference found. Use the access help option below.",
        );
      setResult(
        await api(
          token ? "/access/redeem" : "/payments/verify",
          token ? { token } : { reference },
        ),
      );
      // Keep the payment reference so a buyer can reload their confirmation
      // page even when email recovery is disabled. Remove consumed email tokens.
      if (token) window.history.replaceState({}, "", window.location.pathname);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to confirm access.");
    } finally {
      setBusy(false);
    }
  }
  // Explicit click for email links prevents preview scanners consuming the token.
  useEffect(() => {
    if (reference) void verify();
  }, []);
  return (
    <section className="access-page wrap">
      {result ? (
        <div className="success-panel" role="status">
          <span className="success-check" aria-hidden="true">✓</span>
          <span className="section-label">Payment confirmed</span>
          <h1>You’re in.</h1>
          <p>
            Your {result.track} enrollment is confirmed. Your private Telegram
            invitation is ready.
          </p>
          <a
            className="button primary"
            href={result.telegramUrl}
            rel="noreferrer"
          >
            Join the Telegram channel
            <Arrow diagonal />
          </a>
          <p className="invite-note">
            This invitation admits one member and expires after 24 hours. Once
            one person has joined, nobody else can use it—please don’t share it.
          </p>
        </div>
      ) : (
        <>
          <span className="section-label">Your next chapter</span>
          <h1>{token ? "Ready when you are." : "One last check."}</h1>
          <p>Confirm your enrollment to get your invitation to the channel.</p>
          <button className="button primary" disabled={busy} onClick={verify}>
            {busy
              ? "Checking your payment…"
              : token
                ? "Get my invitation"
                : "Check payment"}
            <Arrow />
          </button>
        </>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {!result && (
        <button className="text-button" onClick={recover}>
          {emailEnabled ? "Retrieve access by email" : "Get access help"}
        </button>
      )}
      <a className="text-button" href="/">
        Back to AI Motion Lab
      </a>
    </section>
  );
}
