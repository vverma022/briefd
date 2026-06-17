import { GetStarted } from "@/components/landing/GetStarted"
import { WaitlistForm } from "@/components/landing/WaitlistForm"
import { config } from "@/lib/config"

export function LandingCta() {
  return config.isDev ? <GetStarted /> : <WaitlistForm />
}
