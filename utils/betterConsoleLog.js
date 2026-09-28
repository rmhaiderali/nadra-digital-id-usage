import { boxenExtended } from "boxen-extended"

function log(...args) {
  return console.log(
    boxenExtended(...args, { inspectOptions: { depth: null } }),
  )
}

export default { ...console, log }
