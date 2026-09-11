"use client"

import { useActionState, useEffect, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { toFieldErrors } from "@/lib/form"

import type { ParameterActionState, ParameterFormValues } from "../types"

import { ParameterColorField } from "./parameter-color-field"
import {
  ParameterSidePanelBody,
  ParameterSidePanelDescription,
  ParameterSidePanelHeader,
  ParameterSidePanelTitle,
} from "./parameter-side-panel"
import { ParameterSwitchField } from "./parameter-switch-field"

export function ParameterForm({
  title,
  description,
  action,
  defaultValues,
  groups,
  submitLabel,
  successTitle,
  onClose,
}: {
  title: ReactNode
  description: ReactNode
  action: (
    prevState: ParameterActionState,
    formData: FormData,
  ) => Promise<ParameterActionState>
  defaultValues?: Partial<ParameterFormValues>
  /** Grup yang sudah ada, ditawarkan lewat `<datalist>` supaya tidak salah ketik. */
  groups: string[]
  submitLabel: string
  successTitle: string
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState<
    ParameterActionState,
    FormData
  >(action, {})

  useEffect(() => {
    if (!state.ok) {
      return
    }

    toast.add({
      type: "success",
      title: successTitle,
      description: state.values
        ? `${state.values.code} saved.`
        : undefined,
    })
    onClose()
  }, [state.ok, state.values, successTitle, onClose])

  // Nilai yang gagal validasi menang atas default, supaya input tidak
  // ter-reset ke data lama setelah submit yang ditolak.
  const values = state.errors ? state.values : undefined
  const errors = state.errors

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <ParameterSidePanelHeader
        onClose={onClose}
        actions={
          <>
            <Button type="submit" disabled={pending}>
              {pending && <Spinner />}
              {submitLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={onClose}
            >
              Cancel
            </Button>
          </>
        }
      >
        <ParameterSidePanelTitle>{title}</ParameterSidePanelTitle>
        <ParameterSidePanelDescription>
          {description}
        </ParameterSidePanelDescription>
      </ParameterSidePanelHeader>

      <ParameterSidePanelBody className="flex flex-col gap-6">
        <FieldGroup>
          <Field data-invalid={errors?.group ? true : undefined}>
            <FieldLabel htmlFor="parameter-group">Group</FieldLabel>
            <Input
              id="parameter-group"
              name="group"
              list="parameter-group-options"
              placeholder="status_order"
              autoComplete="off"
              maxLength={50}
              aria-invalid={errors?.group ? true : undefined}
              defaultValue={values?.group ?? defaultValues?.group}
            />
            <datalist id="parameter-group-options">
              {groups.map((group) => (
                <option key={group} value={group} />
              ))}
            </datalist>
            <FieldDescription>
              Groups related parameters, e.g. `status_order`.
            </FieldDescription>
            <FieldError errors={toFieldErrors(errors?.group)} />
          </Field>

          <Field data-invalid={errors?.code ? true : undefined}>
            <FieldLabel htmlFor="parameter-code">Code</FieldLabel>
            <Input
              id="parameter-code"
              name="code"
              placeholder="ORDER_PAID"
              autoComplete="off"
              maxLength={100}
              aria-invalid={errors?.code ? true : undefined}
              defaultValue={values?.code ?? defaultValues?.code}
              className="uppercase"
            />
            <FieldDescription>
              Unique across the group, automatically uppercased.
            </FieldDescription>
            <FieldError errors={toFieldErrors(errors?.code)} />
          </Field>

          <Field data-invalid={errors?.value ? true : undefined}>
            <FieldLabel htmlFor="parameter-value">Value</FieldLabel>
            <Input
              id="parameter-value"
              name="value"
              placeholder="Paid"
              autoComplete="off"
              maxLength={150}
              aria-invalid={errors?.value ? true : undefined}
              defaultValue={values?.value ?? defaultValues?.value}
            />
            <FieldError errors={toFieldErrors(errors?.value)} />
          </Field>

          <Field data-invalid={errors?.sortOrder ? true : undefined}>
            <FieldLabel htmlFor="parameter-sort-order">Order</FieldLabel>
            <Input
              id="parameter-sort-order"
              name="sortOrder"
              type="number"
              min={0}
              step={1}
              aria-invalid={errors?.sortOrder ? true : undefined}
              defaultValue={String(
                values?.sortOrder ?? defaultValues?.sortOrder ?? 0,
              )}
            />
            <FieldError errors={toFieldErrors(errors?.sortOrder)} />
          </Field>

          <Field data-invalid={errors?.description ? true : undefined}>
            <FieldLabel htmlFor="parameter-description">Description</FieldLabel>
            <Textarea
              id="parameter-description"
              name="description"
              rows={3}
              placeholder="Optional"
              aria-invalid={errors?.description ? true : undefined}
              defaultValue={
                values?.description ?? defaultValues?.description ?? ""
              }
            />
            <FieldError errors={toFieldErrors(errors?.description)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <ParameterColorField
              id="parameter-text-color"
              name="textColor"
              label="Text color"
              fallback="#111827"
              defaultValue={values?.textColor ?? defaultValues?.textColor}
              errors={errors?.textColor}
            />
            <ParameterColorField
              id="parameter-bg-color"
              name="bgColor"
              label="Background color"
              fallback="#E5E7EB"
              defaultValue={values?.bgColor ?? defaultValues?.bgColor}
              errors={errors?.bgColor}
            />
          </div>

          <Field data-invalid={errors?.attributes ? true : undefined}>
            <FieldLabel htmlFor="parameter-attributes">Attributes</FieldLabel>
            <Textarea
              id="parameter-attributes"
              name="attributes"
              rows={4}
              placeholder={'{\n  "icon": "check"\n}'}
              aria-invalid={errors?.attributes ? true : undefined}
              defaultValue={
                values?.attributes ?? defaultValues?.attributes ?? ""
              }
              className="font-mono text-xs"
            />
            <FieldDescription>
              Optional JSON object. Leave empty if not used.
            </FieldDescription>
            <FieldError errors={toFieldErrors(errors?.attributes)} />
          </Field>

          <div className="flex flex-col gap-3">
            <ParameterSwitchField
              id="parameter-is-active"
              name="isActive"
              label="Active"
              description="Inactive parameters stay saved but are not used."
              defaultChecked={
                values?.isActive ?? defaultValues?.isActive ?? true
              }
            />
            <ParameterSwitchField
              id="parameter-is-system"
              name="isSystem"
              label="System parameter"
              description="Used by application code; cannot be deleted."
              defaultChecked={
                values?.isSystem ?? defaultValues?.isSystem ?? false
              }
            />
          </div>
        </FieldGroup>

        <FieldError errors={toFieldErrors(errors?.form)} />
      </ParameterSidePanelBody>
    </form>
  )
}
