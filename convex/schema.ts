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
  description: v.optional(v.string()),
  businessId: v.id('businesses'),
  serviceId: v.optional(v.array(v.id('services'))),
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
  updatedAt: v.string(),
};

export const employeeUnavailability = {
  employeeId: v.id('employees'),
  businessId: v.id('businesses'),
  startDate: v.string(),
  endDate: v.string(),
  reason: v.optional(v.string()),
  updatedAt: v.string(),
};

export const service = {
  name: v.string(),
  description: v.optional(v.string()),
  price: v.number(),
  businessId: v.id('businesses'),
  categoryIds: v.optional(v.array(v.id('categories'))),
  mediaIds: v.optional(v.array(v.id('media'))),
  updatedAt: v.string(),
};

export const category = {
  name: v.string(),
  description: v.optional(v.string()),
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
  bookingServiceIds: v.array(v.id('bookingServices')),
  date: v.string(),
  updatedAt: v.string(),
  status: v.union(
    v.literal('REQUESTED'),
    v.literal('CONFIRMED'),
    v.literal('PENDING'),
    v.literal('COMPLETED'),
    v.literal('CANCELED'),
    v.literal('NO SHOW'),
  ),
  reviewId: v.optional(v.id('reviews')),
};

export const bookingService = {
  employeeId: v.id('employees'),
  customerId: v.id('customers'),
  businessId: v.id('businesses'),
  bookingId: v.id('bookings'),
  serviceId: v.id('services'),
  updatedAt: v.string(),
};

export const review = {
  businessId: v.id('businesses'),
  bookingId: v.id('bookings'),
  customerId: v.id('customers'),
  rating: v.union(
    v.literal(1),
    v.literal(2),
    v.literal(3),
    v.literal(4),
    v.literal(5),
  ),
  review: v.optional(v.string()),
  serviceFeedbackIds: v.optional(v.array(v.id('serviceFeedbacks'))),
  updatedAt: v.string(),
};

export const serviceFeedback = {
  employeeId: v.id('employees'),
  serviceId: v.id('services'),
  reviewId: v.id('reviews'),
  businessId: v.id('businesses'),
  rating: v.union(
    v.literal(1),
    v.literal(2),
    v.literal(3),
    v.literal(4),
    v.literal(5),
  ),
  review: v.optional(v.string()),
  updatedAt: v.string(),
};

export const media = {
  businessId: v.id('businesses'),
  fileName: v.string(),
  width: v.number(),
  height: v.number(),
  duration: v.optional(v.number()),
  altText: v.optional(v.string()),
  caption: v.optional(v.string()),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  updatedAt: v.string(),
  createdBy: v.union(v.id('users'), v.id('employees'), v.id('customers')),
  storageId: v.id('_storage'),
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
  employees: defineTable(employee)
    .index('by_businessId', ['businessId'])
    .index('by_positionId', ['positionId']),
  languages: defineTable(language).index('language', ['value']),
  shifts: defineTable(shift)
    .index('by_businessId', ['businessId'])
    .index('by_employeeId', ['employeeId']),
  nationalHolidays: defineTable(nationalHoliday).index('by_date', ['date']),
  employeeUnavailabilities: defineTable(employeeUnavailability)
    .index('by_employee_date_range', ['employeeId', 'startDate', 'endDate'])
    .index('by_employee_end_date', ['employeeId', 'endDate'])
    .index('by_business_id', ['businessId'])
    .index('by_employee_id', ['employeeId']),
  services: defineTable(service)
    .index('by_businessId', ['businessId'])
    .index('by_categoryId', ['categoryIds']),
  customers: defineTable(customer).index('by_businessId', ['businessId']),
  bookings: defineTable(booking).index('by_businessId', ['businessId']),
  bookingServices: defineTable(bookingService).index('by_businessId', [
    'businessId',
  ]),
  reviews: defineTable(review).index('by_businessId', ['businessId']),
  serviceFeedbacks: defineTable(serviceFeedback)
    .index('by_businessId', ['businessId'])
    .index('by_serviceId', ['serviceId'])
    .index('by_employeeId', ['employeeId'])
    .index('by_reviewId', ['reviewId']),
  categories: defineTable(category).index('by_businessId', [
    'businessId',
    'name',
  ]),
  media: defineTable(media)
    .index('by_businessId', ['businessId'])
    .index('by_createdBy', ['createdBy']),
});
