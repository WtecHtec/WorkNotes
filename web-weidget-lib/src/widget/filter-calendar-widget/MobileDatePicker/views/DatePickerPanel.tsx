/* eslint-disable react/no-unknown-property */
// components/DatePickerPanel.tsx

export default function DatePickerPanel({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children?: preact.ComponentChildren;
}) {
  if (!visible) return null;

  return (
    <div className='fixed inset-0 z-40' onClick={onClose}>
      <div className='absolute inset-0 bg-[rgba(0,0,0,0.5)]'></div>
      <div
        className='absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 animate-slide-up p-4'
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
