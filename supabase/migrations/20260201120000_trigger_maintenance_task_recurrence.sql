-- Migration: Trigger automatico per task ricorrenti
-- Quando viene creato un completamento in maintenance_completions,
-- il trigger aggiorna automaticamente:
-- 1. last_completed del task
-- 2. next_due calcolato in base alla frequency
-- 3. status resettato a 'scheduled' per il prossimo ciclo

-- Funzione per calcolare la prossima scadenza in base alla frequency
CREATE OR REPLACE FUNCTION calculate_next_due_date(
  p_frequency VARCHAR,
  p_completed_at TIMESTAMPTZ
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
AS $$
BEGIN
  CASE p_frequency
    WHEN 'daily' THEN
      RETURN p_completed_at + INTERVAL '1 day';
    WHEN 'weekly' THEN
      RETURN p_completed_at + INTERVAL '7 days';
    WHEN 'monthly' THEN
      RETURN p_completed_at + INTERVAL '1 month';
    WHEN 'annually' THEN
      RETURN p_completed_at + INTERVAL '1 year';
    ELSE
      -- Default: se frequency non riconosciuta, +1 giorno
      RETURN p_completed_at + INTERVAL '1 day';
  END CASE;
END;
$$;

-- Funzione trigger che viene eseguita DOPO l'INSERT in maintenance_completions
CREATE OR REPLACE FUNCTION update_maintenance_task_on_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_task_frequency VARCHAR;
  v_new_next_due TIMESTAMPTZ;
BEGIN
  -- Leggi la frequency del task
  SELECT frequency INTO v_task_frequency
  FROM maintenance_tasks
  WHERE id = NEW.maintenance_task_id;

  -- Calcola la prossima scadenza
  v_new_next_due := calculate_next_due_date(v_task_frequency, NEW.completed_at);

  -- Aggiorna il task con:
  -- 1. last_completed = data completion
  -- 2. next_due = prossima scadenza calcolata
  -- 3. status = 'scheduled' (resetta per il prossimo ciclo)
  UPDATE maintenance_tasks
  SET
    last_completed = NEW.completed_at,
    next_due = v_new_next_due,
    status = 'scheduled',
    updated_at = NOW()
  WHERE id = NEW.maintenance_task_id;

  -- Log per debug (opzionale)
  RAISE NOTICE 'Task % aggiornato: next_due = %, status = scheduled',
    NEW.maintenance_task_id, v_new_next_due;

  RETURN NEW;
END;
$$;

-- Crea il trigger su INSERT in maintenance_completions
DROP TRIGGER IF EXISTS trigger_update_task_on_completion ON maintenance_completions;

CREATE TRIGGER trigger_update_task_on_completion
AFTER INSERT ON maintenance_completions
FOR EACH ROW
EXECUTE FUNCTION update_maintenance_task_on_completion();

-- Commento per documentazione
COMMENT ON FUNCTION calculate_next_due_date IS
  'Calcola la prossima scadenza di un task ricorrente in base alla frequency (daily/weekly/monthly/annually)';

COMMENT ON FUNCTION update_maintenance_task_on_completion IS
  'Trigger function: quando viene creato un completamento, aggiorna automaticamente last_completed, next_due e status del task';

COMMENT ON TRIGGER trigger_update_task_on_completion ON maintenance_completions IS
  'Aggiorna automaticamente i task ricorrenti quando vengono completati';
