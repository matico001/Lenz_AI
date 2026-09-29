export default function AccessDenied() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-bold text-red-600 mb-2">403</h1>
      <p className="text-gray-700 mb-4">Access Denied — you don't have permission to view this page.</p>
      <a href="/" className="text-indigo-600 font-medium">Go home</a>
    </main>
  );
}