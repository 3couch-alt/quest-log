# Quest Log — your blog

A plain HTML/CSS site, no build tools, no dependencies. Open `index.html` in a browser and it just works.

## Files

```
index.html          ← homepage (list of posts)
style.css            ← all styling
posts/
  academy-arcs.html
  poe2-endgame.html
  victor-of-tucson.html
```

## Host it free (pick one)

**Vercel (easiest, custom domain support)**
1. Create a free account at vercel.com
2. Drag the whole `blog` folder onto the "Add New Project" upload area, or connect it to a GitHub repo
3. Deploy — you'll get a live `yourproject.vercel.app` URL instantly

**GitHub Pages**
1. Create a new repo on GitHub, e.g. `quest-log`
2. Upload all these files to it (keep the `posts/` folder structure)
3. Go to repo Settings → Pages → set source to the `main` branch, root folder
4. Your site goes live at `yourusername.github.io/quest-log`

Both are genuinely free with no time limit for a static site like this.

## Add a new post

1. Copy `posts/victor-of-tucson.html` and rename it, e.g. `posts/my-new-post.html`
2. Edit the `<title>`, the `<h1>`, and the text inside `.post-body`
3. Update the tier badge (`tier-s` / `tier-a` / `tier-b`) and the meta line (type, read time) near the top
4. Open `index.html`, copy one of the `<a class="quest">` blocks, point its `href` at your new file, and update the title/description/tags there too

No other files need to change.

## Customizing

- Colors, fonts, and spacing all live in `style.css` under the `:root` variables at the top
- The "character sheet" panel on the homepage (entry count, XP bar) is just HTML — update the numbers by hand as you post more, or leave it as flavor
