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
