const INTERVAL_MS = 500

let prev_mutations_observed = 0
let new_mutations_observed = 0

const observer = new MutationObserver((mutations, _) => {
  new_mutations_observed += mutations.length
})

const timeout_handler = () => {
  if (new_mutations_observed - prev_mutations_observed > 0) {
    console.log('Dom still mutating. Waiting ...')
    prev_mutations_observed = new_mutations_observed
    setTimeout(timeout_handler, INTERVAL_MS)
  } else {
    console.log('Dom finished mutating. Sending document to server ...')
    observer.disconnect()
    fetch('http://localhost:8080', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(document.documentElement.outerHTML)
    })
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
      })
  }
}

observer.observe(document, {
  attributes: true,
  childList: true,
  characterData: true,
  subtree: true
})

setTimeout(timeout_handler, INTERVAL_MS)