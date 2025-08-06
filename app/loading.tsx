export default function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl text-black font-medium">Loading...</p>
      </div>
    </div>
  );
}