import { mutation, query } from './_generated/server';
import { ConvexError } from 'convex/values';
import { v } from 'convex/values';
import { omit, pick } from 'ramda';
import type { Doc } from './_generated/dataModel';

export const getBusiness = query({
  args: {
    origin: v.string(),
  },
  handler: async (ctx, args) => {
    const domain = await ctx.db
      .query('domains')
      .withIndex('by_name_publicKey', (q) => q.eq('name', args.origin))
      .unique();
    if (!domain)
      throw new ConvexError({ message: 'Domain not found', code: 404 });
    const businessDomain = await ctx.db
      .query('businessDomains')
      .withIndex('by_domainId', (q) => q.eq('domainId', domain._id))
      .unique();
    if (!businessDomain)
      throw new ConvexError({
        message: 'Business Domain not found',
        code: 404,
      });
    const business = await ctx.db.get(businessDomain.businessId);
    if (!business)
      throw new ConvexError({ message: 'Business not found', code: 404 });
    const businessHours = await ctx.db
      .query('businessHours')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();

    return {
      ...omit(['_creationTime', 'userId', 'updatedAt'], business),
      businessHours: businessHours.map((bh) =>
        omit(['businessId', 'updatedAt', '_creationTime'], bh),
      ),
    };
  },
});

export const getBookings = query({
  args: {
    origin: v.string(),
    businessId: v.id('businesses'),
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query('bookings')
      .withIndex('by_date', (q) =>
        q
          .eq('businessId', args.businessId)
          .gte('startDate', new Date().toISOString()),
      )
      .collect();
    return bookings;
  },
});

export const getEmployees = query({
  args: {
    origin: v.string(),
    businessId: v.id('businesses'),
  },
  handler: async (ctx, args) => {
    const employees = await ctx.db
      .query('employees')
      .withIndex('by_bookable', (q) =>
        q.eq('businessId', args.businessId).eq('isBookable', true),
      )
      .collect();
    const employeesWithDetails: (Pick<
      Doc<'employees'>,
      'image' | 'firstName' | 'lastName' | '_id'
    > & {
      position: Pick<Doc<'roles'>, 'name'> | null;
      shifts: Pick<Doc<'shifts'>, 'day' | 'dayOff' | 'startTime' | 'endTime'>[];
      unavailabilities: Pick<
        Doc<'employeeUnavailabilities'>,
        'startDate' | 'endDate'
      >[];
    })[] = [];
    for (const employee of employees) {
      const role = employee.positionId
        ? await ctx.db.get(employee.positionId)
        : null;

      const shifts = await ctx.db
        .query('shifts')
        .withIndex('by_employeeId', (q) => q.eq('employeeId', employee._id))
        .collect();
      const unavailabilities = await ctx.db
        .query('employeeUnavailabilities')
        .withIndex('by_employee_date_range', (q) =>
          q
            .eq('employeeId', employee._id)
            .gte('startDate', new Date().toISOString()),
        )
        .collect();
      const details: (typeof employeesWithDetails)[number] = {
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        image: employee.image,
        position: role,
        shifts: shifts.map((shift) =>
          pick(['day', 'dayOff', 'startTime', 'endTime'], shift),
        ),
        unavailabilities: unavailabilities.map((ua) =>
          pick(['startDate', 'endDate'], ua),
        ),
      };

      employeesWithDetails.push(details);
    }

    return employeesWithDetails;
  },
});

export const getServices = query({
  args: {
    businessId: v.id('businesses'),
    positionId: v.optional(v.id('roles')),
  },
  handler: async (ctx, args) => {
    const allServices = await ctx.db
      .query('services')
      .withIndex('by_businessId', (q) => q.eq('businessId', args.businessId))
      .collect()
      .then((services) =>
        services.map((s) =>
          pick(['_id', 'name', 'description', 'price', 'durationInMinutes'], s),
        ),
      );
    if (args.positionId) {
      const roleServices = await ctx.db
        .query('roleServices')
        .withIndex('by_roleId', (q) => q.eq('roleId', args.positionId!))
        .collect();
      const services = await Promise.all(
        roleServices.map((rs) => ctx.db.get(rs.serviceId)),
      );
      const nonNullServices = services.filter(
        (service): service is Doc<'services'> => Boolean(service),
      );
      return nonNullServices.length
        ? nonNullServices.map((s) =>
            pick(
              ['_id', 'name', 'description', 'price', 'durationInMinutes'],
              s,
            ),
          )
        : allServices;
    }

    return allServices;
  },
});

export const createCustomer = mutation({
  args: {
    businessId: v.id('businesses'),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db
      .query('customers')
      .withIndex('by_business_customer', (q) =>
        q
          .eq('businessId', args.businessId)
          .eq('email', args.email)
          .eq('phone', args.phone),
      )
      .unique();
    if (customer) return customer._id;
    return await ctx.db.insert('customers', {
      ...args,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const createBooking = mutation({
  args: {
    businessId: v.id('businesses'),
    customerId: v.id('customers'),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('bookings', {
      ...args,
      status: 'REQUESTED',
      updatedAt: new Date().toISOString(),
    });
  },
});

export const createBookingService = mutation({
  args: {
    employeeId: v.id('employees'),
    customerId: v.id('customers'),
    serviceId: v.id('services'),
    bookingId: v.id('bookings'),
    businessId: v.id('businesses'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('bookingServices', {
      ...args,
      updatedAt: new Date().toISOString(),
    });
  },
});
