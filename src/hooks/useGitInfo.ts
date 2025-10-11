/**
 * Hook per ottenere informazioni Git del progetto
 * Mostra branch corrente e altre info utili per il debugging
 */

export interface GitInfo {
  branch: string
  commit: string
  isDevelopment: boolean
  environment: 'development' | 'production' | 'staging'
}

export const useGitInfo = (): GitInfo => {
  // ✅ Ottieni branch da variabili ambiente o fallback
  const branch = import.meta.env.VITE_GIT_BRANCH || 
                 import.meta.env.GIT_BRANCH || 
                 'unknown'
  
  // ✅ Ottieni commit hash
  const commit = import.meta.env.VITE_GIT_COMMIT || 
                 import.meta.env.GIT_COMMIT || 
                 'unknown'
  
  // ✅ Determina ambiente
  const isDevelopment = import.meta.env.MODE === 'development'
  const environment = import.meta.env.MODE as 'development' | 'production' | 'staging'
  
  return {
    branch,
    commit: commit.substring(0, 8), // Solo primi 8 caratteri
    isDevelopment,
    environment
  }
}
