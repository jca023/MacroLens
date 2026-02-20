# Sign-In Flow UX Fix — Design

**Date:** 2026-02-20
**Status:** Approved
**Priority:** High

---

## Problem

The login page says "Sign in," which makes new users think they need to create an account first. There is no clear distinction between sign-in and sign-up. Users don't know if they need to register before they can use the app.

## Solution

Remove the sign-in vs sign-up distinction entirely. The OTP flow already handles both cases — `shouldCreateUser: true` means any email works, whether new or existing. The page copy should reflect this.

## Changes

**File:** `src/components/LoginPage.tsx` (copy changes only)

| Element | Before | After |
|---------|--------|-------|
| Heading | "Sign in" | "Welcome" |
| Subtext (OTP mode) | "Enter your email to receive a code" | "Enter your email to get started" |
| Subtext (password mode) | "Enter your email and password" | "Enter your email and password" (unchanged) |
| Submit button (OTP) | "Let's Go!" | "Continue" |
| Toggle to password | "Sign in with password instead" | "Use password instead" |
| Toggle to OTP | "Sign in with email code instead" | "Use email code instead" |
| Footer (OTP) | "Sign in securely with a one-time code" | "New or returning — we'll send you a secure code" |
| Footer (password) | "Sign in with your account" | "Sign in with your account" (unchanged) |

## What stays the same

- Auth logic in `useAuth.ts`
- App routing in `App.tsx` (already routes new users to onboarding, returning users to dashboard)
- OTP input boxes (6-digit, auto-advance, paste support)
- Session persistence (users stay signed in across app opens)

## Why this works

- "Welcome" is neutral — doesn't imply the user needs an existing account
- "Enter your email to get started" works for both new and returning users
- The app handles the distinction silently: new users get onboarding, returning users get their dashboard
- No new components, no logic changes, no database changes
