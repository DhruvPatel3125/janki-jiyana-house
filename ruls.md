# Project Rules & Guidelines
## Baby Care & Hygiene Products E-Commerce Website (MERN Stack)

These rules must be followed strictly throughout the entire project — from setup to deployment. The goal is a stable, bug-free, fast, and visually attractive website that never breaks and feels natural, not robotic.

---

## 1. TECH STACK (Fixed — do not change)

- **Frontend:** React (Vite) + React Router + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt for password hashing
- **Payment:** Cash on Delivery (Phase 1) → Razorpay Standard Checkout (Phase 2)
- **Email:** Nodemailer (Gmail SMTP or SendGrid) for order confirmation
- **Deployment:** Frontend → Vercel/Netlify | Backend → Render/Railway | DB → MongoDB Atlas

Do not introduce new libraries, frameworks, or dependencies unless explicitly asked.

---

## 2. CODE QUALITY & LOGIC RULES (Website Must Never Break)

1. Every API call on the frontend MUST have loading, success, and error states handled — no blank screens or unhandled crashes.
2. Every backend route MUST validate incoming data before processing (check required fields, correct types, valid IDs) before touching the database.
3. Never assume data exists — always check if a product, user, cart, or order exists before using it (avoid `undefined`/`null` crashes).
4. Wrap all database operations and external API calls (Razorpay, email) in try-catch blocks, and return proper error messages/status codes instead of crashing the server.
5. Cart and stock logic must be consistent — never allow checkout if stock is 0 or requested quantity exceeds available stock.
6. All prices, totals, and quantities must be calculated on the backend at order time (never trust frontend-calculated totals) to prevent price manipulation.
7. Use environment variables (`.env`) for all sensitive data — DB connection string, JWT secret, email credentials, Razorpay keys. Never hardcode these in code.
8. Test every feature (cart, checkout, login, order placement) for edge cases: empty cart checkout, invalid coupon, out-of-stock item, expired session, duplicate order submission (avoid double order on double-click).
9. Keep frontend and backend folder structures clean and modular — one component/route/controller should do one job only.
10. Before marking any phase "complete," the site must be tested end-to-end for that phase's features — no leftover broken buttons, dead links, or console errors.
11. Mobile responsiveness is mandatory for every single page — test at 360px, 768px, and 1440px widths minimum.
12. Do not over-engineer. Keep logic simple, readable, and only as complex as the feature actually requires.

---

## 3. CODE STYLE RULES (Should Look Natural / Human-Written)

1. Do not add excessive explanatory comments on every line or function. Comment only where logic is genuinely non-obvious (e.g., a tricky calculation or workaround).
2. Do not use uniform, "textbook perfect" naming everywhere. Keep naming practical and consistent within a file, but don't force artificial perfection across the whole project.
3. Avoid AI-style comment patterns like `// Step 1: Initialize`, `// This function handles...`, or emoji-based comments.
4. Avoid wrapping absolutely everything in try-catch with generic messages — only handle errors where they realistically occur (API calls, DB queries, file/network operations).
5. Keep some natural variation in formatting/spacing between files, the way a real developer's style evolves over a project — don't make every file look machine-templated.
6. Prefer simple, direct solutions over generic/abstracted "framework-like" patterns unless reusability is actually needed.
7. No filler boilerplate code, unused imports, or placeholder functions left in the final code.

---

## 4. UI/UX RULES (Attractive + Conversion-Focused)

1. **Color palette:** Soft, trustworthy tones — pastel blue, soft pink, mint green, warm cream/white background. Avoid harsh or clinical-looking colors.
2. **CTA buttons** ("Add to Cart", "Buy Now", "Order Now") must use a bold contrasting color (e.g., orange or green) so they stand out immediately on every page.
3. Homepage must include: banner/hero section, category shortcuts (Baby Diapers, Adult Diapers, Sanitary Pads, Baby Care), featured/best-selling products, and trust badges (Discreet Packaging, Free Delivery, COD Available, Easy Returns).
4. Product listing page must support category filtering and basic search.
5. Product detail page must have: large clear image, price with discount (if any) shown as strikethrough on MRP, quantity selector, and a clearly visible "Add to Cart" button (sticky on mobile scroll).
6. Checkout must be short — maximum 2–3 steps (Address → Payment → Confirm). No unnecessary form fields.
7. Guest checkout must be allowed — login should not be mandatory to place an order.
8. Every page must load fast — optimize images (use compressed/appropriately sized images, lazy loading where possible).
9. Buttons, text, and tap targets must be large enough and spaced well for one-hand mobile use.
10. Use consistent spacing, font sizes, and a maximum of 2 fonts across the site (one for headings, one for body) for a clean, professional look.
11. Show clear order confirmation feedback after checkout — a dedicated "Order Successful" page with order ID and summary, not just a small popup.
12. Include an easily visible Contact Us section/page with shop phone number, WhatsApp link, and address — customers in this category often prefer direct contact before ordering.

---

## 5. SECURITY & DATA RULES

1. All passwords must be hashed with bcrypt before saving — never store plain text passwords.
2. All protected routes (admin panel, order history, checkout) must verify JWT tokens on the backend, not just hide UI elements on the frontend.
3. Admin-only routes (add/edit/delete product, view all orders) must check user role on the backend before allowing the action.
4. Sanitize and validate all user inputs on the backend to prevent injection attacks.
5. Do not expose internal error details (stack traces, DB errors) to the frontend/user — log them on the server and show a generic friendly error message to the user.
6. Since this involves personal hygiene products, keep customer data (name, address, order history) private and never expose one user's data to another through any API response.

---

## 6. ORDER & PAYMENT LOGIC RULES

1. On order placement, backend must: validate stock → calculate total on server → create order in DB → reduce stock → trigger confirmation email — in this order, and roll back stock changes if any step fails.
2. Prevent duplicate orders from double-clicking "Place Order" (disable button after first click / debounce on backend using an idempotency check).
3. Order status must follow a clear flow: Pending → Confirmed → Shipped → Delivered (and Cancelled where applicable). Admin can update status; customer can only view it.
4. For Razorpay integration (Phase 2): always verify the payment signature on the backend before marking an order as "Paid" — never trust frontend success callback alone.
5. Order confirmation email must be sent to both the customer and the shop owner, containing order ID, items, total, and delivery address.

---

## 7. GENERAL WORKING RULES FOR ANTIGRAVITY

1. Follow the phase-wise development order given — do not skip ahead or merge phases unless instructed.
2. After completing each phase, the code must run without errors before moving to the next phase.
3. Keep the folder/file structure clean and consistent throughout all phases (don't restructure randomly between phases).
4. Do not introduce placeholder/dummy data in the final production code — use real schema-driven data from MongoDB.
5. Any assumption made while building a feature (e.g., default delivery charge, default category list) should be clearly stated so it can be reviewed.