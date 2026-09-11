import "server-only"

import { and, asc, eq, isNull } from "drizzle-orm"

import { db } from "@/db"
import { menus } from "@/db/schema"
import { requireUser } from "@/lib/session"

/** Node menu yang aman dikirim ke client (serializable). */
export type NavMenuNode = {
  id: string
  name: string
  icon: string | null
  url: string | null
  children: NavMenuNode[]
}

/**
 * Menu aktif satu layout dalam bentuk pohon, sumber sidebar aplikasi. Induk yang
 * nonaktif / beda layout / terhapus tidak ikut di-query, jadi anaknya
 * diperlakukan sebagai root daripada hilang dari sidebar.
 */
export async function listNavMenu(layout = "sidebar"): Promise<NavMenuNode[]> {
  await requireUser()

  const rows = await db
    .select({
      id: menus.id,
      name: menus.name,
      icon: menus.icon,
      routeName: menus.routeName,
      parentId: menus.parentId,
    })
    .from(menus)
    .where(
      and(
        isNull(menus.deletedAt),
        eq(menus.isActive, true),
        eq(menus.layout, layout),
      ),
    )
    .orderBy(asc(menus.sortOrder), asc(menus.internalId))

  const nodes = new Map<string, NavMenuNode>(
    rows.map((row) => [
      row.id,
      {
        id: row.id,
        name: row.name,
        icon: row.icon,
        url: row.routeName,
        children: [],
      },
    ]),
  )
  const roots: NavMenuNode[] = []

  for (const row of rows) {
    const node = nodes.get(row.id)!
    const parent = row.parentId === null ? undefined : nodes.get(row.parentId)

    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
