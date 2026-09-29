```tsx
import './globals.css';
export const metadata = { title: 'PastQ — Past Questions Repository' };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="bg-gray-50 text-gray-900">{children}</body></html>;
}
```