# AI Portion Accuracy Improvements — Design

**Date:** 2026-02-20
**Status:** Approved
**Priority:** #3 in current sprint

---

## Problem

Gemini overestimates portion sizes in food photos, leading to inflated calorie counts. Photos lack depth and scale reference, so the AI defaults to generous estimates.

## Solution

Rewrite the portion guidance section of both the photo and text analysis prompts with specific, measurable instructions that bias toward underestimation.

## Prompt Changes

### 1. Explicit underestimation bias
Tell the model to reduce estimates by ~20% from its initial guess. AI models respond better to specific numerical targets than vague "be conservative" instructions.

### 2. Anchor to smallest reasonable portion
Reframe from "estimate the portion" to "what is the smallest reasonable portion this could be?"

### 3. Standard plate/bowl sizing assumptions
Add concrete reference objects: standard dinner plate (10"), standard bowl (6"), standard mug (8oz). Use these to scale down, not up.

### 4. Calorie cross-check step
Final validation: "Does the total seem reasonable for this meal type?" with typical ranges (home meal 400-700 cal, restaurant 600-1200 cal).

### 5. Remove palm/fist reference hints
These human-scale references don't help an AI looking at a photo — may cause overestimation.

## Files Changed

- `src/services/geminiService.ts` — FOOD_ANALYSIS_PROMPT and TEXT_ANALYSIS_PROMPT only
- No code logic changes

## Future Enhancement (Backlog)

User correction feedback loop: when users adjust AI estimates (via portion multipliers or manual edits), store the delta. Over time, use aggregate correction data to adjust prompts or add a systematic bias correction factor.
