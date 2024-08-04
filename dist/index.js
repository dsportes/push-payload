// This function is needed because Chrome doesn't accept a base64 encoded string
// as value for applicationServerKey in pushManager.subscribe yet
// https://bugs.chromium.org/p/chromium/issues/detail?id=802280
function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
 
  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);
 
  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if (Notification.permission !== 'granted') { // granted denied default
  // We need to ask the user for permission
  const permission = await Notification.requestPermission()
  console.log(permission === 'granted' ? 'cool !!!' : 'fuck !!!')
}

const VAPID_PUBLIC_KEY = 'BC8J60JGGoZRHWJDrSbRih-0qi4Ug0LPbYsnft668oH56hqApUR0piwzZ_fsr0qGrkbOYSJ0lX1hPRTawQE88Ew'
const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)

// Register a Service Worker.
navigator.serviceWorker.register('service-worker.js')

const broadcast = new BroadcastChannel('channel-123')
broadcast.onmessage = (event) => {
  if (event.data && event.data.type === 'MSG_ID') {
    console.log('Reçu: ', event.data.payload)
    document.getElementById('rec-data').value = event.data.payload
  }
}

const registration = await navigator.serviceWorker.ready
let subscription = await registration.pushManager.getSubscription() // déjà faite
if (!subscription) subscription = registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey
  })

// Send the subscription details to the server using the Fetch API.
const subJSON = JSON.stringify({ subscription: subscription })
console.log('sub len : ', subJSON.length)
fetch('./register', {
  method: 'post',
  headers: { 'Content-type': 'application/json' },
  body: subJSON
})
  
/*
navigator.serviceWorker.ready
.then(function(registration) {
  // Use the PushManager to get the user's subscription to the push service.
  return registration.pushManager.getSubscription()
  .then(async function(subscription) {
    // If a subscription was found, return it.
    if (subscription) {
      return subscription;
    }

    // Get the server's public key
    const response = await fetch('./vapidPublicKey');
    const vapidPublicKey = await response.text();
    // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
    // urlBase64ToUint8Array() is defined in /tools.js
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
    // send notifications that don't have a visible effect for the user).
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
  });
}).then(function(subscription) {
  // Send the subscription details to the server using the Fetch API.
  fetch('./register', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      subscription: subscription
    }),
  });
*/

document.getElementById('doIt').onclick = () => {
  const payload = document.getElementById('notification-payload').value
  const delay = document.getElementById('notification-delay').value
  const ttl = document.getElementById('notification-ttl').value

  // Echo test : ask the server to send the client a notification ... 
  // which the text is given by the client itself !
  fetch('./sendNotification', {
    method: 'post',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({
      subscription: subscription,
      payload: payload,
      delay: delay,
      ttl: ttl
    })
  })
}

