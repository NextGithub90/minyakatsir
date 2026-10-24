# Design QA — Indonesia Aroma Lab Landing Page

## Evidence

- Source visual truth path: `C:\Users\ACER\Desktop\petani.png`.
- Additional mobile behavior reference: the product-section screenshot attached in the current chat.
- Browser-rendered desktop implementation: `C:\Users\ACER\Desktop\website\minyakatsir\output\playwright\desktop-cdp-full.png`.
- Browser-rendered mobile implementation: `C:\Users\ACER\Desktop\website\minyakatsir\output\playwright\mobile-cdp-full.png`.
- Mobile above-the-fold capture: `C:\Users\ACER\Desktop\website\minyakatsir\output\playwright\mobile-cdp-top.png`.
- Desktop location capture: `C:\Users\ACER\Desktop\website\minyakatsir\output\playwright\desktop-cdp-location.png`.
- Desktop FAQ capture: `C:\Users\ACER\Desktop\website\minyakatsir\output\playwright\desktop-cdp-faq.png`.
- Mobile location capture: `C:\Users\ACER\Desktop\website\minyakatsir\output\playwright\mobile-cdp-location.png`.
- Mobile FAQ capture: `C:\Users\ACER\Desktop\website\minyakatsir\output\playwright\mobile-cdp-faq.png`.
- Combined full-view comparison: `C:\Users\ACER\Desktop\website\minyakatsir\output\playwright\qa-comparison.png`.
- Desktop viewport: 1600 × 1000 CSS px at device scale factor 1.
- Mobile viewport: 390 × 844 CSS px at device scale factor 1.
- Source dimensions: 786 × 2001 px.
- Desktop implementation dimensions: 1600 × 6893 px.
- Mobile implementation dimensions: 390 × 7879 px.
- Density normalization: desktop implementation scaled to 786 px wide (786 × 3386 px) beside the 786 px-wide source on a 1572 × 3386 px comparison canvas.
- State: default page with 12 catalog items rendered, all visible images resolved, and reveal effects normalized for full-page capture.

## Full-view comparison

The implementation keeps the reference's section order, editorial serif/sans hierarchy, botanical green and amber palette, image-led storytelling, rounded CTAs, and dark-green footer. The desktop product section is intentionally taller because it now presents 12 of the expanded 150-product catalog before Load More. The map and FAQ are intentional extensions requested after the reference was supplied; they reuse the same typography, tokens, spacing, and interaction language.

## Focused mobile evidence

The mobile product section was inspected at 390 px wide. It is a single horizontal swipe rail with portrait cards, one dominant card and a visible preview of the following card. The Load More control remains below the rail. Our Process remains a vertical alternating timeline, so the page retains a clear top-to-bottom reading rhythm. Separate focused captures confirm that the Jakarta map renders at both breakpoints and that FAQ questions and answers wrap cleanly without clipping.

## Required fidelity surfaces

- Fonts and typography: Cormorant Garamond and DM Sans retain the reference's editorial hierarchy. Mobile product names wrap without clipping and retain readable weight and line height.
- Spacing and layout rhythm: the mobile product rail uses consistent 14 px gaps, snap alignment, and a 74vw card width. Sections do not overlap; the process timeline remains vertically ordered.
- Colors and visual tokens: deep green, amber, off-white, muted gray, and pale-green surfaces remain consistent with the reference and preserve readable contrast.
- Image quality and asset fidelity: catalog imagery uses the locally downloaded real product assets with stable crops and aspect ratios. All 91 local raster assets are now optimized WebP files; the hero and focused product imagery remain visually sharp in the post-conversion browser captures. No placeholder drawings replace visible product imagery.
- Copy and content: the catalog keeps the complete product names; counters and Load More text accurately describe the rendered state.

## Interaction and browser checks

- Desktop catalog renders 12 items initially, 24 after Load More, and all 150 through View All Products.
- Mobile catalog renders 12 items initially and 24 after Load More.
- Mobile Load More automatically advances the horizontal rail to the newly added batch.
- Mobile navigation opens and closes successfully.
- The Google Maps iframe is present and renders the Jakarta map in focused desktop and mobile captures.
- The FAQ accordion opens the selected answer and closes the previously open answer.
- Desktop search opens and closes successfully.
- Desktop client width and scroll width are both 1585 CSS px; no document overflow.
- Mobile client width and scroll width are both 390 CSS px; no document overflow.
- Browser console errors: none.
- Network failures after cache-disabled desktop and mobile reloads: none.
- Local image payload: reduced from 35,292,012 bytes to 4,463,802 bytes (about 87% smaller), with two byte-identical duplicate sources consolidated.

## Findings

No actionable P0, P1, or P2 mismatch remains.

## Comparison history

1. Earlier mobile capture used a two-column product grid, which made the catalog extend too far vertically.
2. The product collection was changed to a one-row horizontal snap rail with portrait cards and a following-card preview.
3. Load More was retained and enhanced to move the rail to the first newly added product. The post-fix mobile capture confirms the shorter section, correct card orientation, and no viewport overflow.
4. The final extension adds an embedded Jakarta map and a five-item FAQ accordion. Focused browser captures verify both new sections on desktop and mobile.

## Follow-up polish

- P3: native scrollbar visuals are intentionally hidden on the product rail; the partial next card supplies the swipe affordance.

## Implementation checklist

- [x] Horizontal mobile product rail
- [x] Portrait mobile product cards
- [x] Load More retained and tested
- [x] Automatic advance after Load More
- [x] Vertical mobile process timeline preserved
- [x] Responsive Jakarta map embed
- [x] Exclusive, keyboard-accessible FAQ accordion
- [x] No horizontal document overflow
- [x] No browser console errors

final result: passed
