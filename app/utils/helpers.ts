import { redirect } from "@remix-run/node";
import { deleteCookie } from "~/servers/cookie.server";

export async function useLogout() {
    return redirect("/", {
      headers: {
        "Set-Cookie": await deleteCookie.serialize({}),
      },
    });
}