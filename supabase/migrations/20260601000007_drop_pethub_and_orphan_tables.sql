-- Remove PetHub tables (confirmed: 0 rows, wrong project)
-- Cascade handles FK dependencies automatically
DROP TABLE IF EXISTS public.bookings           CASCADE;
DROP TABLE IF EXISTS public.financial_entries  CASCADE;
DROP TABLE IF EXISTS public.financial_categories CASCADE;
DROP TABLE IF EXISTS public.cash_registers     CASCADE;
DROP TABLE IF EXISTS public.pets               CASCADE;
DROP TABLE IF EXISTS public.services           CASCADE;
DROP TABLE IF EXISTS public.clients            CASCADE;
DROP TABLE IF EXISTS public.org_memberships    CASCADE;
DROP TABLE IF EXISTS public.organizations      CASCADE;

-- Remove Miti Miti tables accidentally created in this project (0 rows, belong to project clvffsxxisbxasxvkvdu)
DROP TABLE IF EXISTS public.personal_expenses  CASCADE;
DROP TABLE IF EXISTS public.user_budgets       CASCADE;
