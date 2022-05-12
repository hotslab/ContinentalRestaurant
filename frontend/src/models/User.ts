export default interface User{
  _id: string | null,
  name: string | null,
  surname: string | null,
  email: string | null,
  role: string | null,
  password: string | null,
  isDeleted: string | null,
  created: string | null,
  updated: string | null,
  token: string | null
}