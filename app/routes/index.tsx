import { ActionFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams, useSubmit } from "@remix-run/react";
import { z } from "zod";
import Input from "~/components/input";
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form";
import { login } from "~/servers/auth.server";

type ActionData = { errors: z.ZodIssue[] }

const schema = z.object({
    email: z.string().min(1, "Por favor preencha o e-mail").email({ message: "E-mail invalido" }),
    password: z.string().min(6, "Senha deve possuir 6 caracteres").max(8, "Senha deve possuir 8 caracte"),
    redirectTo: z.string()
})

export const action: ActionFunction = async ({ request }) => {
    const formValues = Object.fromEntries(await request.formData())
    const result = schema.safeParse(formValues)
    if (!result.success) {
        return json<ActionData>({ errors: result.error.issues })
    }
    return await login({ email: formValues.email.toString(), password: formValues.password.toString()})
}

function Error(props: JSX.IntrinsicElements['div']) {
    return <div {...props} className="text-xs text-red-500 w-full tracking-wide" />
}

function ServerError({ name }: { name: string }) {
    const errors = useActionData<ActionData>()?.errors
    const message = errors?.find(({ path }) => path[0] === name)?.message

    if (!message) return null

    return <Error>{message}</Error>
}

function FieldError({ name, errors }: { name: string; errors: any }) {
    const message = errors[name]?.message

    if (message) {
        return <Error>{message}</Error>
    }

    return <ServerError name={name} />
}

export default function Login() {
    const resolver = zodResolver(schema)
    const { register, handleSubmit, formState } = useForm({ resolver })
    const { errors } = formState
    const submit = useSubmit()

    const [searchParams] = useSearchParams();

    return (
        <>
            <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <img
                        className="mx-auto h-12 w-auto"
                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                        alt="Your Company"
                    />
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Acesso ao sistema
                    </h2>
                </div>
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                        <Form 
                            method="post" 
                            onSubmit={(event: any) => {
                                handleSubmit(() => submit(event.target))
                            }}
                            className="space-y-6">
                            <label className="block text-sm font-medium text-gray-700">E-mail</label>
                            <Input {...register("email")} type="email" />
                            <FieldError name="email" errors={errors} />

                            <label className="block text-sm font-medium text-gray-700">Senha</label>
                            <Input  {...register("password")} type="password" />
                            <FieldError name="password" errors={errors} />

                            <button type="submit" className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                Entrar
                            </button>

                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}
