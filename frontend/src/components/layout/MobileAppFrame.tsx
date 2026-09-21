import { ReactNode } from 'react'
import { APP_MOBILE_FRAME_ID } from '../../utils/overlayRoot'

interface MobileAppFrameProps {
  children: ReactNode
}

export const MobileAppFrame = ({ children }: MobileAppFrameProps) => {
  return (
    <div className="app-desktop-chrome">
      <div id={APP_MOBILE_FRAME_ID} className="app-mobile-frame">
        {children}
      </div>
    </div>
  )
}
