import Link from "next/link"

export function GetStarted() {
  return (
    <Link
      href="/onboarding"
      className="silver-btn mx-auto flex w-fit items-center gap-2 rounded-xl px-7 py-3.5 font-mono text-[12px] font-bold tracking-[0.25em] uppercase"
    >
      Get started
    </Link>
  )
}
