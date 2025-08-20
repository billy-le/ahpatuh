import { query } from "./_generated/server";

export const getLanguages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("languages").collect();
  },
});
