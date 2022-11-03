import { createCookie } from "@remix-run/node";

export const authCookie = createCookie("auth", {
    maxAge: 604_800
})