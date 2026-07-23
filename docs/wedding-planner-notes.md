# Wedding Planner — Testing Notes

Notes from Vicky for Carrie to review.

## Initial Feedback

- **Budget** — needs to show whether the booking is under budget
- **Date** — the date field should display the date of purchase, not just the event date
- **Payment options** — needs to support options such as deposit, payment plans, etc.

## Testing Notes — Round 2

All items below have been implemented.

1. ✅ **Dashboard — Getting Started numbering** — steps are numbered dynamically from the incomplete list, always sequential
2. ✅ **Getting Started — section order** — "Fill in your website" is last in the list
3. ✅ **Budget / Finance tab** — Payment Schedule section shows paid, upcoming, and overdue payments
4. ✅ **Quotes — edit option** — edit button on each quote, inline edit form
5. ✅ **Suppliers — booking without quotes** — "Book directly" button available when no quote chosen
6. ✅ **Tables — delete button size** — styled button with text "Delete table" at bottom of editor view
7. ✅ **Tables — evening guests** — excluded from unseated count (type !== "evening")
8. ✅ **Day plan — schedule edit option** — edit button on each schedule item, inline edit form
9. ✅ **Dashboard — budget totals** — Total budget, Committed, Remaining shown in stat cards
10. ✅ **Tables — table names** — tables can be named, renamed inline, quick-setup auto-names them

## Post-launch

- ✅ **PLANNER15 cross-sell** — 15% off code added in 3 places: under QR code (Settings), dashboard card, suppliers page header
