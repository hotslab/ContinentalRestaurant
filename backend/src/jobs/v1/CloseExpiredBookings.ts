
import Booking from '../../models/v1/Booking'
import Notification from '../../models/v1/Notification'
import redis from '../../utils/v1/redis'
import moment from 'moment'

export default async function (): Promise<void> {
  try {
    
    consoleLog(`Cron to close expired bookings started at ${moment().format('YYYY-MM-DD HH:mm:ss')}`)
    const bookings = await Booking.updateMany({
      date: { $lt: moment().format('YYYY-MM-DD') },
      status: 'booked' 
    }, { status: 'closed'})
    if (bookings.acknowledged)
      consoleLog(`${bookings.modifiedCount} expired bookings have been found and ${bookings.matchedCount} modified`)
      if (bookings.modifiedCount) {
        const notification = await new Notification({
          type: `Expired bookings closed from yesterday`,
          description: `
            This message is to infom you that ${bookings.matchedCount} bookings that were expired
            from yesterday have their status been marked to closed of which ${bookings.modifiedCount}
            were modified to reflect this status change.
          `,
          created_by: 'system',
          creator_role: 'system',
          receiver_email: 'manager',
          receiver_role: 'manager',
          received: false,
          content: JSON.stringify({
            type:'Expired Bookings Closed', 
            modified: bookings.modifiedCount,
            matched: bookings.matchedCount
          })
        })
        await notification.save()
        if (process.env.NODE_ENV == 'production') await redis.publish('notification', JSON.stringify(notification))
      }
  } catch (error) {
    console.error(error)
    console.log()
  }
}

function consoleLog(...message: any[]) {
  console.log('Close expired bookings notification....')
  console.log(...message)
  console.log()
}