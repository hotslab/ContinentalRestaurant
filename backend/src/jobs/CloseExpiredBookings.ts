
import Booking from '../models/Booking'
import moment from 'moment'

export default async function (): Promise<void> {
  try {
    console.log(`Cron to close expired bookings started at ${moment().format('YYYY-MM-DD HH:mm:ss')}`)
    const bookings = await Booking.updateMany({
      date: { $lt: moment().format('YYYY-MM-DD') },
      status: 'booked' 
    }, { status: 'closed'})
    if (bookings.acknowledged)
      console.log(`${bookings.modifiedCount} expired bookings have been found and ${bookings.matchedCount} modified`)
  } catch (error) {
    console.error(error)
  }
}