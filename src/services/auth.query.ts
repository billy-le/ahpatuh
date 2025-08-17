import { queryOptions } from "@tanstack/react-query";
import { getSession } from "./auth.service";

export const authQueries = {
  all: ["auth"],
  userSession: () =>
    queryOptions({
      queryKey: [...authQueries.all, "user"],
      queryFn: () => getSession(),
      staleTime: 5000,
    }),
};
