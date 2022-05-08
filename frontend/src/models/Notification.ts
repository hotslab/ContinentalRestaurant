export default interface Notification {
  _id: string,
  type: string,
  description: string,
  created_by: string,
  creator_role: string,
  receiver_email: string,
  receiver_role: string,
  received: string,
  content: string,
  created:  Date
  updated: Date
}