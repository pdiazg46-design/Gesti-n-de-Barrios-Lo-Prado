const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log("🔍 Resucitando células VIP perdidas...");
  const { data, error } = await supabase
    .from('vip_codes')
    .update({ current_uses: 0, is_active: true })
    .gt('current_uses', -1) // Truco para actualizar todas las filas
    .select();
  
  if (error) {
    console.error("❌ Error de Supabase:", error);
  } else {
    console.log("✅ ¡Éxito! Células resucitadas y limpias:");
    console.log(data);
  }
}
main();
