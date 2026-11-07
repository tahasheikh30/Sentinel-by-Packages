# Running the frontend on your own server (nginx)

`vercel.json` only works on Vercel. On a server of your own, nginx does the same work: it serves the built frontend, sends the security headers, and forwards `/api` to the backend.

Files:
- `sentinel.conf`: the server blocks (HTTPS, the single page app rule, caching, `/api` proxy). Copy to `/etc/nginx/conf.d/`.
- `sentinel-security-headers.conf`: the security headers (same as the headers block of `vercel.json`). Copy next to it. Replace `YOURPROJECT` with your Supabase project address.

Steps:
1. Build with the site's own address as the backend address:
   `VITE_API_BASE_URL=https://sentinel.example.org VITE_API_KEY=... VITE_SUPABASE_URL=... VITE_SUPABASE_PUBLISHABLE_KEY=... npm run build`
   and copy `dist/` to `/var/www/sentinel`.
2. Replace `sentinel.example.org` and the certificate paths in `sentinel.conf`.
3. `sudo nginx -t && sudo systemctl reload nginx`.
4. Start the backend on `127.0.0.1:8000` only (see `deploy/` in the backend repository).

Things to know:
- Only `/api` is forwarded, so `/docs`, `/redoc` and `/openapi.json` never reach the backend.
- `add_header` in a location replaces the headers of the server block, so each location that sets its own `add_header` includes the headers file.
- In Supabase, set the Site URL and redirect URLs to the new address, and add it to the allowed hostnames of the Turnstile widget.
- Keep the Cloudflare entries in the headers only while Turnstile is switched on.

Tested with nginx 1.24 over HTTPS: all 9 headers on pages, built files and images, the deep link and `/sign-in` reload, the redirect from port 80, and that `/api` is forwarded with the caller's address added last. See Section 12 of the Sentinel documentation.
