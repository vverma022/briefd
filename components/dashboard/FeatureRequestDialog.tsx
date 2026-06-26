"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { featureRequestSchema } from "@/shared/schemas"
import type { FeatureRequestInput } from "@/shared/types"
import { submitFeatureRequest } from "@/services/feature-request"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { notify } from "@/lib/toast"

// Sidebar-triggered feature request form. The trigger is passed as children so
// it can be a SidebarMenuButton. Submits to /api/feature-requests (emailed to
// the team) and closes on success.
export function FeatureRequestDialog({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeatureRequestInput>({
    resolver: standardSchemaResolver(featureRequestSchema),
    defaultValues: { title: "", description: "" },
  })

  async function onSubmit(values: FeatureRequestInput) {
    try {
      await submitFeatureRequest(values)
      notify.success("Thanks — request sent", "We read every one.")
      reset()
      setOpen(false)
    } catch (e) {
      notify.error(
        "Couldn't send your request",
        e instanceof Error ? e.message : undefined
      )
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-md [&>button]:hidden"
      >
        <SheetHeader>
          <SheetTitle className="font-serif text-xl text-foreground italic">
            Request a feature
          </SheetTitle>
          <SheetDescription className="font-sans text-sm font-light text-foreground/55">
            Got an idea to make Briefd better? Tell us — it goes straight to the
            team.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-5 px-6 py-2"
        >
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="title"
              className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase"
            >
              Title
            </Label>
            <Input
              id="title"
              placeholder="A short summary"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title ? (
              <p className="font-mono text-[10px] tracking-wide text-destructive">
                {errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="description"
              className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase"
            >
              Details
            </Label>
            <Textarea
              id="description"
              rows={6}
              placeholder="What would you like to see, and why?"
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description ? (
              <p className="font-mono text-[10px] tracking-wide text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </div>
        </form>

        <SheetFooter className="flex-row justify-end gap-2">
          <SheetClose asChild>
            <Button variant="outline" size="lg" disabled={isSubmitting}>
              Cancel
            </Button>
          </SheetClose>
          <Button
            size="lg"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="min-w-24"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Sending
              </span>
            ) : (
              "Send request"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
