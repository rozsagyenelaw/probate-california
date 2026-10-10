// One address per page: /some-page/ permanently redirects to /some-page (the form used in
// canonical tags, the sitemap and every internal link). Netlify redirect rules cannot express
// this because they ignore a trailing slash when matching.
export default async (request) => {
  const url = new URL(request.url);
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/\/+$/, '');
    return Response.redirect(url.toString(), 301);
  }
  return undefined;
};

export const config = {
  path: '/*',
  excludedPath: ['/__/*', '/.netlify/*', '/assets/*'],
};
