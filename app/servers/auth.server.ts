import { json,  redirect } from "@remix-run/node";
import { authCookie } from "./cookie.server";
import { prisma } from "./prisma.server";
import type { LoginForm, RegisterForm } from "./types.server";
import { createUser } from "./users.server";

export const login = async (form: LoginForm): Promise<any> => {
  const user = await prisma.user.findUnique({ where: { email: form.email } });

  if (!user) {
    return json({ error: "Incorret login" }, { status: 400 });
  }

  return createUserSession(user.id, "/");
};

export const register = async (form: RegisterForm) => {
  const exists = await prisma.user.count({ where: { email: form.email } });

  if (exists) {
    return json(
      { error: "user already exists with that email" },
      { status: 400 }
    );
  }

  const newUser = await createUser(form);

  if (!newUser) {
    return json(
      {
        error: "Something went wrong trying to create a new user",
        fields: { email: form.email, password: form.password },
      },
      {
        status: 400,
      }
    );
  }

  await createUserSession(newUser.id, "/");
};

export const  createUserSession = async (userId: string, redirectTo: string) => {
  return redirect(redirectTo, {
    headers: {"Set-Cookie": await authCookie.serialize({"userId": userId})},
  });
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

async function getUserSession(request: Request) {
  return await authCookie.parse(request.headers.get("Cookie"));
}

export async function logout(request: Request) {
  const session = await getUserSession(request);

  return redirect("/login", {
    headers: {
      "Set-Cookie": await authCookie.parse(session),
    },
  });
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") return null;

  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
  } catch (err) {
    throw logout(request);
  }
}
