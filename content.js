console.log('Content script starting ...' + new Date().toISOString())

const INTERVAL_MS = 500

let page_is_loaded = false
let prev_mutations_observed = 0
let new_mutations_observed = 0

window.addEventListener('load', () => {
  console.log('Page has laoded!' + new Date().toISOString())
  page_is_loaded = true
})

const observer = new MutationObserver((mutations, _) => {
  new_mutations_observed += mutations.length
})

const endpoint_map = {
  '/save-google-search-results': ['google.com/search?q=']
}

const get_endpoint = () => {
  let endpoint = '/';
  Object.entries(endpoint_map).forEach(([key, values]) => {
    values.forEach((value) => {
      if (window.location.href.includes(value)) {
        endpoint = key
      }
    })
  })
  return endpoint
}

const timeout_handler = () => {
  if (page_is_loaded) {
    console.log('Page is loaded!' + new Date().toISOString())
    if (new_mutations_observed - prev_mutations_observed > 0) {
      console.log('Dom still mutating. Waiting ...')
      prev_mutations_observed = new_mutations_observed
      setTimeout(timeout_handler, INTERVAL_MS)
    } else {
      console.log('Dom finished mutating. Sending document to server ...' + new Date().toISOString())
      observer.disconnect()
      fetch('http://127.0.0.1:8082' + get_endpoint(), {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          markup: document.documentElement.outerHTML,
          url: window.location.href
        })
      })
        .then((res) => {
          console.log(res)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  } else {
    console.log('Page has not loaded yet... still waiting ... ' + new Date().toISOString())
    setTimeout(timeout_handler, INTERVAL_MS)
  }
}

observer.observe(document, {
  attributes: true,
  childList: true,
  characterData: true,
  subtree: true
})

setTimeout(timeout_handler, INTERVAL_MS)