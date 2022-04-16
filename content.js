const INTERVAL_MS = 500

let prev_mutations_observed = 0
let mutations_observed = 0

const observer = new MutationObserver((mutations, _) => {
  mutations_observed += mutations.length
})

const timeout_handler = () => {
  const is_dom_mutating = mutations_observed - prev_mutations_observed !== 0
  if (is_dom_mutating) {
    console.log('Dom still mutating. Waiting ...')
    prev_mutations_observed = mutations_observed
    setTimeout(timeout_handler, INTERVAL_MS)
  } else {
    console.log('Dom finsihed mutating. Sending HTTP request to server ...')
    observer.disconnect()
    fetch('http://localhost:8081', {
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