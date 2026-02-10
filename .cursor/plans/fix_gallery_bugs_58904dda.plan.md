---
name: Fix Gallery Bugs
overview: "Fix two gallery bugs: (1) upvoting increments by 2 instead of 1 due to a race condition between manual optimistic state and InstantDB's built-in optimistic updates, and (2) clicking a meme image crashes with \"An unsupported type was passed to use()\" because the detail page uses a Next.js 15 API pattern incompatible with the installed Next.js 14."
todos: []
isProject: false
---

# Fix Gallery Bugs

## Bug 1: Upvote counts +2 instead of +1

**Root cause:** A race condition between two competing sources of truth for the upvote count.

In `[components/MemeCard.tsx](components/MemeCard.tsx)`, the upvote count is tracked in **two places simultaneously**:

- **Local state** (`currentUpvoteCount`) with a manual optimistic `+1` on line 88
- **Parent prop** (`upvoteCount`) synced via a `useEffect` on lines 53-55, which reflects InstantDB's own built-in optimistic updates

When the user clicks upvote:

1. `setCurrentUpvoteCount(prev => prev + 1)` queues a state update (from `n` to `n+1`)
2. `db.transact()` fires -- InstantDB immediately applies an optimistic update to its local cache
3. The parent's `useQuery` re-renders with the new optimistic data, passing `upvoteCount = n + 1`
4. The `useEffect` fires: `setCurrentUpvoteCount(n + 1)` -- now `currentUpvoteCount` = `n + 1`
5. React then processes the queued `prev => prev + 1` with `prev` now being `n + 1`, resulting in `n + 2`

**Fix:** Remove the redundant local state (`currentUpvoteCount`, `currentHasUpvoted`) and the manual optimistic updates entirely. Use the `upvoteCount` and `hasUpvoted` props directly -- InstantDB's built-in optimistic updates already handle instant UI feedback.

Changes in `[components/MemeCard.tsx](components/MemeCard.tsx)`:

- Remove `currentUpvoteCount` and `currentHasUpvoted` state variables
- Remove both `useEffect` hooks that sync props to state (lines 43-55)
- Remove the manual `setCurrentUpvoteCount` / `setCurrentHasUpvoted` calls from `handleUpvote`
- Replace all references to `currentUpvoteCount` / `currentHasUpvoted` with the `upvoteCount` / `hasUpvoted` props directly

## Bug 2: "An unsupported type was passed to use()" error on meme detail page

**Root cause:** Next.js version mismatch in `[app/meme/[id]/page.tsx](app/meme/[id]/page.tsx)`.

The page uses the **Next.js 15** pattern where `params` is a `Promise`:

```typescript
const { id } = use(params);  // params typed as Promise<{ id: string }>
```

But this project runs **Next.js 14** (`"next": "^14.0.0"