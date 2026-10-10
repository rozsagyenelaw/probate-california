// Build-time renderer for the public pages (scripts/prerender.mjs). Each public URL is rendered to
// HTML once at build time, so phones see the page content before any JavaScript runs; the browser
// bundle then hydrates it. Nothing here runs in the browser.
import React from 'react';
import { Buffer } from 'node:buffer';
import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

export async function render(url) {
  const helmetContext = {};
  const { prelude } = await prerenderToNodeStream(
    <React.StrictMode>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </StaticRouter>
      </HelmetProvider>
    </React.StrictMode>
  );
  const html = await streamToString(prelude);
  return { html, helmet: helmetContext.helmet };
}
