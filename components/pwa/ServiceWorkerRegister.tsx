"use client"

import * as React from "react"

// Registers the push service worker once on mount. `updateViaCache: "none"`
// ensures the browser always re-fetches sw.js (which we also serve no-cache) so
// updates take effect immediately. Renders nothing.
export function ServiceWorkerRegister() {
  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .catch(() => {
        /* registration failures are non-fatal — push just won't be available */
      })
  }, [])

  return null
}
