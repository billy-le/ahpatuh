import { queryOptions } from "@tanstack/react-query";
import { getUserSession } from "./auth.service";

export const authQueries = {
  all: ["auth"],
  userSession: () =>
    queryOptions({
      queryKey: [...authQueries.all, "user"],
      queryFn: () => getUserSession(),
      staleTime: 5000,
    }),
};
