"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { createMenu, updateMenu } from "../actions"
import type { MenuListRow, MenuParentOption } from "../types"

import { MenuForm } from "./menu-form"

export function MenuFormSheet({
  mode,
  menu,
  parentOptions,
  layouts,
  nextSortOrder,
  descendantIds,
  onClose,
}: {
  mode: "create" | "edit"
  menu?: MenuListRow
  parentOptions: MenuParentOption[]
  layouts: string[]
  nextSortOrder: number
  /** Id menu ini + seluruh turunannya; tidak boleh muncul sebagai pilihan induk. */
  descendantIds: number[]
  onClose: () => void
}) {
  const isEdit = mode === "edit" && menu

  // Menu tidak boleh menjadi induk dirinya sendiri atau turunannya — itu
  // membuat siklus. Divalidasi ulang di server; ini hanya menyembunyikan
  // pilihan yang pasti ditolak.
  const options = isEdit
    ? parentOptions.filter((option) => !descendantIds.includes(option.id))
    : parentOptions

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-md" showCloseButton>
        <SheetHeader>
          <SheetTitle>{isEdit ? "Ubah menu" : "Menu baru"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? `Ubah data ${menu.name}.`
              : "Tambahkan menu baru ke daftar."}
          </SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-4 pb-4">
          <MenuForm
            key={isEdit ? `edit-${menu.id}` : "create"}
            action={isEdit ? updateMenu.bind(null, menu.id) : createMenu}
            defaultValues={
              isEdit
                ? {
                    name: menu.name,
                    slug: menu.slug,
                    icon: menu.icon,
                    routeName: menu.routeName,
                    routePattern: menu.routePattern,
                    parentId: menu.parentId,
                    sortOrder: menu.sortOrder,
                    layout: menu.layout,
                    isActive: menu.isActive,
                  }
                : { sortOrder: nextSortOrder, layout: "sidebar", isActive: true }
            }
            parentOptions={options}
            layouts={layouts}
            submitLabel={isEdit ? "Simpan perubahan" : "Buat menu"}
            successTitle={isEdit ? "Menu diubah" : "Menu dibuat"}
            onClose={onClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
