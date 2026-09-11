"use client"

import * as React from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export type BreadcrumbEntry = {
  label: string
  href?: string
}

const BreadcrumbContext = React.createContext<BreadcrumbEntry[]>([])

export function BreadcrumbProvider({
  breadcrumbs,
  children,
}: {
  breadcrumbs: BreadcrumbEntry[]
  children: React.ReactNode
}) {
  return (
    <BreadcrumbContext.Provider value={breadcrumbs}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

function HeadingTrail({ breadcrumbs }: { breadcrumbs: BreadcrumbEntry[] }) {
  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs text-muted-foregrou/50">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1
          return (
            <React.Fragment key={`${crumb.label}-${index}`}>
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator /> : null}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default function Heading({
  title,
  breadcrumbs,
  variant = "default",
}: {
  title: string
  breadcrumbs?: BreadcrumbEntry[]
  variant?: "default" | "small"
}) {
  const contextBreadcrumbs = React.useContext(BreadcrumbContext)
  const trail = breadcrumbs ?? contextBreadcrumbs

  return (
    <header
      className="flex flex-col gap-0.5"
    >
        <HeadingTrail breadcrumbs={trail} />
        <h2
            className={
            variant === "small"
                ? "text-base font-medium"
                : "text-xl font-semibold tracking-tight"
            }
        >
            {title}
        </h2>
      
    </header>
  )
}
