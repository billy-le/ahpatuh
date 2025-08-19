import { query, mutation } from './_generated/server';

export const getEmployees = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db.query('employees', {}).collect();
  },
});
