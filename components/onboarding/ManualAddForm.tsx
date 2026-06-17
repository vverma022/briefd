"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { senderInputSchema } from "@/shared/schemas"
import type { SenderInput } from "@/shared/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ManualAddForm({
  onAdd,
}: {
  onAdd: (sender: SenderInput) => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SenderInput>({
    resolver: standardSchemaResolver(senderInputSchema),
    defaultValues: { senderEmail: "" },
  })

  return (
    <form
      onSubmit={handleSubmit((values) => {
        onAdd(values)
        reset()
      })}
      className="flex flex-col gap-3 rounded-2xl border border-dashed border-foreground/15 p-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-2">
        <Label
          htmlFor="senderEmail"
          className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase"
        >
          Add a sender manually
        </Label>
        <Input
          id="senderEmail"
          type="email"
          placeholder="news@example.com"
          aria-invalid={!!errors.senderEmail}
          {...register("senderEmail")}
        />
        {errors.senderEmail ? (
          <p className="font-mono text-[10px] tracking-wide text-destructive">
            {errors.senderEmail.message}
          </p>
        ) : null}
      </div>
      <Button type="submit" variant="outline" size="lg">
        Add sender
      </Button>
    </form>
  )
}
