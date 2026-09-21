export const APP_MOBILE_FRAME_ID = 'app-mobile-frame'

export function getOverlayRoot(): HTMLElement {
  return document.getElementById(APP_MOBILE_FRAME_ID) ?? document.body
}

export function lockAppScroll() {
  const frame = document.getElementById(APP_MOBILE_FRAME_ID)
  const prevBody = document.body.style.overflow
  const prevFrame = frame?.style.overflow ?? ''
  document.body.style.overflow = 'hidden'
  if (frame) frame.style.overflow = 'hidden'
  return () => {
    document.body.style.overflow = prevBody
    if (frame) frame.style.overflow = prevFrame
  }
}
