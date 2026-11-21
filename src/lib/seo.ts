import { useEffect } from 'react';

interface PageSEOOptions {
  title: string;
  description: string;
  path: string;
  structuredData?: Record<string, unknown>;
}

export function usePageSEO({ title, description, path, structuredData }: PageSEOOptions) {
  useEffect(() => {
    const fullTitle = title.includes('BetterAlcala') ? title : `${title} – BetterAlcala`;
    document.title = fullTitle;

    const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);

    const canonicalUrl = `${window.location.origin}${path}`;
    const heroShareImageUrl = `${window.location.origin}/assets/alcala-hero.jpg?v=2`;
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', heroShareImageUrl);
    setMeta('meta[property="og:image:secure_url"]', 'property', 'og:image:secure_url', heroShareImageUrl);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', heroShareImageUrl);
    setMeta(
      'meta[property="og:image:alt"]',
      'property',
      'og:image:alt',
      'Alcala Municipal Hall facade, civic monument, and municipal seal of Alcala, Pangasinan'
    );

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    const scriptId = 'page-structured-data';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    if (structuredData) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        ...structuredData,
      });
      document.head.appendChild(script);
    }
  }, [title, description, path, structuredData]);
}
