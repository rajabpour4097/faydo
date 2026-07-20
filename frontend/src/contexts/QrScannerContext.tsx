import { createContext, useContext, type ReactNode } from 'react'

type QrScannerContextValue = {
  openScanner: () => void
}

const QrScannerContext = createContext<QrScannerContextValue | null>(null)

export function QrScannerProvider({
  children,
  openScanner,
}: {
  children: ReactNode
  openScanner: () => void
}) {
  return (
    <QrScannerContext.Provider value={{ openScanner }}>
      {children}
    </QrScannerContext.Provider>
  )
}

export function useQrScanner() {
  return useContext(QrScannerContext)
}
