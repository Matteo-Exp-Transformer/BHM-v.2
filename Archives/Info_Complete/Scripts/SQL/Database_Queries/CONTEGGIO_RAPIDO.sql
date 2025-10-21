-- ========================================
-- ⚡ CONTEGGIO RAPIDO DATABASE
-- ========================================
-- Query veloce per vedere lo stato generale

SELECT COUNT(*) as count, 'auth.users' as tabella FROM auth.users
UNION ALL SELECT COUNT(*), 'companies' FROM public.companies
UNION ALL SELECT COUNT(*), 'company_members' FROM public.company_members
UNION ALL SELECT COUNT(*), 'invite_tokens' FROM public.invite_tokens
UNION ALL SELECT COUNT(*), 'staff' FROM public.staff
UNION ALL SELECT COUNT(*), 'departments' FROM public.departments
UNION ALL SELECT COUNT(*), 'products' FROM public.products
UNION ALL SELECT COUNT(*), 'tasks' FROM public.tasks
UNION ALL SELECT COUNT(*), 'events' FROM public.events
UNION ALL SELECT COUNT(*), 'user_sessions' FROM public.user_sessions
UNION ALL SELECT COUNT(*), 'audit_logs' FROM public.audit_logs
ORDER BY count DESC;

