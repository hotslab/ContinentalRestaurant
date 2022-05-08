import { TimeInterface } from '../../models/v1/Time'
import { TableInterface } from '../../models/v1/Table'
import { BookingInterface } from '../../models/v1/Booking'
import Time from '../../models/v1/Time'
import Booking from '../../models/v1/Booking'
import Notification from '../../models/v1/Notification'
import moment from 'moment'
import redis from '../../utils/v1/redis'
import Table from '../../models/v1/Table'

export default async function (): Promise<void> {
  try {
    console.log(`Booking reassignment cron started at ${moment().format('YYYY-MM-DD HH:mm:ss')}`)
    const bookings: BookingInterface[] = await Booking.find({status: 'queued', date: moment().format('YYYY-MM-DD')}).sort({created: -1})
    const openingTimes: TimeInterface = await Time.findById(1).exec()
    console.log(`Found ${bookings.length} bookings to be processed...`)
    for (const [index, booking] of bookings.entries()) reAssignBooking(index, booking, openingTimes)
  } catch (error) {
    console.error(error)
  }
}

async function reAssignBooking(index: number, booking: BookingInterface, openingTimes: TimeInterface): Promise<void> {
  console.log(`Processing booking No. ${index + 1}...`)
  if (checkIfTimeIsAvailableToBookInChosenHour(booking)) {
    if (await assignChosenTableInChosenHourIfAvaialbe(index, booking)) return
    if (await assignNewTableInChosenHourIfAvailable(index, booking)) return
  } else {
    if (await assignChosenTableInNextHourIfAvailable(index, booking, openingTimes)) return
    if (await assignNewTableInNextHourIfAvailable(index, booking, openingTimes)) return
  }
  console.log(`Booking No. ${index + 1} was not reassigned in this session...`)
}

async function assignChosenTableInChosenHourIfAvaialbe(index: number, booking: BookingInterface): Promise<boolean> {
  const bookings: BookingInterface[] = await Booking.find({
    table: booking.table,
    hour: booking.hour,
    date: booking.date,
    status: 'booked'
  })
  if (bookings.length <= 0) {
    const savedBooking: BookingInterface =  await Booking.findByIdAndUpdate(booking._id, { $set: { status: 'booked'}}).exec()
    const bookingPopulated: BookingInterface = await Booking.findById(savedBooking._id).populate('table').exec()
    const notification = await new Notification({
      type: `Booking for table ${bookingPopulated.table.name} by ${bookingPopulated.email} has been set from waiting list`,
      description: `
        The table ${bookingPopulated.table.name} has been booked on ${bookingPopulated.date} at ${hourFormat(bookingPopulated.hour)}
      `,
      created_by: 'system',
      creator_role: 'system',
      receiver_email: bookingPopulated.email,
      receiver_role: 'user',
      received: false,
      content: JSON.stringify(bookingPopulated)
    })
    await notification.save()
    await redis.publish('notification', JSON.stringify(notification))
    console.log({status: `Booking No. ${index + 1} assigned original chosen table at chosen time`, data: notification})
    return true
  } else return false
}

async function assignNewTableInChosenHourIfAvailable(index: number, booking: BookingInterface): Promise<boolean> {
  const availableTables: TableInterface[] = (await Table.find({})).filter(async table => {
    const tableHasBookings: BookingInterface[] = await Booking.find({
      table: table._id,
      hour: booking.hour,
      date: booking.date,
      status: 'booked'
    }).exec()
    return tableHasBookings.length <= 0 
  })
  if (availableTables.length > 0) {
    const selectedTable = availableTables[0]
    const savedBooking: BookingInterface =  await Booking.findByIdAndUpdate(booking._id, { 
      $set: { status: 'booked', table: selectedTable._id }
    }).exec()
    const bookingPopulated: BookingInterface = await Booking.findById(savedBooking._id).populate('table').exec()
    const notification = await new Notification({
      type: `Booking for table ${bookingPopulated.table.name} by ${bookingPopulated.email} has been set from waiting list`,
      description: `
        The table ${bookingPopulated.table.name} has been booked on ${bookingPopulated.date} at ${hourFormat(bookingPopulated.hour)}
      `,
      created_by: 'system',
      creator_role: 'system',
      receiver_email: bookingPopulated.email,
      receiver_role: 'user',
      received: false,
      content: JSON.stringify(bookingPopulated)
    })
    await notification.save()
    await redis.publish('notification', JSON.stringify(notification))
    console.log({
      status: `Booking No. ${index + 1} assigned a new table ${bookingPopulated.table.name} at chosen time`, 
      data: notification
    })
    return true
  } else return false
}

async function assignChosenTableInNextHourIfAvailable(index: number, booking: BookingInterface, openingTimes: TimeInterface): Promise<boolean> {
  const currentHour = parseInt(moment().format('H'))
  if (currentHour >= booking.hour) {
    const selectedHour = currentHour + 1
    if (selectedHour > openingTimes.closing_hour) {
      await Booking.findByIdAndUpdate(booking._id, { 
        $set: { status: 'cancelled'}
      }).exec()
      const bookingPopulated: BookingInterface = await Booking.findById(booking._id).populate('table').exec()
      const notification = await new Notification({
        type: `Booking for table ${bookingPopulated.table.name} by ${bookingPopulated.email} from waiting list has been cancelled`,
        description: `The table ${bookingPopulated.table.name} has been canceled as restaurant closing times have been reached`,
        created_by: 'system',
        creator_role: 'system',
        receiver_email: bookingPopulated.email,
        receiver_role: 'user',
        received: false,
        content: JSON.stringify(bookingPopulated)
      })
      await notification.save()
      await redis.publish('notification', JSON.stringify(notification))
      console.log({
        status: `Booking No. ${index + 1} cancelled as restaurant times are closed`, 
        data: notification
      })
      return true
    }
    const bookings: BookingInterface[] = await Booking.find({
      table: booking.table,
      hour: selectedHour,
      date: booking.date,
      status: 'booked'
    })
    if (bookings.length <= 0) {
      const savedBooking =  await Booking.findByIdAndUpdate(booking._id, { 
        $set: { status: 'booked', hour: selectedHour }
      }).exec()
      const bookingPopulated: BookingInterface = await Booking.findById(savedBooking._id).populate('table').exec()
      const notification = await new Notification({
        type: `Booking for table ${bookingPopulated.table.name} by ${bookingPopulated.email} has been set from waiting list`,
        description: `
          The table ${bookingPopulated.table.name} has been booked on ${bookingPopulated.date} at ${hourFormat(bookingPopulated.hour)}
        `,
        created_by: 'system',
        creator_role: 'system',
        receiver_email: bookingPopulated.email,
        receiver_role: 'user',
        received: false,
        content: JSON.stringify(bookingPopulated)
      })
      await notification.save()
      await redis.publish('notification', JSON.stringify(notification))
      console.log({
        status: `Booking No. ${index + 1} assigned original chosen table at new time ${hourFormat(bookingPopulated.hour)}`, 
        data: notification
      })
      return true
    } else return false
  } else return false
}

async function assignNewTableInNextHourIfAvailable(index: number, booking: BookingInterface, openingTimes: TimeInterface): Promise<boolean> {
  const currentHour = parseInt(moment().format('H'))
  if (currentHour >= booking.hour) {
    const selectedHour = currentHour + 1
    if (selectedHour > openingTimes.closing_hour) {
      await Booking.findByIdAndUpdate(booking._id, { 
        $set: { status: 'cancelled'}
      }).exec()
      const bookingPopulated: BookingInterface = await Booking.findById(booking._id).populate('table').exec()
      const notification = await new Notification({
        type: `Booking for table ${bookingPopulated.table.name} by ${bookingPopulated.email} from waiting list has been cancelled`,
        description: `The table ${bookingPopulated.table.name} has been canceled as restaurant closing times have been reached`,
        created_by: 'system',
        creator_role: 'system',
        receiver_email: bookingPopulated.email,
        receiver_role: 'user',
        received: false,
        content: JSON.stringify(bookingPopulated)
      })
      await notification.save()
      await redis.publish('notification', JSON.stringify(notification))
      console.log({
        status: `Booking No. ${index + 1} cancelled as restaurant times are closed`, 
        data: notification
      })
      return true
    }
    const tablesAvailableNextHour: TableInterface[] = (await Table.find({})).filter(async table => {
      const tableHasBookings: BookingInterface[] = await Booking.find({
        table: table._id,
        hour: (booking.hour + 1),
        date: booking.date,
        status: 'booked'
      }).exec()
      return tableHasBookings.length <= 0 
    })
    if (tablesAvailableNextHour.length > 0) {
      const selectedTable = tablesAvailableNextHour[0]
      const savedBooking: BookingInterface =  await Booking.findByIdAndUpdate(booking._id, { 
        $set: { status: 'booked', hour: (booking.hour + 1), table: selectedTable._id }
      }).exec()
      const bookingPopulated: BookingInterface = await Booking.findById(savedBooking._id).populate('table').exec()
      const notification = await new Notification({
        type: `Booking for table ${bookingPopulated.table.name} by ${bookingPopulated.email} has been set from waiting list`,
        description: `
          The table ${bookingPopulated.table.name} has been booked on ${bookingPopulated.date} at ${hourFormat(bookingPopulated.hour)}
        `,
        created_by: 'system',
        creator_role: 'system',
        receiver_email: bookingPopulated.email,
        receiver_role: 'user',
        received: false,
        content: JSON.stringify(bookingPopulated)
      })
      await notification.save()
      await redis.publish('notification', JSON.stringify(notification))
      console.log({
        status: `Booking No. ${index + 1} assigned new table ${bookingPopulated.table.name} at new time ${hourFormat(bookingPopulated.hour)}`, 
        data: notification
      })
      return true
    } else return false
  } else return false
}

// helper functions

function hourFormat(hour: number) {
  return `${hour < 10 ? `0${hour}:00` : `${hour}:00` } ${hour < 13 ? 'am' : 'pm' }`
}

function checkIfTimeIsAvailableToBookInChosenHour(booking: BookingInterface) {
  const bookingTime = (new Date((new Date(booking.date)).setHours(0,0,0,0))).getTime()
  const currentTime = (new Date(booking.date)).getTime()
  const diff = bookingTime - currentTime
  return bookingTime > currentTime && Math.floor((diff/60000)) > 30 
}
