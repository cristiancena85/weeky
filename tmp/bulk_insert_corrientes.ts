
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

const branchId = 'c85d32b5-1f3c-401f-9fd4-d9f5d537f379'

const rawData = `Ojeda Arturo	3777 721941
Torossi Alejandro	3482 611273
Romina Soru 	342 4236041
ADRIAN AZULA 	3794 804756
Flores Facundo Ernesto	3777 53 5780
Alegre Karina	3794 564552
Ocampo Dionel	3782 404285
Ramon Choio Mburucuyá	3782 525706
Boni Eduardo	3782 523842
Leandro Coko Portillo	3794734609
Boni Eduardo	3794 335842
Falcón Germán	3794 506627
Yoel Cabrera El Pibe de Oro	3794010805
Lombardo Teo	3794204511
Gustavo Zanuzzi	3794662298
Joaquin Varela, May. Armenia 	3794 550700
Martin Achinelly	3782449414
Miguel Carpes	3756418748
José Chapa Arce	3782453748
Leandro Coko Portillo	3794085865
Juan Manuel Romero	3782558272
Miguel Angel Aquino	3756461619
Dist Angá, Patricia	3786513985
Matías Vallejo	3794223268
Picurú SRL	3782437480
Distribuidora RyB Ariel	3794585847
Jorge López	3782479994
Jorge Fosechatto JAF	3756 491229
Daniel Rivero, Loreto	3781419009
Emanuel Brasilero Rodriguez	3781409446
Fabián Sesin	3782477583
Danilo Franco	3756438313
Ronan Alfonso	3781498357
Franco Marzeniuk	3794553366
Martin Hipólito Cabrera	3756509720
Pablo Cáceres	3794799602
Distribuidora Alem, Alejandro	3715618938
David Luque	3782515193
Juan Fernandez	2916425602`

async function run() {
  const lines = rawData.split('\n')
  const toInsert = lines.map(line => {
    const [name, phone] = line.split('\t').map(s => s.trim())
    
    // Si no hay nombre pero hay teléfono, lo tomamos como nombre temporal
    const finalName = name || (phone ? `Cliente ${phone}` : 'Desconocido')
    const finalPhone = phone || null

    if (finalName === 'Desconocido' && !finalPhone) return null

    return {
      name: finalName,
      phone: finalPhone,
      address: 'Poder General (Corrientes)',
      type: 'cliente',
      branch_id: branchId
    }
  }).filter(Boolean)

  console.log(`Intentando insertar ${toInsert.length} cuentas...`)

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
