// Script per reset onboarding
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tucqgcfrlzmwyfadiodo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y3FnY2ZybHptd3lmYWRpb2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTY0ODksImV4cCI6MjA3NTUzMjQ4OX0.7m3bdxW8QMHO6YNQ4cxoxlzzgzq7DjTzufv89YAcHA4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetOnboardingData() {
  try {
    console.log('🔄 Inizio reset dati onboarding...');
    
    // Pulisci localStorage (simula quello che farebbe il browser)
    console.log('🧹 Pulizia localStorage simulata...');
    
    // Pulisci sessionStorage (simula quello che farebbe il browser)
    console.log('🧹 Pulizia sessionStorage simulata...');
    
    // Pulisci dati onboarding dal database
    console.log('🗄️ Pulizia dati onboarding dal database...');
    
    // Rimuovi dati onboarding (ma preserva dati Precompila)
    const { error: departmentsError } = await supabase
      .from('departments')
      .delete()
      .neq('name', 'Cucina')  // Preserva Cucina
      .neq('name', 'Bancone') // Preserva Bancone
      .neq('name', 'Sala')    // Preserva Sala
      .neq('name', 'Magazzino'); // Preserva Magazzino
    
    if (departmentsError) {
      console.log('⚠️ Errore pulizia departments:', departmentsError.message);
    } else {
      console.log('✅ Departments puliti (preservati dati Precompila)');
    }
    
    // Rimuovi staff (ma preserva Paolo Dettori)
    const { error: staffError } = await supabase
      .from('staff')
      .delete()
      .neq('name', 'Paolo')  // Preserva Paolo Dettori
      .neq('surname', 'Dettori');
    
    if (staffError) {
      console.log('⚠️ Errore pulizia staff:', staffError.message);
    } else {
      console.log('✅ Staff pulito (preservato Paolo Dettori)');
    }
    
    // Rimuovi conservation_points (ma preserva Frigo A e Freezer A)
    const { error: conservationError } = await supabase
      .from('conservation_points')
      .delete()
      .neq('name', 'Frigo A')    // Preserva Frigo A
      .neq('name', 'Freezer A'); // Preserva Freezer A
    
    if (conservationError) {
      console.log('⚠️ Errore pulizia conservation_points:', conservationError.message);
    } else {
      console.log('✅ Conservation points puliti (preservati Frigo A e Freezer A)');
    }
    
    // Rimuovi dati di onboarding dalla tabella companies se necessario
    const { error: companyError } = await supabase
      .from('companies')
      .update({ 
        onboarding_completed: false,
        onboarding_step: 0,
        onboarding_data: null
      })
      .eq('id', '091dbcea-048f-4aca-a7e6-b6dad247a58d'); // ID company Al Ritrovo SRL
    
    if (companyError) {
      console.log('⚠️ Errore reset company onboarding:', companyError.message);
    } else {
      console.log('✅ Company onboarding reset');
    }
    
    console.log('✅ Reset onboarding completato!');
    console.log('📝 Ora puoi ripetere l\'onboarding pulito');
    
  } catch (error) {
    console.error('❌ Errore durante reset:', error);
  }
}

resetOnboardingData();
