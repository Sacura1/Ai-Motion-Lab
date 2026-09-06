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
          ×
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
