"use client"

import { useSyncExternalStore } from "react"
import { MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const STORAGE_KEY = "theme"

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })
  return () => observer.disconnect()
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark")
}

/**
 * Sinkron dengan script inline di `layout.tsx` yang menambah/menghapus class
 * `dark` di `<html>` sebelum hydration. `useSyncExternalStore` (bukan
 * `useState` + effect) supaya baca class langsung tanpa render ekstra —
 * `<html>` sendiri sudah punya class yang benar lebih dulu, jadi tidak ada FOUC.
 */
export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, () => false)

  function toggle() {
    const next = !isDark
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
