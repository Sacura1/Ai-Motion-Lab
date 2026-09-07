import { useEffect, useState } from "react";
import { api } from "./lib/api";
import { tracks, projects, money, type Track } from "./content";
import {
  Arrow,
  CheckIcon,
  DownIcon,
  ExperienceIcon,
  ExternalLinkIcon,
  Mark,
  MotionArtwork,
  PlayIcon,
  PlusIcon,
  TelegramIcon,
} from "./components";
import { Enrollment, Recovery, AccessPage } from "./Enrollment";

export function App() {
  const [emailEnabled, setEmailEnabled] = useState(false);
  useEffect(() => {
    api<{ emailEnabled: boolean }>("/offer")
      .then((r) => setEmailEnabled(r.emailEnabled === true))
      .catch(() => {});
  }, []);
  const [track, setTrack] = useState<Track>();
  const [recovery, setRecovery] = useState(false);
  const [video, setVideo] = useState<string>();
  const access = ["/payment/callback", "/access"].includes(
    window.location.pathname,
  );
  return (
    <>
      <header className="site-header">
        <div className="wrap header-content">
          <a className="brand" href="/" aria-label="AI Motion Lab home">
            <Mark />
            <span>AI MOTION LAB</span>
          </a>
          <nav aria-label="Main navigation">
            <a href="/#programs">The programs</a>
            <a href="/#experience">The experience</a>
            <button
              className="button nav-enroll"
              onClick={() => setTrack("creator")}
            >
              Enroll now
              <Arrow diagonal />
            </button>
          </nav>
        </div>
      </header>
      <main>
        {access ? (
          <AccessPage
            recover={() => setRecovery(true)}
            emailEnabled={emailEnabled}
          />
        ) : (
          <>
            <section className="hero wrap">
              <div className="hero-top">
                <span className="cohort">
                  <i />
                  Introducing our first cohort
                </span>
                <span className="hero-side-note">
                  An independent space for
                  <br />
                  the next wave of creators.
                </span>
              </div>
              <h1>
                Give your ideas
                <br />a life{" "}
                <span className="motion-word">
                  in motion.
                  <svg
                    viewBox="0 0 560 25"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M3 19Q250-9 555 12" />
                  </svg>
                </span>
              </h1>
              <div className="hero-bottom">
                <p>
                  From your first prompt to your final cut.
                  <br className="desktop-break" /> Learn to create cinematic AI
                  animations
                  <br className="desktop-break" /> worth watching. And worth
                  sharing.
                </p>
                <div className="hero-actions">
                  <button
                    className="button primary"
                    onClick={() => setTrack("creator")}
                  >
                    Find your creative edge
                    <Arrow diagonal />
                  </button>
                  <a className="inline-link" href="#programs">
                    Explore the programs<DownIcon className="inline-icon" />
                  </a>
                </div>
              </div>
              <MotionArtwork />
              <div className="hero-facts">
                <div>
                  <span>The format</span>
                  <strong>Live. Hands-on. Together.</strong>
                </div>
                <div>
                  <span>The rhythm</span>
                  <strong>3 sessions a week · 1 hour each</strong>
                </div>
                <div>
                  <span>The space</span>
                  <strong>Our private Telegram community</strong>
                </div>
              </div>
            </section>
            <section className="intro-section wrap" id="experience">
              <span className="section-label">
                Made for the way you imagine
              </span>
              <div className="intro-grid">
                <h2>
                  You have the idea.
                  <br />
                  Let’s make it <em>real.</em>
                </h2>
                <div>
                  <p>
                    A character you can’t stop thinking about. A scene that
                    deserves to exist. A story that’s entirely yours.
                  </p>
                  <p>
                    AI Motion Lab helps you connect the tools with the craft —
                    through live sessions, practical creation and a community
                    learning alongside you.
                  </p>
                </div>
              </div>
              <div className="experience-grid">
                {[
                  {
                    icon: "create" as const,
                    title: "Learn by making",
                    text: "Move from prompts to scenes. Put the techniques into practice as you learn.",
                  },
                  {
                    icon: "vision" as const,
                    title: "Build your visual language",
                    text: "Explore characters, camera movement and storytelling that make an idea feel like yours.",
                  },
                  {
                    icon: "community" as const,
                    title: "Create in good company",
                    text: "Join your track’s Telegram group and take part in live, shared learning.",
                  },
                ].map((item) => (
                  <article key={item.title}>
                    <span className="experience-icon" aria-hidden="true">
                      <ExperienceIcon kind={item.icon} />
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </section>
            <section className="creator-section wrap" id="creator">
              <div className="creator-intro">
                <div className="creator-identity">
                  <div className="creator-portrait">
                    <img src="/assets/pfp.jpg" alt="Algebra" loading="lazy" />
                  </div>
                  <div>
                    <span className="section-label">Your creator</span>
                    <strong>Algebra</strong>
                    <a
                      href="https://t.me/CallMeAlgy"
                      target="_blank"
                      rel="noreferrer"
                    >
                      @CallMeAlgy <ExternalLinkIcon className="inline-icon" />
                    </a>
                  </div>
                </div>
                <div className="creator-lede">
                  <span className="section-label">The story behind the lab</span>
                  <h2>
                    From crypto to
                    <br />
                    <em>AI filmmaking.</em>
                  </h2>
                  <p>
                    I’m Algebra, a creator and AI filmmaker focused on using AI
                    to create compelling stories, cinematic experiences and
                    visuals that actually connect.
                  </p>
                </div>
              </div>
              <div className="creator-story">
                <div>
                  <p>
                    I started exploring AI about a year ago, initially
                    experimenting with creative tools and content. Since then,
                    I’ve gone from simple AI generations to creating cinematic
                    animations, storytelling pieces, brand visuals and
                    promotional content.
                  </p>
                  <p>
                    My background in crypto and Web3 taught me how to create for
                    a fast-growing digital space, but I didn’t want my creativity
                    to stop there.
                  </p>
                  <strong className="creator-turn">So I expanded.</strong>
                </div>
                <div>
                  <p>
                    Today, I combine AI, animation, storytelling and creative
                    strategy to create content for both Web3 and Web2 brands,
                    while helping others learn how to do the same.
                  </p>
                  <p>
                    AI Motion Lab is an extension of that journey — showing you
                    how to take an idea, build it with AI and turn it into
                    something you can actually show, share and monetize.
                  </p>
                  <p className="creator-closing">
                    I started learning about a year ago. If I could get here,
                    you can start too.
                  </p>
                </div>
              </div>
              {projects.length > 0 && (
                <div className="creator-work" id="work">
                <div className="work-grid">
                  {projects.map((p) => (
                    <article key={p.youtubeId}>
                      {video === p.youtubeId ? (
                        <iframe
                          className="video-player"
                          src={`https://www.youtube-nocookie.com/embed/${p.youtubeId}?autoplay=1&rel=0`}
                          title={p.title}
                          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      ) : (
                        <button
                          className="video-preview"
                          onClick={() => setVideo(p.youtubeId)}
                          aria-label={`Play ${p.title}`}
                        >
                          <img
                            src={p.poster}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = `https://i.ytimg.com/vi/${p.youtubeId}/hqdefault.jpg`;
                            }}
                          />
                          <span className="play-icon" aria-hidden="true">
                            <PlayIcon />
                          </span>
                        </button>
                      )}
                      <h3>{p.title}</h3>
                      <div className="project-description">
                        <p className="project-summary">{p.summary}</p>
                        <p className="project-detail">{p.detail}</p>
                        {p.amount ? (
                          <>
                            <p className="project-outcome">{p.result}</p>
                            <div className="project-result">
                              <span>{p.resultLabel}</span>
                              <strong>{p.amount}</strong>
                            </div>
                          </>
                        ) : (
                          <div className="project-result">
                            <span>{p.resultLabel}</span>
                            <p>{p.result}</p>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
                </div>
              )}
            </section>
            <section className="program-section" id="programs">
              <div className="wrap">
                <div className="section-heading">
                  <div>
                    <span className="section-label">
                      Choose your starting point
                    </span>
                    <h2>
                      Two tracks.
                      <br />A world of possibility.
                    </h2>
                  </div>
                  <p>
                    Start from scratch or go deeper into the craft.
                    <br />
                    There’s room for your next chapter here.
                  </p>
                </div>
                <div className="program-grid">
                  {(
                    Object.entries(tracks) as [Track, typeof tracks.creator][]
                  ).map(([id, t]) => (
                    <article className={`program-card ${id}`} key={id}>
                      <div className="program-top">
                        <span className="program-index">
                          {id === "creator"
                            ? "01 / The foundation"
                            : "02 / The next level"}
                        </span>
                        {id === "masterclass" && (
                          <span className="badge">Go further</span>
                        )}
                      </div>
                      <h3>{t.name}</h3>
                      <p className="program-subtitle">{t.subtitle}</p>
                      <div className="price">
                        {money(t.price)}
                        <span>one-time payment</span>
                      </div>
                      <div className="duration">
                        <span>{t.weeks} weeks</span>
                        <span>{t.weeks * 3} live sessions</span>
                        <span>1 hour / session</span>
                      </div>
                      <p className="program-description">{t.description}</p>
                      <button
                        className={`button ${id === "masterclass" ? "primary" : "secondary"}`}
                        onClick={() => setTrack(id)}
                      >
                        Enroll in {t.name}
                        <Arrow diagonal />
                      </button>
                      <div className="curriculum">
                        <h4>
                          {id === "creator"
                            ? "Your creative foundations"
                            : "Everything in Creator, plus"}
                        </h4>
                        <ul>
                          {t.skills.map((s) => (
                            <li key={s}>
                              <span aria-hidden="true"><CheckIcon /></span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="program-outcome">{t.outcome}</p>
                    </article>
                  ))}
                </div>
                <p className="program-note">
                  Both tracks include live sessions and access to their
                  dedicated Telegram group.
                </p>
              </div>
            </section>
            <section className="how-section wrap">
              <div>
                <span className="section-label">A simple beginning</span>
                <h2>
                  Less signing up.
                  <br />
                  More showing up.
                </h2>
                <p>
                  No passwords. No complicated setup.
                  <br />
                  Just your next step into creating.
                </p>
              </div>
              <ol>
                {[
                  {
                    title: "Pick your track",
                    text: "Choose Creator or Masterclass and enter your name and email.",
                  },
                  {
                    title: "Make it official",
                    text: "Complete your one-time payment securely through Paystack.",
                  },
                  {
                    title: "Meet us on Telegram",
                    text: "Get your group invitation on the payment confirmation page and join your track on Telegram.",
                  },
                ].map((s, i) => (
                  <li key={s.title}>
                    <span className="step-number">0{i + 1}</span>
                    <div>
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
            <section className="faq-section wrap">
              <div>
                <span className="section-label">Before you jump in</span>
                <h2>
                  A few good
                  <br />
                  questions.
                </h2>
              </div>
              <div className="faq-list">
                {[
                  {
                    q: "Do I need any experience?",
                    a: "Creator is designed for beginners learning AI animation from scratch. Masterclass includes those foundations and goes further into professional and commercial work.",
                  },
                  {
                    q: "Where do the sessions happen?",
                    a: "The program is hosted on Telegram. After payment, you’ll receive an invitation to the group for your chosen track.",
                  },
                  {
                    q: "How much time should I set aside?",
                    a: "Each track has three live sessions per week, lasting one hour each. Creator runs for two weeks; Masterclass runs for three. Allow yourself some time between sessions to practice.",
                  },
                  {
                    q: "Do I need to create an account?",
                    a: "No. Enter your name and email, choose your track and pay. Your invitation appears after payment is confirmed.",
                  },
                  {
                    q: "What if I lose my invitation?",
                    a: emailEnabled
                      ? "Use “Retrieve your access” below with the email you paid with. We’ll send a secure link so you can get back to your invitation."
                      : "Keep your payment confirmation page until you’ve joined Telegram. If you lose access, contact the program organizer with your checkout email and payment reference.",
                  },
                ].map((item) => (
                  <details key={item.q}>
                    <summary>
                      {item.q}
                      <span aria-hidden="true"><PlusIcon /></span>
                    </summary>
                    <p>{item.a}</p>
                  </details>
                ))}
                <button
                  className="inline-link recovery-link"
                  onClick={() => setRecovery(true)}
                >
                  {emailEnabled
                    ? "Already paid? Retrieve your access"
                    : "Already paid? Get access help"}
                  <Arrow diagonal />
                </button>
              </div>
            </section>
            <section className="final-cta wrap">
              <span className="section-label">
                Your imagination has somewhere to go
              </span>
              <h2>
                Your next creation
                <br />
                starts <em>here.</em>
              </h2>
              <button
                className="button primary"
                onClick={() => setTrack("creator")}
              >
                Let’s make something
                <Arrow diagonal />
              </button>
              <div className="cta-orbit" aria-hidden="true" />
            </section>
          </>
        )}
      </main>
      <footer className="wrap site-footer">
        <a className="brand" href="/">
          <Mark />
          <span>AI MOTION LAB</span>
        </a>
        <span>Ideas deserve to move.</span>
        <div className="footer-actions">
          <a
            className="text-button"
            href="https://t.me/CallMeAlgy"
            target="_blank"
            rel="noreferrer"
          >
            <TelegramIcon />
            Contact us
          </a>
          <button className="text-button" onClick={() => setRecovery(true)}>
            {emailEnabled ? "Retrieve your access" : "Get access help"}
            <Arrow diagonal />
          </button>
        </div>
        <small>© {new Date().getFullYear()} AI Motion Lab</small>
      </footer>
      {track && <Enrollment track={track} close={() => setTrack(undefined)} />}{" "}
      {recovery && (
        <Recovery
          close={() => setRecovery(false)}
          emailEnabled={emailEnabled}
        />
      )}{" "}
    </>
  );
}
