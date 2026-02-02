const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://yvxtlepjcpogiqgrzlpx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2eHRsZXBqY3BvZ2lxZ3J6bHB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0ODk1MywiZXhwIjoyMDgxMzI0OTUzfQ.75iW23-u5jfDi4XtIjorzS6Kve7p2uhSySP81dmW7Y8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('Aplicando migración: Agregar columna oculto a cupones...');

    // Verificar si la columna ya existe
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'cupones')
      .eq('column_name', 'oculto');

    if (columnsError) {
      console.error('Error verificando columnas:', columnsError);
      process.exit(1);
    }

    if (columns && columns.length > 0) {
      console.log('✅ La columna oculto ya existe');
      return;
    }

    // Ejecutar SQL directamente
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE cupones ADD COLUMN oculto BOOLEAN DEFAULT false;
        COMMENT ON COLUMN cupones.oculto IS 'Si es true, el cupón no se muestra públicamente en el header, solo accesible por código directo';
      `
    });

    if (error) {
      console.error('Error aplicando migración con rpc:', error);

      // Intentar con query directa
      console.log('Intentando con query directa...');
      const { error: directError } = await supabase
        .from('cupones')
        .select('*')
        .limit(1);

      if (directError) {
        console.error('Error de conexión:', directError);
        process.exit(1);
      }

      console.log('⚠️  No se pudo aplicar la migración automáticamente. Necesitas ejecutar manualmente en Supabase:');
      console.log('ALTER TABLE cupones ADD COLUMN IF NOT EXISTS oculto BOOLEAN DEFAULT false;');
      console.log('COMMENT ON COLUMN cupones.oculto IS \'Si es true, el cupón no se muestra públicamente en el header, solo accesible por código directo\';');
      process.exit(1);
    }

    console.log('✅ Migración aplicada exitosamente');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

applyMigration();