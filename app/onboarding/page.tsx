import { auth } from "@/auth"
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader"
import { OnboardingProviderStep } from "@/components/onboarding/OnboardingProviderStep"
import { NewsletterSelection } from "@/components/onboarding/NewsletterSelection"

export default async function OnboardingPage() {
  const session = await auth()
  const connected = Boolean(session?.user)

  return (
    <main className="relative min-h-svh overflow-x-hidden">
      <OnboardingHeader step={connected ? 2 : 1} />
      <section className="mx-auto w-[92vw] max-w-3xl pt-6 pb-24 sm:pt-10">
        {connected ? <NewsletterSelection /> : <OnboardingProviderStep />}
      </section>
    </main>
  )
}
