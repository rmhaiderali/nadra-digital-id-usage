import nadraDigitalId from "nadra-digital-id"
import console from "./utils/betterConsoleLog.js"
import decrypt from "./utils/matchSaltDateAndDecrypt.js"

// nadraDigitalId.setDebug(true)

console.log("NADRA Digital ID Test")

async function main(data, pin, date) {
  const { data: decoded, error: decodeError } = nadraDigitalId.decode(data)

  if (decodeError) {
    console.log(decodeError)
    return
  }

  let decodedObject
  try {
    decodedObject = JSON.parse(decoded)
  } catch (e) {
    console.log("Failed to parse decoded data")
    return
  }

  console.log("Decoded Data", decodedObject)

  let decryptedObject = decodedObject

  const isUnencrypted = "credentialSubject" in decodedObject

  if (!isUnencrypted) {
    const { data, error, notfound } = await decrypt(decodedObject, pin, date)

    if (error) {
      console.log(error)
      return
    }

    if (notfound) {
      console.log("Wrong Creation Date")
      return
    }

    decryptedObject = data.vc

    console.log("Decrypted Data", data)
  }

  // Uncomment following lines to test forged VC scenario
  // if (decryptedObject.credentialSubject?.id) {
  //   decryptedObject.credentialSubject.id += " "
  // } else {
  //   console.log(
  //     "Cannot forge VC as vc.credentialSubject.id is missing. Try some other field",
  //   )
  // }

  const { error: verificationError } =
    await nadraDigitalId.verify(decryptedObject)

  const verificationStatus = verificationError ? "Failed" : "Passed"

  console.log("Cryptographic Verification: " + verificationStatus)

  if (decryptedObject.credentialSubject?.temporaryAddress?.value) {
    const { data: normalizedAddress, error: normalizationError } =
      nadraDigitalId.normalizeText(
        decryptedObject.credentialSubject.temporaryAddress.value,
      )

    if (normalizationError) {
      console.log(normalizationError)
      return
    }

    console.log("Normalized Address", normalizedAddress)
  } else {
    console.log(
      "Cannot normalize text as vc.credentialSubject.temporaryAddress.value is missing. Try some other field",
    )
  }
}

const data = "<REDACTED>"

const pin = "1234"

const date = new Date("2026-01-01")

await main(data, pin, date)
