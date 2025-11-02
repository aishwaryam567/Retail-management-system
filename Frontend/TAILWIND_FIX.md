# 🔧 Tailwind CSS v4 Fix

## Issue
Tailwind CSS v4 requires a separate PostCSS plugin.

## Solution

### Step 1: Install the correct packages
```bash
cd Frontend
npm uninstall tailwindcss
npm install -D @tailwindcss/postcss tailwindcss@latest
```

### Step 2: postcss.config.js is already updated ✅

### Step 3: Restart the dev server
```bash
npm run dev
```

---

## Alternative: Use Tailwind v3 (Stable)

If you still have issues, downgrade to v3:

```bash
cd Frontend
npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@3.4.1 postcss autoprefixer
npx tailwindcss init -p
```

Then update **postcss.config.js** back to:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

And restart: `npm run dev`
