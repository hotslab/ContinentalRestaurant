export default interface Time{
  _id: string | null,
  opening_hour: number,
  closing_hour: number,
  days_open: string[] | []
}