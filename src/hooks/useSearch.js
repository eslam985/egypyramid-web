// /media/es/DDrive/projects/web-Next.js/src/hooks/useSearch.js
// /src/hooks/useSearch.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        // 🚀 طلب البيانات من الـ API الداخلية بدلاً من سوبابيز مباشرة
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (!response.ok) throw new Error(`Search API returned status ${response.status}`);
        const data = await response.json();
        setResults(data || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 1000); // تأخير 1000 مللي ثانية قبل البحث

    return () => clearTimeout(handler);
  }, [query]);

  const goToSearchPage = (e, callback) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      if (callback) callback();
    }
  };

  return { query, setQuery, results, loading, goToSearchPage };
}
