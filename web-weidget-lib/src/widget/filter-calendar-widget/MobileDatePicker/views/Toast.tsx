/* eslint-disable react/no-unknown-property */
// components/Toast.tsx
export default function Toast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className='fixed left-1/2 top-1/2 -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg text-sm z-[9999] animate-fade-in pointer-events-none'>
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
