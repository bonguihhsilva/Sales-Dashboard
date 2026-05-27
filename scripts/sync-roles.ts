import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  console.log('Fetching profiles...')
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, role')

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
    process.exit(1)
  }

  console.log(`Found ${profiles.length} profiles. Updating app_metadata...`)

  let successCount = 0
  let errorCount = 0

  for (const profile of profiles) {
    const { id, role } = profile
    
    // Auth admin API allows updating app_metadata
    const { data: user, error: updateError } = await supabase.auth.admin.updateUserById(
      id,
      { app_metadata: { role } }
    )

    if (updateError) {
      console.error(`Error updating user ${id}:`, updateError.message)
      errorCount++
    } else {
      successCount++
      console.log(`User ${id} updated to role: ${role}`)
    }
  }

  console.log('Sync complete.')
  console.log(`Successfully updated: ${successCount}`)
  console.log(`Errors: ${errorCount}`)
}

run()
