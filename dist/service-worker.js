
const broadcast = new BroadcastChannel('channel-123');

// Register event listener for the 'push' event.
self.addEventListener('push', (event) => {
  // Retrieve the textual payload from event.data (a PushMessageData object).
  // Other formats are supported (ArrayBuffer, Blob, JSON), check out the documentation
  // on https://developer.mozilla.org/en-US/docs/Web/API/PushMessageData.
  const payload = event.data ? event.data.text() : 'no payload'

  //send message
  broadcast.postMessage({ type: 'MSG_ID', payload: payload})

  /* Keep the service worker alive until the notification is created
  event.waitUntil( // Show a notification with a title and the payload as the body.
    self.registration.showNotification('ServiceWorker Cookbook', { body: payload })
  )
  */
})
