# Claude Handoff – MacroLens Barcode Integration
Date: Jan 2026
**Updated: Jan 29, 2026** - Feature removed, moved to backlog

## Project
MacroLens (React + TypeScript + Vite)
Path:
c:\Users\john\Documents\_Claude\MacroLens

## Status: FEATURE REMOVED

The barcode scanning feature was removed because it was implemented without a viable data source. The `food_library` table exists with 75 Optavia products, but none have barcode data - and there's no scalable way to get barcodes for all food products.

**Lesson learned:** Don't implement features that depend on external data without first confirming the data source exists and is accessible.

---

## What Was Removed
- `BarcodeScanner.tsx` component (deleted)
- Barcode button from MealLogger capture step
- `barcode-scan` step and `barcode` input mode
- `handleBarcodeScanned` function
- Related imports (ScanBarcode icon, findByBarcode service, BarcodeScanner component)

## What Remains
- `food_library` table in Supabase (75 Optavia products, no barcodes)
- `foodLibraryService.ts` with `findByBarcode()` function (unused but kept for future)
- MealLogger works with Camera, Upload, and Text description options

---

## Future Ideas
See `docs/PRODUCT_BACKLOG.md` for:
- Barcode scanning (parked - needs data source decision)
- Bar/restaurant drink scanning (idea stage)

---

## Pending Tasks (Still Valid)
1. Migrate to new Supabase API keys
2. Add sellable data fields to `meals` table
3. Optional: Improve chunking via dynamic imports

---

## Resume Instruction (for Claude)
The barcode feature is parked in PRODUCT_BACKLOG.md. If revisiting:
1. Choose a barcode database (Open Food Facts API is free)
2. Implement API integration
3. Re-add UI components

For now, focus on other app improvements or the pending tasks above.
