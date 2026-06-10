# Nenterprises Public Website

Static multi-page public website for Nenterprises, based on:

- `THE NENTERPRISES CONSTITUTION.md`
- `NENTERPRISES GROUP STRUCTURE.md`

## Pages

- `/` Home
- `/constitution/`
- `/ecosystem/`
- `/approach/`
- `/documents/`
- `/404.html`

## Local preview

Because this is a static site, you can preview it with any simple local server.

Examples:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub setup

This folder was not originally a Git repository. To publish it to GitHub:

```powershell
git init -b main
git add .
git commit -m "Launch Nenterprises multi-page public website"
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Vercel deployment

Recommended flow:

1. Push this project to GitHub.
2. In Vercel, choose `Add New -> Project`.
3. Import the GitHub repository.
4. Keep the framework preset as `Other`.
5. Leave the output directory empty because the site is served directly from the repo root.
6. Deploy.

Current live deployment:

- `https://nenterprises.vercel.app`
- Intended primary domain: `https://nenterprises.co.za`

## Files added for deployment

- `vercel.json` for static hosting behavior and basic security headers
- `.gitignore` for Git and Vercel hygiene
- `robots.txt`
- `sitemap.xml`

## Notes

- Internal pages use folder-based routes so they work cleanly on both Vercel and static hosting.
- The source Markdown documents remain in the root and are linked from the public documents page.
- `www.nenterprises.co.za` is configured to redirect to `nenterprises.co.za` once DNS is pointed at Vercel.
