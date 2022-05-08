import 'dotenv/config'
import fs from 'fs'
import momentTimezone from 'moment-timezone'

try {
  process.env.TZ = fs.readFileSync('/etc/timezone', 'utf8').trim() 
  momentTimezone.tz.setDefault(process.env.TZ)
  console.log(`Timezone set to ${process.env.TZ}`)
} catch (err) { console.error(err) }

