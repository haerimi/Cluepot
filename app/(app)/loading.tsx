export default function Loading() {
  return (
    <div
      className="flex-1 flex items-center justify-center min-h-0"
      style={{ backgroundColor: "var(--color-canvas)" }}
    >
      {/* Pulsing ring spinner that matches the design system colors */}
      <span
        style={{
          display: "block",
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "2px solid var(--color-hairline)",
          borderTopColor: "var(--color-accent)",
          animation: "spin 0.7s linear infinite",
        }}
        aria-label="Loading"
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
