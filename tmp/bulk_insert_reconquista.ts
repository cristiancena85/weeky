
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const branchId = 'e9e3dd8a-5934-4456-b545-345d3f3bd5cb'

const rawData = `Wingeyer Julio	1234
Soto Ivan	3482 500796
Leonardo Bejarano	3482 558538
Magnago Pamela. Gonza	3482 303324
Magnago Pamela. Gonza	3482 391971
Acosta Lisandro	3498 458204
Wingeyer Julio	342 6304259
Lerf Ignacio	3482 692417
Cabrera Yamila	3482 630110
Guillermo Torossi	
Cabrera Yamila	
Zilli Nora 	3482 558 538
Pablo Braccia	3483 447 605
Sturon Julian	3482604455
Sinchit Juan Pablo	3482633256
Aldo Piercini Moncholito	3483 460380
Reta	3482 540 376
Luciano Siri	34823462331
Blanche Guillermo 	3425318458
Nicolas El Faraon	3483451511
Sandrigo Marcelo	3482 541811
Sandrigo Martin	3482 555 464
Patricelli Sergio 	3483 406 910
Juan Ramón Fabre	3483460841
René Carrara, Calchaquí	3483 400416
Fabri Alexis 	2491 501 548`

async function run() {
  const lines = rawData.split('\n')
  const toInsert = lines.map(line => {
    const parts = line.split('\t').map(s => s.trim())
    const name = parts[0]
    const phone = parts[1]
    
    // Si no hay nombre pero hay teléfono, lo tomamos como nombre temporal
    const finalName = name || (phone ? `Cliente ${phone}` : 'Desconocido')
    const finalPhone = phone || null

    if (finalName === 'Desconocido' && !finalPhone) return null

    return {
      name: finalName,
      phone: finalPhone,
      address: 'Poder General (Reconquista)',
      type: 'cliente',
      branch_id: branchId
    }
  }).filter(Boolean)

  console.log(`Intentando insertar ${toInsert.length} cuentas para Reconquista...`)

  const { data, error } = await supabase
    .from('customers')
    .insert(toInsert)
    .select()

  if (error) {
    console.error('Error insertando:', error)
  } else {
    console.log(`Éxito! Insertadas ${data?.length} cuentas.`)
  }
}

run()
