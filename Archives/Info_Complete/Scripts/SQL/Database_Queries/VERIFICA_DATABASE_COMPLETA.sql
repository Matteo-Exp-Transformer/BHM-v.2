-- ========================================
-- 📊 VERIFICA COMPLETA STATO DATABASE
-- ========================================
-- ESEGUI OGNI QUERY SEPARATAMENTE!

-- ========================================
-- 1. CONTEGGIO RECORD PER TABELLA
-- ========================================
SELECT COUNT(*) as count, 'auth.users' as tabella FROM auth.users
UNION ALL SELECT COUNT(*), 'companies' FROM public.companies
UNION ALL SELECT COUNT(*), 'company_members' FROM public.company_members
UNION ALL SELECT COUNT(*), 'invite_tokens' FROM public.invite_tokens
UNION ALL SELECT COUNT(*), 'staff' FROM public.staff
UNION ALL SELECT COUNT(*), 'departments' FROM public.departments
UNION ALL SELECT COUNT(*), 'products' FROM public.products
UNION ALL SELECT COUNT(*), 'product_categories' FROM public.product_categories
UNION ALL SELECT COUNT(*), 'conservation_points' FROM public.conservation_points
UNION ALL SELECT COUNT(*), 'tasks' FROM public.tasks
UNION ALL SELECT COUNT(*), 'events' FROM public.events
UNION ALL SELECT COUNT(*), 'notes' FROM public.notes
UNION ALL SELECT COUNT(*), 'non_conformities' FROM public.non_conformities
UNION ALL SELECT COUNT(*), 'shopping_lists' FROM public.shopping_lists
UNION ALL SELECT COUNT(*), 'temperature_readings' FROM public.temperature_readings
UNION ALL SELECT COUNT(*), 'user_sessions' FROM public.user_sessions
UNION ALL SELECT COUNT(*), 'audit_logs' FROM public.audit_logs
ORDER BY count DESC;

-- ========================================
-- 2. DETTAGLIO COMPANIES
-- ========================================
SELECT 
  id,
  name,
  email,
  staff_count,
  created_at::date as creata_il,
  (SELECT COUNT(*) FROM public.departments WHERE company_id = companies.id) as num_reparti,
  (SELECT COUNT(*) FROM public.staff WHERE company_id = companies.id) as num_staff,
  (SELECT COUNT(*) FROM public.company_members WHERE company_id = companies.id) as num_membri
FROM public.companies;

-- ========================================
-- 3. DETTAGLIO UTENTI E MEMBRI
-- ========================================
SELECT 
  u.id,
  u.email,
  u.created_at::date as registrato_il,
  cm.role,
  s.name as staff_name,
  c.name as company_name,
  CASE WHEN cm.is_active THEN '✅ Attivo' ELSE '❌ Inattivo' END as stato
FROM auth.users u
LEFT JOIN public.company_members cm ON cm.user_id = u.id
LEFT JOIN public.companies c ON c.id = cm.company_id
LEFT JOIN public.staff s ON s.id = cm.staff_id
ORDER BY cm.role DESC, u.email;

-- ========================================
-- 4. DETTAGLIO INVITE TOKENS
-- ========================================
SELECT 
  token,
  email,
  role,
  company_id,
  used_at::timestamp as usato_il,
  expires_at::date as scade_il,
  CASE 
    WHEN used_at IS NOT NULL THEN '✅ Usato'
    WHEN expires_at < NOW() THEN '❌ Scaduto'
    ELSE '⏳ Pending'
  END as stato,
  CONCAT('http://localhost:3000/accept-invite?token=', token) as invite_link
FROM public.invite_tokens
ORDER BY created_at DESC;

-- ========================================
-- 5. DETTAGLIO STAFF
-- ========================================
SELECT 
  s.id,
  s.name,
  s.email,
  s.role,
  c.name as company_name,
  (SELECT COUNT(*) FROM public.company_members WHERE staff_id = s.id) as ha_account
FROM public.staff s
LEFT JOIN public.companies c ON c.id = s.company_id
ORDER BY s.role, s.name;

-- ========================================
-- 6. DETTAGLIO DEPARTMENTS
-- ========================================
SELECT 
  d.id,
  d.name,
  c.name as company_name,
  (SELECT COUNT(*) FROM public.tasks WHERE department_id = d.id) as num_tasks
FROM public.departments d
LEFT JOIN public.companies c ON c.id = d.company_id
ORDER BY d.name;

-- ========================================
-- 7. DETTAGLIO TASKS
-- ========================================
SELECT 
  t.id,
  t.title,
  t.frequency,
  d.name as reparto,
  c.name as company,
  (SELECT COUNT(*) FROM public.task_completions WHERE task_id = t.id) as num_completamenti
FROM public.tasks t
LEFT JOIN public.departments d ON d.id = t.department_id
LEFT JOIN public.companies c ON c.id = t.company_id
ORDER BY c.name, d.name, t.title;

-- ========================================
-- 8. DETTAGLIO PRODUCTS
-- ========================================
SELECT 
  p.id,
  p.name,
  pc.name as categoria,
  p.conservation_method,
  c.name as company
FROM public.products p
LEFT JOIN public.product_categories pc ON pc.id = p.category_id
LEFT JOIN public.companies c ON c.id = p.company_id
ORDER BY c.name, pc.name, p.name;

