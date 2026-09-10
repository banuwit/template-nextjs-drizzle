"use client"

import type { ReactNode } from "react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import type { Parameter } from "@/db/schema"

import { createParameter, updateParameter } from "../actions"
import type { ParameterFormValues } from "../types"

import { ParameterForm } from "./parameter-form"
import {
  ParameterSidePanelBody,
  ParameterSidePanelDescription,
  ParameterSidePanelHeader,
  ParameterSidePanelLayout,
  ParameterSidePanelTitle,
} from "./parameter-side-panel"
import { ParameterValueBadge } from "./parameter-value-badge"

export type ParameterSheet =
  | { type: "closed" }
  | { type: "create" }
  | { type: "view"; parameter: Parameter }
  | { type: "edit"; parameter: Parameter }

/** Baris DB → nilai form: `attributes` (jsonb) jadi teks yang bisa diedit. */
function toFormValues(parameter: Parameter): ParameterFormValues {
  return {
    group: parameter.group,
    code: parameter.code,
    value: parameter.value,
    description: parameter.description,
    textColor: parameter.textColor,
    bgColor: parameter.bgColor,
    attributes: parameter.attributes
      ? JSON.stringify(parameter.attributes, null, 2)
      : "",
    isSystem: parameter.isSystem,
    isActive: parameter.isActive,
    sortOrder: parameter.sortOrder,
  }
}

function DetailRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b py-3 last:border-b-0 sm:flex-row sm:gap-4">
      <span className="w-28 shrink-0 pt-0.5 text-xs text-muted-foreground">
        {label}
      </span>
      <div className="min-w-0 text-sm">{children}</div>
    </div>
  )
}

function ParameterFormPanel({
  mode,
  parameter,
  groups,
  nextSortOrder,
  onClose,
}: {
  mode: "create" | "edit"
  parameter?: Parameter
  groups: string[]
  nextSortOrder: number
  onClose: () => void
}) {
  const isEdit = mode === "edit" && parameter

  return (
    <>
      <ParameterSidePanelHeader onClose={onClose}>
        <ParameterSidePanelTitle>
          {isEdit ? "Ubah parameter" : "Parameter baru"}
        </ParameterSidePanelTitle>
        <ParameterSidePanelDescription>
          {isEdit
            ? `Ubah data ${parameter.code}.`
            : "Tambahkan parameter baru ke daftar."}
        </ParameterSidePanelDescription>
      </ParameterSidePanelHeader>
      <ParameterForm
        key={isEdit ? `edit-${parameter.id}` : "create"}
        action={
          isEdit ? updateParameter.bind(null, parameter.id) : createParameter
        }
        defaultValues={
          isEdit
            ? toFormValues(parameter)
            : { sortOrder: nextSortOrder, isActive: true }
        }
        groups={groups}
        submitLabel={isEdit ? "Simpan perubahan" : "Buat parameter"}
        successTitle={isEdit ? "Parameter diubah" : "Parameter dibuat"}
        onClose={onClose}
      />
    </>
  )
}

function ParameterViewPanel({
  parameter,
  onClose,
}: {
  parameter: Parameter
  onClose: () => void
}) {
  return (
    <>
      <ParameterSidePanelHeader onClose={onClose}>
        <ParameterSidePanelTitle>{parameter.code}</ParameterSidePanelTitle>
        <ParameterSidePanelDescription>
          Detail parameter.
        </ParameterSidePanelDescription>
      </ParameterSidePanelHeader>
      <ParameterSidePanelBody>
        <DetailRow label="ID">{parameter.id}</DetailRow>
        <DetailRow label="Grup">{parameter.group}</DetailRow>
        <DetailRow label="Kode">{parameter.code}</DetailRow>
        <DetailRow label="Nilai">
          <ParameterValueBadge parameter={parameter} />
        </DetailRow>
        <DetailRow label="Deskripsi">
          {parameter.description ?? (
            <span className="text-muted-foreground">—</span>
          )}
        </DetailRow>
        <DetailRow label="Warna">
          <span className="font-mono text-xs text-muted-foreground">
            {parameter.textColor ?? "—"} / {parameter.bgColor ?? "—"}
          </span>
        </DetailRow>
        <DetailRow label="Attributes">
          {parameter.attributes ? (
            <pre className="overflow-x-auto rounded-md bg-muted p-2 font-mono text-xs">
              {JSON.stringify(parameter.attributes, null, 2)}
            </pre>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </DetailRow>
        <DetailRow label="Status">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={parameter.isActive ? "default" : "secondary"}>
              {parameter.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
            {parameter.isSystem && <Badge variant="outline">Sistem</Badge>}
          </div>
        </DetailRow>
        <DetailRow label="Urutan">{parameter.sortOrder}</DetailRow>
        <DetailRow label="Dibuat">
          {format(parameter.createdAt, "dd MMM yyyy, HH:mm")}
        </DetailRow>
        <DetailRow label="Diubah">
          {format(parameter.updatedAt, "dd MMM yyyy, HH:mm")}
        </DetailRow>
      </ParameterSidePanelBody>
    </>
  )
}

export function ParameterSheets({
  sheet,
  onSheetChange,
  groups,
  nextSortOrder,
  children,
}: {
  sheet: ParameterSheet
  onSheetChange: (next: ParameterSheet) => void
  groups: string[]
  nextSortOrder: number
  children: ReactNode
}) {
  function close() {
    onSheetChange({ type: "closed" })
  }

  const panel =
    sheet.type === "create" ? (
      <ParameterFormPanel
        mode="create"
        groups={groups}
        nextSortOrder={nextSortOrder}
        onClose={close}
      />
    ) : sheet.type === "edit" ? (
      <ParameterFormPanel
        mode="edit"
        parameter={sheet.parameter}
        groups={groups}
        nextSortOrder={nextSortOrder}
        onClose={close}
      />
    ) : sheet.type === "view" ? (
      <ParameterViewPanel parameter={sheet.parameter} onClose={close} />
    ) : null

  return (
    <ParameterSidePanelLayout open={sheet.type !== "closed"} panel={panel}>
      {children}
    </ParameterSidePanelLayout>
  )
}
