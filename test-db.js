const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Conectando a Supabase para verificar perfiles...");
  const { data, error } = await supabase.from('profiles').select('*');
  
  if (error) {
    console.error("Error al obtener profiles:", error);
  } else {
    console.log("Perfiles actuales en BD:");
    console.log(JSON.stringify(data, null, 2));
  }
}

test();
