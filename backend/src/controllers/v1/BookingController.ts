import { TimeInterface } from '../../models/v1/Time';
import { TableInterface } from '../../models/v1/Table';
import { BookingInterface } from '../../models/v1/Booking'
import { Context } from 'koa'
import moment from 'moment'
import Booking from '../../models/v1/Booking'
import Notification from '../../models/v1/Notification'
import Table from '../../models/v1/Table'
import Time from '../../models/v1/Time'
import redis from '../../utils/v1/redis'

async function areTablesAvailableThisHour(ctx: Context): Promise<boolean> {
  const tablesOccupied: BookingInterface[] = await Booking.find({ 
    status: 'booked', hour: ctx.request.body.hour, date: ctx.request.body.date 
  }).exec()
  const totalTables: TableInterface[] = await Table.find({}).exec()
  return totalTables.length > tablesOccupied.length
}

function formatedHour(hour: number): string {
  return `${hour < 10 ? `0${hour}:00` : `${hour}:00` } ${hour < 13 ? 'am' : 'pm' }`
}

export default {
  index: async (ctx: Context): Promise<void> => {
    try {
      const query = ctx.request.query
      const queryData = {
        email: { $regex: query.email, $options: "i" },
        date: { $gte: query.date },
        hour: { $gte: query.hour },
        status: { $in: ["queued", "booked"] },
      }
      if (query.booking_id) queryData['_id'] = query.booking_id
      await Booking.find(queryData)
        .populate("table")
        .sort({ date: -1, updated: -1 })
        .then(bookings => {
          if (!bookings) {
            ctx.status = 200;
            ctx.body = { bookings: [] }
          } else {
            ctx.status = 200;
            ctx.body = { bookings: bookings }
          }
        })
        .catch((error) => {
          if (error.message.indexOf("Cast to ObjectId failed") !== -1) {
            ctx.status = 200;
            ctx.body = { bookings: [], message: "Data was not found" };
          } else {
            ctx.status = error.statusCode || error.status || 500;
            ctx.body = { message: error.message };
          }
        })
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  show: async (ctx: Context): Promise<void> => {
    try {
      ctx.status = 200
      ctx.body = { booking: await Booking.findById(ctx.params.id).populate('table').exec() }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  create: async (ctx: Context): Promise<void> => {
    try {
      const data: any = ctx.request.body
      const time: TimeInterface = await Time.findById(1).exec()
      const isWrongOpeningTimeSelected = time.opening_hour > data.hour && time.closing_hour < data.hour
      if (isWrongOpeningTimeSelected) {
        ctx.status = 401
        ctx.body = { 
          message: `Your booking time is outside of the operating hours of 
          ${formatedHour(time.opening_hour)} - ${formatedHour(time.closing_hour)}` 
        }
        return
      }
      const areTablesAvailable = await areTablesAvailableThisHour(ctx)
      if (areTablesAvailable) {
        const isOccupiedTable: BookingInterface[] = await Booking.find({
          table: data.table, 
          status: 'booked', 
          hour: data.hour, 
          date: data.date
        }).exec()
        if (isOccupiedTable.length) {
            ctx.status = 401
            ctx.body = { 
              message: isOccupiedTable.find(booking => booking.email == data.email)
                ? `You are already booked for this table at this time slot`
                : `Your selected table has been booked by someone else for this hour. Please try another one.`
            }
            return        
        }
      }
      const booking = new Booking({
        name: data.name,
        surname: data.surname,
        email: data.email,
        people: data.people,
        date: data.date,
        hour: data.hour,
        status: areTablesAvailable ? 'booked' : 'queued',
        table: data.table
      })
      await booking.save()
      const bookingPopulated: BookingInterface = await Booking.findById(booking._id).populate('table').exec()
      const notification = await new Notification({
        type: `New Booking ${bookingPopulated._id} by ${data.creator_role == 'user' ? data.creator_email : 'management'} for table ${bookingPopulated.table.name}`,
        description: `
          New booking created for table ${bookingPopulated.table.name} on ${moment(bookingPopulated.date).format('YYYY-MM-DD')} at
          ${formatedHour(bookingPopulated.hour)} with ${bookingPopulated.people} people attending.
        `,
        created_by: data.creator_email,
        creator_role: data.creator_role,
        receiver_email: data.email,
        receiver_role: 'user', 
        received: false,
        content: bookingPopulated
      })
      await notification.save()
      if (process.env.NODE_ENV == 'production') await redis.publish('notification', JSON.stringify(notification))
      ctx.status = 200
      ctx.body = { 
        booking: bookingPopulated, 
        message: areTablesAvailable 
          ? 'Your booking has been created successfuly' 
          : `All tables are currently booked for this hour of ${formatedHour(data.hour)}. Your 
            booking has been added to a waiting list should a slot open for this specific hour, otherwise you 
            will be automaticaly booked at any hour starting from ${formatedHour(data.hour)} 
            to close depending if tables are available`
      }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  update: async (ctx: Context): Promise<void> => {
    try {
      const data: any = ctx.request.body
      const time: TimeInterface = await Time.findById(1).exec()
      const isWrongOpeningTimeSelected = time.opening_hour > data.hour && time.closing_hour < data.hour
      if (isWrongOpeningTimeSelected) {
        ctx.status = 401
        ctx.body = { 
          message: `Your booking time is outside of the operating hours of 
          ${formatedHour(time.opening_hour)} - ${formatedHour(time.closing_hour)}` 
        }
        return
      }
      const areTablesAvailable = await areTablesAvailableThisHour(ctx)
      if (areTablesAvailable) {
        const isOccupiedTable: BookingInterface[] = await Booking.find({
          table: data.table, 
          status: 'booked', 
          hour: data.hour, 
          date: data.date
        }).exec()
        if (isOccupiedTable.length) {
            ctx.status = 401
            ctx.body = { 
              message: isOccupiedTable.find(booking => booking.email == data.email)
                ? `You are already booked for this table at this time slot`
                : `Your selected table has been booked by someone else for this hour. Please try another one.`
            }
            return        
        }
      }
      await Booking.findByIdAndUpdate(ctx.params.id, { 
        $set: {
          name: data.name,
          surname: data.surname,
          email: data.email,
          people: data.people,
          date: data.date,
          hour: data.hour,
          status: areTablesAvailable ? 'booked' : 'queued',
          table: data.table
        }
      }).exec()
      const bookingPopulated: BookingInterface = await Booking.findById(ctx.params.id).populate('table').exec()
      const notification = await new Notification({
        type: `Updated Booking ${bookingPopulated._id} by ${data.creator_role == 'user' ? data.creator_email : 'management'} for table ${bookingPopulated.table.name}`,
        description: `
          Booking details updated for table ${bookingPopulated.table.name} on ${moment(bookingPopulated.date).format('YYYY-MM-DD')} at
          ${formatedHour(bookingPopulated.hour)} with ${bookingPopulated.people} people attending.
        `,
        created_by: data.creator_email,
        creator_role: data.creator_role,
        receiver_email: data.email,
        receiver_role: 'user', 
        received: false,
        content: JSON.stringify(bookingPopulated)
      })
      await notification.save()
      if (process.env.NODE_ENV == 'production') await redis.publish('notification', JSON.stringify(notification))
      ctx.status = 200
      ctx.body = { booking: bookingPopulated, message: 'Booking has been updated succesfully' }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  destroy: async (ctx: Context): Promise<void> => {
    try {
      const query = ctx.request.query
      const booking = await Booking.findByIdAndUpdate(ctx.params.id, { $set: { status: 'cancelled' }}).exec()
      await booking.save()
      const bookingPopulated: BookingInterface = await Booking.findById(ctx.params.id).populate('table').exec()
      const notification = await new Notification({
        type: `Booking ${bookingPopulated._id} cancelled by ${query.creator_role == 'user' ? query.creator_email : 'management'} for table ${bookingPopulated.table.name}`,
        description: 'Booking cancelled.',
        created_by: query.creator_email,
        creator_role: query.creator_role,
        receiver_email: bookingPopulated.email,
        receiver_role: 'user',
        received: false,
        content: JSON.stringify(bookingPopulated)
      })
      notification.save()
      if (process.env.NODE_ENV == 'production') await redis.publish('notification', JSON.stringify(notification))
      ctx.status = 200
      ctx.body = { message: 'Booking has been cancelled successfuly' }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  }
}