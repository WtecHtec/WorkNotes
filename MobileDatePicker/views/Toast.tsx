/* eslint-disable react/no-unknown-property */
export default function Toast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="animate-fade-in pointer-events-none fixed left-1/2 top-1/2 z-[9999] -translate-x-1/2 rounded-lg bg-black bg-opacity-80 px-4 py-2 text-sm text-white">
      {message}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 20px);
          }
        }
        .animate-fade-in {
          transform: translate(-50%, 0);
        }
      `}</style>
    </div>
  );
}
