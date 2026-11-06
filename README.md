# BitLight: A 4-Bit Binary Number Display

CS101L Module 2 final project portfolio by Ronnel P. Gambong.

A static website (HTML, CSS and a little JavaScript). It has no build step, so it runs on GitHub Pages as is.

## Files

| File | What it is |
|---|---|
| `index.html` | All the portfolio content, sections 1 to 11, certificates and the AI-use declaration |
| `styles.css` | The design |
| `script.js` | The live BitLight board, the interactive truth table and the K-Map |
| `images/` | Photo, Tinkercad circuit, diagrams and certificate |

## Put it on GitHub Pages

1. Create a new public repository on GitHub, for example `bitlight-portfolio`.
2. Click **Add file → Upload files** and drag in `index.html`, `styles.css`, `script.js`, `README.md` and the whole `images` folder. Click **Commit changes**.
3. Go to **Settings → Pages**. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose the `main` branch and the `/ (root)` folder, then click **Save**.
4. Wait a minute and refresh. Your site will be at `https://YOUR-USERNAME.github.io/bitlight-portfolio/`.
5. Open the link to check that it works, then submit it on Blackboard.

## Updating the site later

To add another certificate, copy the `<article class="cert">` block in the Certificates section of `index.html`, change the text and image, and upload the changed files to GitHub again.
