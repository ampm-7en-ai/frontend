import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { register, login } from "@/lib/auth"
import { useNavigate } from "react-router-dom"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const FormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  name: z.string().optional(),
  terms: z.boolean().optional(),
})

interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const LoginForm = React.forwardRef<HTMLDivElement, LoginFormProps>(
  ({ className, ...props }, ref) => {
    const [formMode, setFormMode] = useState<"login" | "signup">("login")
    const navigate = useNavigate()

    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        email: "",
        password: "",
      },
    })

    async function onSubmit(values: z.infer<typeof FormSchema>) {
      if (formMode === "signup") {
        try {
          await register({
            name: values.name,
            email: values.email,
            password: values.password,
          })
          toast({
            title: "Registration successful!",
            description: "Please check your email to verify your account.",
          })
          navigate("/auth/verify-email", { state: { email: values.email } })
        } catch (error) {
          toast({
            title: "Something went wrong.",
            description: "There was an error registering your account.",
            variant: "destructive",
          })
        }
      } else {
        try {
          await login({
            email: values.email,
            password: values.password,
          })
          toast({
            title: "Login successful!",
            description: "You have successfully logged in.",
          })
          navigate("/dashboard")
        } catch (error) {
          toast({
            title: "Authentication failed.",
            description: "Please check your credentials.",
            variant: "destructive",
          })
        }
      }
    }

    return (
      <div className={cn("grid gap-6", className)} {...props} ref={ref}>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" onClick={() => setFormMode("login")}>
              Log in
            </TabsTrigger>
            <TabsTrigger value="signup" onClick={() => setFormMode("signup")}>
              Sign up
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="mail@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full" type="submit">
                  Log In
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="signup" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="mail@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Accept terms and conditions
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <Button className="w-full" type="submit">
                  Sign Up
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button variant="outline" type="button" disabled>
          Google
        </Button>
      </div>
    )
  }
)
LoginForm.displayName = "LoginForm"

export { LoginForm }
