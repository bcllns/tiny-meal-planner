# Footer Links Navigation Fix

## Overview

Updated the footer links in SharedRecipeView and SharedShoppingListView to navigate to the correct content pages (How It Works, Privacy Policy, Terms of Service) instead of redirecting to the landing page.

## Changes Made

### 1. App.tsx - Added Path-Based Routing

**File:** `src/App.tsx`

Added logic to detect content page paths and set the appropriate view:

```typescript
// Check for content pages by path
const path = window.location.pathname;
if (path === "/how-it-works") {
  setCurrentView("how-it-works");
} else if (path === "/privacy-policy") {
  setCurrentView("privacy-policy");
} else if (path === "/terms-of-service") {
  setCurrentView("terms-of-service");
}
```

This allows the app to respond to direct URL navigation to these pages.

### 2. SharedRecipeView.tsx - Updated Footer Props

**File:** `src/components/SharedRecipeView.tsx`

Updated the Footer component to use proper paths:

```typescript
<Footer onHowItWorks={() => (window.location.href = "/how-it-works")} onPrivacyPolicy={() => (window.location.href = "/privacy-policy")} onTermsOfService={() => (window.location.href = "/terms-of-service")} />
```

### 3. SharedShoppingListView.tsx - Updated Footer Props

**File:** `src/components/SharedShoppingListView.tsx`

Updated the Footer component to use proper paths:

```typescript
<Footer onHowItWorks={() => (window.location.href = "/how-it-works")} onPrivacyPolicy={() => (window.location.href = "/privacy-policy")} onTermsOfService={() => (window.location.href = "/terms-of-service")} />
```

### 4. Deployment Configuration

#### public/\_redirects (NEW)

**File:** `public/_redirects`

Created for Netlify and similar platforms:

```
/*    /index.html   200
```

This ensures all routes fallback to index.html for client-side routing.

#### vercel.json (NEW)

**File:** `vercel.json`

Created for Vercel deployments:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures all routes are rewritten to index.html on Vercel.

## How It Works

### User Flow

1. User views a shared recipe or shopping list
2. User clicks "How It Works" (or Privacy Policy/Terms of Service) in the footer
3. Browser navigates to `/how-it-works` (or `/privacy-policy`, `/terms-of-service`)
4. App.tsx detects the path and sets the appropriate view
5. The corresponding content page is displayed

### Routes

- `/how-it-works` → Shows HowItWorksPage component
- `/privacy-policy` → Shows PrivacyPolicyPage component
- `/terms-of-service` → Shows TermsOfServicePage component

### SPA Routing

Since this is a Single Page Application (SPA) without a router library:

- All paths are handled by the main `index.html`
- App.tsx reads `window.location.pathname` on mount
- Sets the appropriate internal state (`currentView`)
- Renders the correct page component

### Deployment Considerations

The `_redirects` and `vercel.json` files ensure that:

- Direct navigation to these URLs works (e.g., typing in browser)
- Page refresh doesn't result in 404 errors
- All hosting platforms properly serve the SPA

## Testing

### Local Development (Vite Dev Server)

Vite's dev server automatically handles SPA routing, so no additional config needed for local testing.

### Testing Steps

1. Navigate to a shared recipe: `http://localhost:5173/?share=some-id`
2. Click "How It Works" in footer
3. Verify you see the How It Works page (not landing page)
4. Use browser back button - should return to shared recipe
5. Repeat for Privacy Policy and Terms of Service links

### Production Testing

After deploying:

1. Visit a shared recipe URL
2. Click each footer link
3. Verify correct page displays
4. Test direct URL access: `yoursite.com/how-it-works`
5. Test page refresh on content pages - should not 404

## Benefits

✅ **Better UX**: Users get to the exact page they clicked on
✅ **Direct Links**: Content pages can be linked directly from anywhere
✅ **Shareable URLs**: Users can bookmark or share these specific pages
✅ **SEO Friendly**: Search engines can index individual content pages
✅ **Professional**: Expected behavior for modern web applications

## Previous Behavior vs New Behavior

### Before:

- Footer links → Landing page
- User had to navigate again from landing page
- No direct URL access to content pages

### After:

- Footer links → Specific content pages
- Direct access to the page clicked
- URLs work for bookmarking and sharing

## Notes

- No React Router library required - using native browser navigation
- App maintains internal state while supporting URL-based routing
- Compatible with all major hosting platforms
- Falls back gracefully for any hosting platform that supports SPA rewrites
