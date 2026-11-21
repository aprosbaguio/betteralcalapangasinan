// Cloudflare Pages Edge Middleware to rewrite relative social preview URLs
// into absolute HTTPS URLs for link-preview crawlers (Facebook, X, Messenger, Discord, WhatsApp).

interface EdgeElement {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
}

interface CloudflareHTMLRewriter {
  on(selector: string, handlers: { element(el: EdgeElement): void }): CloudflareHTMLRewriter;
  transform(response: Response): Response;
}

declare const HTMLRewriter: {
  new (): CloudflareHTMLRewriter;
};

interface PagesMiddlewareContext {
  request: Request;
  next: () => Promise<Response>;
}

export async function onRequest(context: PagesMiddlewareContext): Promise<Response> {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') || typeof HTMLRewriter === 'undefined') {
    return response;
  }

  const url = new URL(context.request.url);
  const origin = url.origin;
  const heroImageUrl = `${origin}/assets/alcala-hero.jpg?v=2`;
  const canonicalUrl = `${origin}${url.pathname}`;

  return new HTMLRewriter()
    .on('meta[property="og:image"], meta[property="og:image:secure_url"], meta[name="twitter:image"]', {
      element(el) {
        el.setAttribute('content', heroImageUrl);
      },
    })
    .on('meta[property="og:url"]', {
      element(el) {
        el.setAttribute('content', canonicalUrl);
      },
    })
    .on('link[rel="image_src"]', {
      element(el) {
        el.setAttribute('href', heroImageUrl);
      },
    })
    .on('link[rel="canonical"]', {
      element(el) {
        el.setAttribute('href', canonicalUrl);
      },
    })
    .transform(response);
}
