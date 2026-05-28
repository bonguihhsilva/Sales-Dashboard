import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const adminAuthClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function run() {
  // Find user by email
  const { data: { users }, error: listError } = await adminAuthClient.auth.admin.listUsers()
  if (listError) {
    console.error('Error listing users:', listError)
    process.exit(1)
  }

  const user = users.find(u => u.email === 'suporte@gds-frame.com')
  if (!user) {
    console.error('User suporte@gds-frame.com not found')
    process.exit(1)
  }

  const { data, error } = await adminAuthClient.auth.admin.updateUserById(
    user.id,
    { password: 'GDSF@Dash' }
  )

  if (error) {
    console.error('Error updating password:', error)
    process.exit(1)
  }

  console.log('Password updated successfully for', user.email)
}

run()
