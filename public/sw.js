self.addEventListener("push", function (event) {
  if (!event.data) return

  let payload = {}
  try {
    payload = event.data.json()
  } catch {
    payload = { title: "Briefd", body: event.data.text() }
  }

  const title = payload.title || "Briefd"
  const options = {
    body: payload.body || "",
    icon: "/icons/192",
    badge: "/icons/192",
    vibrate: [80, 40, 80],
    data: { url: payload.url || "/dashboard" },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", function (event) {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || "/dashboard"

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(url)
      })
  )
})
