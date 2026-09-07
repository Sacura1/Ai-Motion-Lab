import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import "./motion.css";
export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h16m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
type LineIconProps = { className?: string };

export function DownIcon({ className }: LineIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4v15m-6-6 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ExternalLinkIcon({ className }: LineIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 16 16 8m-7-1h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlayIcon({ className }: LineIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m9 7 8 5-8 5V7Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ className }: LineIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon({ className }: LineIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ className }: LineIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ExperienceIcon({ kind }: { kind: "create" | "vision" | "community" }) {
  if (kind === "create") {
    return (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M7 24 24 7M13 7h11v11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 13v11h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity=".55" />
      </svg>
    );
  }
  if (kind === "vision") {
    return (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="16" cy="16" r="3" fill="currentColor" />
        <path d="M16 3v3m0 20v3M3 16h3m20 0h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity=".55" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="11" cy="13" r="4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="22" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" opacity=".7" />
      <path d="M4 25c.8-4.2 3.1-6.3 7-6.3s6.2 2.1 7 6.3M18 18.5c4.8-.7 7.8 1.3 8.5 5.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
export function Mark() {
  return <img src="/assets/logo.JPG" alt="" aria-hidden="true" />;
}
export function TelegramIcon() {
  return (
    <svg
      className="telegram-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21.7 3.3 18.6 19c-.2 1.1-.8 1.4-1.7.9l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.8-8c.4-.3-.1-.5-.6-.2L6.5 13 1.8 11.5c-1-.3-1-1 .2-1.5L20.3 3c.9-.3 1.6.2 1.4.3Z" />
    </svg>
  );
}
export function Modal({
  children,
  close,
  label,
}: {
  children: ReactNode;
  close: () => void;
  label: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="modal-inner">
        <button className="close" onClick={close} aria-label="Close dialog">
          <CloseIcon />
        </button>
        {children}
      </div>
    </dialog>
  );
}
export function MotionArtwork() {
  const stage = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (stage.current) observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      className="motion-art"
      ref={stage}
      data-running={visible}
      aria-hidden="true"
    >
      <div className="frame-light" />
      <div className="frame-tunnel">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            className="light-frame"
            key={i}
            style={{ "--frame": i } as CSSProperties}
          />
        ))}
      </div>
      <div className="motion-logo">
        <Mark />
      </div>
    </div>
  );
}
