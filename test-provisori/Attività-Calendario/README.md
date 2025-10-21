# Contesto Onboarding – Template di supporto

Questa cartella raccoglie l'insieme minimo di riferimenti (senza duplicare i file sorgenti) necessari per fornire istruzioni a un agente che deve lavorare sui test dell'onboarding. Tutti i percorsi sono relativi alla root del repository.

## Struttura

- `file-index.md` – elenco dei file sorgenti chiave da consultare, con il ruolo di ciascuno.
- `flow-overview.md` – riassunto dell'architettura del flusso onboarding e delle dipendenze tra i file indicati.
- `dataset-notes.md` – indicazioni su dati di test e variabili d'ambiente specifiche per gli scenari onboarding.

> Nota: questa cartella non contiene file derivati da `.claude/skills` o altre skill di riferimento, come richiesto.

## Uso rapido

1. Aprire `file-index.md` per avere la mappa dei moduli sorgenti utili (tipi, helper, componenti, servizi, test esistenti).
2. Leggere `flow-overview.md` per capire come interagiscono gli elementi principali (hook auth, servizio inviti, wizard).
3. Seguire le raccomandazioni in `dataset-notes.md` quando si preparano fixture o variabili per i test automatici.

Se il perimetro dei test si amplia, aggiornare questi file aggiungendo nuovi percorsi o note operative.

