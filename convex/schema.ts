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
  hiredDate: v.optional(v.string()),
  isActive: v.boolean(),
  businessId: v.id('businesses'),
  positionId: v.id('roles'),
  updatedAt: v.string(),
};

export const language = {
  name: v.string(),
  value: v.string(),
};

export default defineSchema({
  users: defineTable({
    // Fields are optional
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
    .index('unique_position', ['name', 'businessId'])
    .searchIndex('business_id', {
      searchField: 'businessId',
    }),
  employees: defineTable(employee).index('by_businessId', ['businessId']),
  languages: defineTable(language).index('language', ['value']),
});
