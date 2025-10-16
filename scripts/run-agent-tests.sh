#!/bin/bash

# 🤖 RUN AGENT TESTS - Workflow Multi-Agent
# 
# Script per eseguire test con coordinamento multi-agent
# Gestisce lock, setup, test e cleanup automatico
# 
# Usage:
#   ./scripts/run-agent-tests.sh <agent-id> <port> <test-path>
# 
# Examples:
#   ./scripts/run-agent-tests.sh agent-1 3000 "Production/Test/UI-Base"
#   ./scripts/run-agent-tests.sh agent-2 3001 "Production/Test/Autenticazione"

set -e  # Exit on any error

# Parametri
AGENT_ID=$1
PORT=$2
TEST_PATH=$3

# Validazione parametri
if [ -z "$AGENT_ID" ] || [ -z "$PORT" ] || [ -z "$TEST_PATH" ]; then
  echo "❌ Usage: $0 <agent-id> <port> <test-path>"
  echo ""
  echo "Examples:"
  echo "  $0 agent-1 3000 \"Production/Test/UI-Base\""
  echo "  $0 agent-2 3001 \"Production/Test/Autenticazione\""
  echo "  $0 agent-3 3002 \"Production/Test/Gestione\""
  exit 1
fi

# Configurazione
LOCK_HOST="localhost:$PORT"
HEARTBEAT_INTERVAL=60
LOCK_TIMEOUT=180

echo "🚀 Avvio test per $AGENT_ID su porta $PORT"
echo "📁 Path test: $TEST_PATH"
echo ""

# Funzione per cleanup
cleanup() {
  echo ""
  echo "🧹 Cleanup in corso..."
  
  # Stop heartbeat se attivo
  if [ ! -z "$HEARTBEAT_PID" ]; then
    kill $HEARTBEAT_PID 2>/dev/null || true
    echo "⏹️ Heartbeat fermato"
  fi
  
  # Rilascia lock se acquisito
  if [ "$LOCK_ACQUIRED" = "true" ]; then
    echo "🔓 Rilascio lock..."
    node scripts/agent-lock-manager.js release "$LOCK_HOST" || true
    echo "✅ Lock rilasciato"
  fi
  
  echo "✅ Cleanup completato"
}

# Setup trap per cleanup automatico
trap cleanup EXIT INT TERM

# Step 1: Setup environment
echo "📋 Step 1: Setup environment..."
node scripts/agent-setup.js "$AGENT_ID"
if [ $? -ne 0 ]; then
  echo "❌ Setup environment fallito"
  exit 1
fi
echo "✅ Setup environment completato"

# Step 2: Acquire lock
echo ""
echo "📋 Step 2: Acquisizione lock..."
node scripts/agent-lock-manager.js acquire "$LOCK_HOST" "$AGENT_ID" "$TEST_PATH"
if [ $? -eq 0 ]; then
  LOCK_ACQUIRED="true"
  echo "✅ Lock acquisito: $AGENT_ID su $LOCK_HOST"
else
  echo "❌ Impossibile acquisire lock su $LOCK_HOST"
  echo "⏳ Tentativo di entrare in coda..."
  
  # Entra in queue
  node scripts/agent-lock-manager.js queue "$AGENT_ID" "$TEST_PATH"
  if [ $? -eq 0 ]; then
    echo "✅ Agente $AGENT_ID aggiunto alla coda"
    echo "⏳ In attesa di host disponibile..."
    
    # Polling per host disponibile
    while true; do
      sleep 30
      echo "🔄 Controllo disponibilità host..."
      
      node scripts/agent-lock-manager.js acquire "$LOCK_HOST" "$AGENT_ID" "$TEST_PATH"
      if [ $? -eq 0 ]; then
        LOCK_ACQUIRED="true"
        echo "✅ Lock acquisito dopo attesa!"
        break
      fi
      
      # Timeout dopo 10 minuti
      if [ $(( $(date +%s) - START_TIME )) -gt 600 ]; then
        echo "⏰ Timeout attesa lock (10 minuti)"
        echo "🚨 Uso host emergenza..."
        
        # Prova host emergenza (3002)
        EMERGENCY_HOST="localhost:3002"
        node scripts/agent-lock-manager.js acquire "$EMERGENCY_HOST" "$AGENT_ID" "$TEST_PATH"
        if [ $? -eq 0 ]; then
          LOCK_ACQUIRED="true"
          PORT="3002"
          LOCK_HOST="$EMERGENCY_HOST"
          echo "✅ Lock acquisito su host emergenza: $EMERGENCY_HOST"
          break
        else
          echo "❌ Impossibile acquisire lock anche su host emergenza"
          exit 1
        fi
      fi
    done
  else
    echo "❌ Impossibile entrare in coda"
    exit 1
  fi
fi

# Step 3: Start heartbeat
echo ""
echo "📋 Step 3: Avvio heartbeat..."
START_TIME=$(date +%s)

# Funzione heartbeat
heartbeat() {
  while true; do
    sleep $HEARTBEAT_INTERVAL
    node scripts/agent-lock-manager.js heartbeat "$AGENT_ID" || break
    echo "💓 Heartbeat: $AGENT_ID"
  done
}

# Avvia heartbeat in background
heartbeat &
HEARTBEAT_PID=$!
echo "✅ Heartbeat avviato (PID: $HEARTBEAT_PID)"

# Step 4: Run tests
echo ""
echo "📋 Step 4: Esecuzione test..."
echo "🎯 Comando: AGENT_PORT=$PORT AGENT_ID=$AGENT_ID npx playwright test \"$TEST_PATH\" -c playwright.config.unified.ts"

# Esegui test con variabili ambiente
AGENT_PORT="$PORT" AGENT_ID="$AGENT_ID" npx playwright test "$TEST_PATH" -c playwright.config.unified.ts

TEST_RESULT=$?

# Step 5: Report risultati
echo ""
echo "📋 Step 5: Report risultati..."
if [ $TEST_RESULT -eq 0 ]; then
  echo "✅ Test completati con successo"
  
  # Log successo
  echo "$(date): $AGENT_ID - Test SUCCESS - $TEST_PATH" >> .agent-locks/test-results.log
else
  echo "❌ Test falliti (exit code: $TEST_RESULT)"
  
  # Log fallimento
  echo "$(date): $AGENT_ID - Test FAILED - $TEST_PATH (exit: $TEST_RESULT)" >> .agent-locks/test-results.log
fi

# Step 6: Cleanup (gestito da trap)
echo ""
echo "📋 Step 6: Cleanup automatico..."

# Mostra statistiche finali
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo ""
echo "📊 STATISTICHE FINALI"
echo "===================="
echo "🤖 Agent ID: $AGENT_ID"
echo "🌐 Host: $LOCK_HOST"
echo "📁 Test Path: $TEST_PATH"
echo "⏱️ Durata: ${DURATION}s"
echo "📊 Risultato: $([ $TEST_RESULT -eq 0 ] && echo "✅ SUCCESS" || echo "❌ FAILED")"
echo ""

# Exit con codice risultato test
exit $TEST_RESULT
