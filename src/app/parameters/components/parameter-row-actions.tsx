"use client"

import {
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import type { Parameter } from "@/db/schema"

import { useDeleteParameter } from "../hooks/use-delete-parameter"

export function ParameterRowActions({
  parameter,
  onView,
  onEdit,
}: {
  parameter: Parameter
  onView: (parameter: Parameter) => void
  onEdit: (parameter: Parameter) => void
}) {
  const { confirmOpen, setConfirmOpen, pending, confirmDelete } =
    useDeleteParameter(parameter)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <span className="sr-only">Buka menu</span>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(parameter)}>
              <EyeIcon />
              Lihat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(parameter)}>
              <PencilIcon />
              Ubah
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              disabled={parameter.isSystem}
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2Icon />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {parameter.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              Parameter ini akan ditandai terhapus (soft delete) dan hilang dari
              daftar. Barisnya tetap ada di database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={confirmDelete}
            >
              {pending && <Spinner />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
