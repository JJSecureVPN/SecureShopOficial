// Script para probar la sincronización de compras con Supabase
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvxtlepjcpogiqgrzlpx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2eHRsZXBqY3BvZ2lxZ3J6bHB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0ODk1MywiZXhwIjoyMDgxMzI0OTUzfQ.75iW23-u5jfDi4XtIjorzS6Kve7p2uhSySP81dmW7Y8'
);

async function testPurchase() {
  const testEmail = 'jjsecurevpn@gmail.com';
  
  console.log('🔍 Buscando perfil para:', testEmail);
  
  // Buscar el perfil del usuario
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', testEmail)
    .single();
  
  if (profileError) {
    console.log('❌ Error buscando perfil:', profileError.message);
    console.log('');
    console.log('📋 Listando todos los perfiles existentes:');
    const { data: allProfiles } = await supabase.from('profiles').select('*');
    console.log(allProfiles);
    return;
  }
  
  console.log('✅ Perfil encontrado:', profile);
  console.log('');
  
  // Simular una compra
  const purchaseData = {
    user_id: profile.id,
    tipo: 'plan',
    plan_nombre: 'Plan Premium 1 Mes (PRUEBA)',
    monto: 4500.00,
    estado: 'aprobado',
    servex_username: 'test_user_' + Date.now(),
    servex_password: 'test_pass_123',
    servex_expiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    servex_connection_limit: 2,
    mp_payment_id: 'TEST_' + Date.now()
  };
  
  console.log('💳 Insertando compra de prueba:', purchaseData);
  
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchase_history')
    .insert(purchaseData)
    .select()
    .single();
  
  if (purchaseError) {
    console.log('❌ Error insertando compra:', purchaseError.message);
    return;
  }
  
  console.log('');
  console.log('✅ Compra guardada exitosamente:', purchase);
  console.log('');
  
  // Verificar el historial completo
  console.log('📜 Historial de compras del usuario:');
  const { data: history } = await supabase
    .from('purchase_history')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });
  
  console.log(history);
}

testPurchase().catch(console.error);
