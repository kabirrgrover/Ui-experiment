/** Every image lives in /public/assets. Use these names instead of raw strings. */
export const asset = (name: string) => `/assets/${name}`;

export const stickers = {
  hello: asset("hello-sr.svg"),
  helloMr: asset("hello-mr.svg"),
  helloPep: asset("hello-pep.svg"),
  tape: asset("tool-tape-measure.png"),
  crane: asset("tool-crane.png"),
  cone: asset("cone.png"),
  glove: asset("peace-glove.png"),
  hat: asset("hard-hat-eyes.svg"),
  rfi: asset("rfi.svg"),
  smiley: asset("smiley.svg"),
  specd: asset("specd-signed.svg"),
  level: asset("tool-level.svg"),
  measure: asset("measure-twice.svg"),
  sparkle: asset("sparkle-orange.svg"),
  hammer: asset("tool-hammer.svg"),
  wrench: asset("tool-wrench.svg"),
  pencil: asset("tool-pencil.svg"),
  bolt: asset("tool-bolt.svg"),
  heartNut: asset("heart-nut.svg"),
  burst: asset("burst-purple.svg"),
  eyes: asset("eyes.svg"),
  peaceLemon: asset("peace-lemon.svg"),
  hazard: asset("hazard-tape.svg"),
} as const;
