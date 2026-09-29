```tsx
import Link from 'next/link';
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold mb-2">PastQ</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Centralized Automated Past Questions Repository
      </p>
      <div className="flex gap-3">
        <Link href="/login" className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium">Login</Link>
        <Link href="/register" className="px-6 py-3 rounded-lg bg-white border font-medium">Register</Link>
      </div>
    </main>
  );
}
```