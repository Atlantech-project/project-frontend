// One REST resource of the API (CT-01), e.g. createResource('/audit-logs').
// Lists answer { data, meta: { page, per_page, total } }; the other calls return the record.
import { http } from './http'

export function createResource(path) {
  const url = (id) => `${path}/${encodeURIComponent(id)}`
  return Object.freeze({
    path,
    async list(params = {}) {
      const { data } = await http.get(path, { params })
      return { items: data.data ?? [], meta: data.meta ?? null }
    },
    async get(id) {
      const { data } = await http.get(url(id))
      return data
    },
    async create(body) {
      const { data } = await http.post(path, body)
      return data
    },
    // `body` carries the record's version token (updated_at); a stale one answers 409 (FE-032).
    async update(id, body) {
      const { data } = await http.patch(url(id), body)
      return data
    },
    async remove(id) {
      await http.delete(url(id))
    },
  })
}
