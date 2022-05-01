import Table from 'src/models/Table'
export default interface Booking{
  _id: string | null,
  name: string | null,
  surname: string | null,
  email: string | null,
  people: number | null,
  time: number | null,
  status: string | null,
  created: string | null,
  updated: string | null,
  table: Table | null
}