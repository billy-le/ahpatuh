import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const business = {
  name: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  domain: v.optional(v.string()),
  userId: v.id('users'),
  updatedAt: v.string(),
};

export const businessHour = {
  dayOfWeek: v.union(
    v.literal(0),
    v.literal(1),
    v.literal(2),
    v.literal(3),
    v.literal(4),
    v.literal(5),
    v.literal(6),
  ), // 0 is Sunday
  timeOpen: v.optional(v.string()),
  timeClose: v.optional(v.string()),
  isClosed: v.boolean(),
  businessId: v.id('businesses'),
  updatedAt: v.string(),
};

export const address = {
  street1: v.string(),
  street2: v.optional(v.string()),
  city: v.string(),
  state: v.string(),
  country: v.string(),
  postalCode: v.string(),
  businessId: v.id('businesses'),
  updatedAt: v.string(),
};

export const role = {
  name: v.string(),
  businessId: v.id('businesses'),
  updatedAt: v.string(),
};

export const employee = {
  firstName: v.string(),
  lastName: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  image: v.optional(v.string()),
  hiredDate: v.optional(v.string()),
  isActive: v.boolean(),
  isBookable: v.optional(v.boolean()),
  businessId: v.id('businesses'),
  positionId: v.optional(v.id('roles')),
  updatedAt: v.string(),
};

export const shift = {
  day: v.union(
    v.literal(0), // Sunday
    v.literal(1),
    v.literal(2),
    v.literal(3),
    v.literal(4),
    v.literal(5),
    v.literal(6),
  ),
  startTime: v.optional(v.string()),
  endTime: v.optional(v.string()),
  durationInMinutes: v.optional(v.number()),
  numOfBreaks: v.optional(v.number()),
  breakDurationInMinutes: v.optional(v.number()),
  dayOff: v.boolean(),
  employeeId: v.id('employees'),
  businessId: v.id('businesses'),
  updatedAt: v.string(),
};

export const nationalHoliday = {
  name: v.string(),
  date: v.string(),
};

export const employeeUnavailability = {
  employeeId: v.id('employees'),
  startDate: v.string(),
  endDate: v.string(),
  reason: v.optional(v.string()),
};

export const service = {
  name: v.string(),
  description: v.optional(v.string()),
  price: v.float64(),
  businessId: v.id('businesses'),
  updatedAt: v.string(),
};

export const customer = {
  name: v.string(),
  phone: v.string(),
  email: v.string(),
  businessId: v.id('businesses'),
  updatedAt: v.string(),
};

export const booking = {
  businessId: v.id('businesses'),
  customerId: v.id('customers'),
  employeeId: v.optional(v.id('employees')),
  serviceIds: v.array(v.id('services')),
  date: v.string(),
  updatedAt: v.string(),
  status: v.union(
    v.literal('PENDING'),
    v.literal('IN_PROGRESS'),
    v.literal('COMPLETED'),
    v.literal('CANCELED'),
  ),
};

export const language = {
  name: v.string(),
  value: v.string(),
};

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    langId: v.optional(v.id('languages')),
    email: v.string(),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
    timeZone: v.optional(v.string()),
  }),
  businesses: defineTable(business).index('by_userId', ['userId']),
  businessHours: defineTable(businessHour)
    .index('business_day', ['dayOfWeek', 'businessId'])
    .index('by_businessId', ['businessId']),
  addresses: defineTable(address).index('by_businessId', ['businessId']),
  roles: defineTable(role)
    .index('by_business_id', ['businessId'])
    .index('unique_position', ['name', 'businessId']),
  employees: defineTable(employee).index('by_businessId', ['businessId']),
  languages: defineTable(language).index('language', ['value']),
  shifts: defineTable(shift)
    .index('by_businessId', ['businessId'])
    .index('by_employeeId', ['employeeId']),
  nationalHolidays: defineTable(nationalHoliday).index('by_date', ['date']),
  employeeUnavailabilities: defineTable(employeeUnavailability).index(
    'by_employeeId',
    ['employeeId'],
  ),
  services: defineTable(service).index('by_businessId', ['businessId']),
  customers: defineTable(customer).index('by_businessId', ['businessId']),
  bookings: defineTable(booking).index('by_businessId', ['businessId']),
});
