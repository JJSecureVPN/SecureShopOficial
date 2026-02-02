const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://yvxtlepjcpogiqgrzlpx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2eHRsZXBqY3BvZ2lxZ3J6bHB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0ODk1MywiZXhwIjoyMDgxMzI0OTUzfQ.75iW23-u5jfDi4XtIjorzS6Kve7p2uhSySP81dmW7Y8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMigration() {
  try {
    console.log('Verificando si la columna oculto existe en cupones...');

    // Intentar hacer una consulta que incluya la columna oculto
    const { data, error } = await supabase
      .from('cupones')
      .select('id, oculto')
      .limit(1);

    if (error && error.message.includes('oculto')) {
      console.log('❌ La columna oculto NO existe.');
      console.log('');
      console.log('🔧 Ejecuta esto en Supabase SQL Editor:');
      console.log('ALTER TABLE cupones ADD COLUMN IF NOT EXISTS oculto BOOLEAN DEFAULT false;');
      console.log('COMMENT ON COLUMN cupones.oculto IS \'Si es true, el cupón no se muestra públicamente en el header, solo accesible por código directo\';');
      process.exit(1);
    }

    if (error) {
      console.error('Error de conexión:', error.message);
      process.exit(1);
    }

    console.log('✅ La columna oculto existe correctamente');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkMigration();