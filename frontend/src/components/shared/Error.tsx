interface ErrorProps {
  message?: string;
  retry?: () => void;
}

export default function Error({ message = 'Something went wrong', retry }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-red-500 mb-4">{message}</div>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
