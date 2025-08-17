import { httpRouter } from "convex/server";
import { betterAuthComponent } from "./auth";
import { auth } from "../src/utils/auth-server";

const http = httpRouter();

betterAuthComponent.registerRoutes(http, auth);

export default http;
