import * as React from 'react'

const Input = React.forwardRef<
    HTMLInputElement,
    JSX.IntrinsicElements['input']
>(({ type = 'text', className, ...props }, ref) => (
    <input
        ref={ref}
        type={type}
        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        {...props}
    />
))

export default Input