import { json,  redirect } from "@remix-run/node";
import { authCookie, deleteCookie } from "./cookie.server";
import { prisma } from "./prisma.server";
import type { LoginForm, RegisterForm } from "./types.server";
import { createUser } from "./users.server";

export const login = async (form: LoginForm): Promise<any> => {
  const user = await prisma.user.findUnique({ where: { email: form.email } });

  if (!user) {
    return json({ error: "Incorret login" }, { status: 400 });
  }

  return createUserSession(user.id, "/admin");
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

  await createUserSession(newUser.id, "/admin");
};

export const  createUserSession = async (userId: string, redirectTo: string) => {
  return redirect(redirectTo, {
    headers: {"Set-Cookie": await authCookie.serialize({"userId": userId})},
  });
}

export async function requireUserId(
  request: Request,
) {
  const session = await getUserSession(request);

  if (!session) {
    throw redirect("/");
  }
  return session;
}

async function getUserSession(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie =  await authCookie.parse(cookieHeader);

 return cookie;
}

export async function logout() {
  return redirect("/", {
    headers: {
      "Set-Cookie": await deleteCookie.serialize({}),
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
    throw logout();
  }
}
