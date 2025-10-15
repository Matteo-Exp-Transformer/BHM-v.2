-- QUERY DI VERIFICA: Completamento Manutenzioni
-- 
-- Questa query verifica che le manutenzioni siano completate correttamente
-- e mostra tutti i dettagli del completamento

SELECT 
    mt.id,
    mt.title,
    mt.description,
    mt.type,
    mt.status,
    mt.completed_by,
    mt.completed_at,
    mt.last_completed,
    mt.next_due,
    mt.created_at,
    mt.updated_at,
    
    -- Informazioni sull'utente che ha completato
    up.email as completed_by_email,
    up.first_name as completed_by_first_name,
    up.last_name as completed_by_last_name,
    
    -- Informazioni sull'azienda
    c.name as company_name,
    
    -- Informazioni sul punto di conservazione
    cp.name as conservation_point_name,
    
    -- Calcolo giorni dalla scadenza
    CASE 
        WHEN mt.next_due IS NOT NULL THEN 
            EXTRACT(DAY FROM (mt.completed_at - mt.next_due))
        ELSE NULL
    END as giorni_dalla_scadenza,
    
    -- Stato del completamento
    CASE 
        WHEN mt.status = 'completed' AND mt.completed_at IS NOT NULL THEN 'COMPLETATA'
        WHEN mt.status = 'completed' AND mt.completed_at IS NULL THEN 'COMPLETATA_SENZA_DATA'
        WHEN mt.status = 'scheduled' THEN 'PROGRAMMATA'
        WHEN mt.status = 'overdue' THEN 'IN_RITARDO'
        ELSE 'ALTRO'
    END as stato_completamento

FROM maintenance_tasks mt
LEFT JOIN user_profiles up ON mt.completed_by = up.id
LEFT JOIN companies c ON mt.company_id = c.id
LEFT JOIN conservation_points cp ON mt.conservation_point_id = cp.id

-- Filtra per la manutenzione specifica o per tutte le manutenzioni completate
WHERE mt.id = '1e464cb8-a97a-4e69-b0f3-78cec4e6a9be'
   OR mt.status = 'completed'

ORDER BY mt.completed_at DESC NULLS LAST, mt.created_at DESC;

-- QUERY AGGIUNTIVA: Verifica manutenzioni del giorno corrente
SELECT 
    mt.id,
    mt.title,
    mt.status,
    mt.next_due,
    mt.completed_at,
    CASE 
        WHEN mt.next_due::date = CURRENT_DATE THEN 'OGGI'
        WHEN mt.next_due::date < CURRENT_DATE THEN 'IN_RITARDO'
        WHEN mt.next_due::date > CURRENT_DATE THEN 'FUTURO'
        ELSE 'SENZA_DATA'
    END as scadenza_relativa
FROM maintenance_tasks mt
WHERE mt.next_due::date = CURRENT_DATE
   OR mt.completed_at::date = CURRENT_DATE
ORDER BY mt.next_due ASC;
