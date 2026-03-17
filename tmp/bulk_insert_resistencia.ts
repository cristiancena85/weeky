
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

const branchId = 'ad382fc4-3f2a-4252-ab02-386c1a790b40'

const rawData = `Osvaldo Lopez	3624107817
Rodolfo Barrios	
Alfredo Avalos 	3624693859
RICARDO ALVAREZ 	3624693859
Pablo Dario Bazzolo	
Piazza Emanuel	3424 055409
Diduch Miguel	11 2451 9533
Matias Dominguez 	3735606166
Roda Cristian	364 4605205
Pegoraro Milagros	3731 622075
Dante Franco	3725 441706
BRAIAN LUNA 	
Panelli	
Julio Acuña	3625541990
Arion Aeschlimann	3624731323
Daniel Maidana	3624875195
Cesar El Mago. Cadena 3K	3624 558058
Daniel Luque (Fox 25 de Mayo)	3624 681073
	3624776262
Jose "Nacho" Gomez - Mi 24Hs	3624274470
CADENA TOTO	3624542910
Sergio Lencina (Full Time 24Hs)	3625170558
	3624 090797
Pablo Aguirre	3624788440
Laura Meza	3624896609
Jose "Nacho" Gomez - Mi 24Hs	3624888650
Basiniani Maria Sol : facundo 	3624545334
Sergio Lencina (Full Time 24Hs)	3624022333
Pablo Turella (Cadena Jonny)	3624718023
Nito Mezza	3625710584
Panelli	3624 222310
Cardozo Miguel Alex	3624930659
Marcelo Valenzuela	3624548178
Marcos Baldobino	3624915649
Marín Alejandro	3624202488`

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
      address: 'Poder General (Resistencia)',
      type: 'cliente', // Por defecto todos como clientes para pre-venta
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
