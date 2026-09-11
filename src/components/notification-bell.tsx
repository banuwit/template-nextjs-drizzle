"use client"

import { useState } from "react"
import { formatDistanceToNowStrict } from "date-fns"
import { BellIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type Notification = {
  id: string
  title: string
  description: string
  createdAt: Date
  read: boolean
}

/**
 * Belum ada tabel `notifications` di schema — ini contoh data supaya
 * interaksi bisa dicoba. Kalau fitur ini dilanjutkan, ganti `useState` di
 * bawah dengan query + server action sungguhan (pola sama seperti fitur lain
 * di `src/app/*`).
 */
const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "New user added",
    description: '"Budi Santoso" was added to Users.',
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
  },
  {
    id: "2",
    title: "Menu updated",
    description: 'Sort order changed for "Master Data".',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: "3",
    title: "Parameter deleted",
    description: '"ORDER_DRAFT" was removed from Parameters.',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    read: true,
  },
]

export function NotificationBell() {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS)
  const unreadCount = notifications.filter((n) => !n.read).length

  function markAllRead() {
    setNotifications((current) => current.map((n) => ({ ...n, read: true })))
  }

  function markRead(id: string) {
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            aria-label={
              unreadCount > 0
                ? `Notifications (${unreadCount} unread)`
                : "Notifications"
            }
          />
        }
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
        )}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 gap-0 p-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <Button type="button" variant="ghost" size="xs" onClick={markAllRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        {notifications.length === 0 ? (
          <Empty className="border-0 py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BellIcon className="text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle className="text-sm text-muted-foreground">
                No notifications
              </EmptyTitle>
              <EmptyDescription className="text-xs">
                You&apos;re all caught up.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ScrollArea className="max-h-80">
            <ul className="flex flex-col">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => markRead(notification.id)}
                    className={cn(
                      "flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-muted",
                      !notification.read && "bg-primary/5",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        notification.read ? "bg-transparent" : "bg-primary",
                      )}
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-sm font-medium">
                        {notification.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {notification.description}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDistanceToNowStrict(notification.createdAt, {
                          addSuffix: true,
                        })}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
