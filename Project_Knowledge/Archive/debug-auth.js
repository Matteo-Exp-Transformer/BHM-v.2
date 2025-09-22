// Debug script per testare l'autenticazione
console.log('🔍 Debug Authentication Test')
console.log('Current URL:', window.location.href)
console.log('Origin:', window.location.origin)
console.log('Host:', window.location.host)
console.log('Protocol:', window.location.protocol)

// Test localStorage
console.log('LocalStorage keys:', Object.keys(localStorage))
console.log('Clerk session:', localStorage.getItem('__clerk_session_token'))
console.log(
  'Supabase session:',
  localStorage.getItem('sb-rcdyadsluzzzsybwrmlz-auth-token')
)

// Test sessionStorage
console.log('SessionStorage keys:', Object.keys(sessionStorage))

// Test cookies
console.log('Cookies:', document.cookie)

// Test se Clerk è caricato
if (window.Clerk) {
  console.log('✅ Clerk is loaded')
  console.log('Clerk user:', window.Clerk.user)
  console.log('Clerk session:', window.Clerk.session)
} else {
  console.log('❌ Clerk not loaded')
}

// Test se Supabase è caricato
if (window.supabase) {
  console.log('✅ Supabase is loaded')
} else {
  console.log('❌ Supabase not loaded')
}
