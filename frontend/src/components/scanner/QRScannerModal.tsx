import React from 'react'
import { CustomerPurchaseFlow } from './CustomerPurchaseFlow'

interface QRScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScanSuccess?: (decodedText: string) => void
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
}) => <CustomerPurchaseFlow isOpen={isOpen} onClose={onClose} />
