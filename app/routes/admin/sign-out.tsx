import { LoaderFunction } from "@remix-run/node";
import { logout } from "~/servers/auth.server";

export const loader: LoaderFunction = async () => {
   return await logout()
}