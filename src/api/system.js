// Public port information (CT-04): port name for the sign-in page, licence mode.
import { http } from './http'

export async function fetchSystemInfo() {
  const { data } = await http.get('/system/info', { skipSessionLost: true })
  return data
}
