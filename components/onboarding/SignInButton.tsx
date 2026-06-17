import { FcGoogle } from "react-icons/fc"

import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"

export function SignInButton() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("google", { redirectTo: "/onboarding" })
      }}
    >
      <Button type="submit" variant="silver" size="lg" className="w-full">
        <FcGoogle className="size-4" />
        Connect Gmail
      </Button>
    </form>
  )
}
