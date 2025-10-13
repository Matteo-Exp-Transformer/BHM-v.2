-- ========================================
-- 🔗 RECUPERA LINK INVITI
-- ========================================
-- Usa questa query per ottenere i link inviti generati

SELECT 
  email,
  role,
  CONCAT('http://localhost:3000/accept-invite?token=', token) as invite_link,
  expires_at::date as scade_il,
  created_at::timestamp as generato_il,
  CASE 
    WHEN used_at IS NOT NULL THEN '✅ Usato il ' || used_at::date
    WHEN expires_at < NOW() THEN '❌ Scaduto'
    ELSE '⏳ Pending - Pronto da usare'
  END as stato
FROM public.invite_tokens
ORDER BY created_at DESC;

-- FILTRA SOLO INVITI PENDING (NON ANCORA USATI)
-- SELECT 
--   email,
--   role,
--   CONCAT('http://localhost:3000/accept-invite?token=', token) as invite_link,
--   expires_at::date as scade_il
-- FROM public.invite_tokens
-- WHERE used_at IS NULL AND expires_at > NOW()
-- ORDER BY created_at DESC;

