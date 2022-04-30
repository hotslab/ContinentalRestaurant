export default interface Time{
  _id: number,
  opening_hour: number,
  closing_hour: number,
  days_open: string[] | [] | undefined
}