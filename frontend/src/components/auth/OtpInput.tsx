import { useEffect, useRef, useState } from 'react'
import { normalizeDigits, toEnglishDigits } from '../../utils/digits'

interface OtpInputProps {
  value: string
  onChange: (code: string) => void
  onComplete?: (code: string) => void
  disabled?: boolean
  remainingSeconds?: number | null
}

const OTP_LENGTH = 6

export const OtpInput = ({ value, onChange, onComplete, disabled = false, remainingSeconds = null }: OtpInputProps) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, (_, i) => value[i] || '')
  )

  useEffect(() => {
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] || '')
    setDigits(next)
  }, [value])

  useEffect(() => {
    if (!('OTPCredential' in window)) return

    const ac = new AbortController()
    ;(async () => {
      try {
        const cred = (await navigator.credentials.get({
          otp: { transport: ['sms'] },
          signal: ac.signal,
        } as CredentialRequestOptions)) as OTPCredential | null
        if (cred?.code) {
          const code = normalizeDigits(cred.code, OTP_LENGTH)
          if (code.length === OTP_LENGTH) {
            onChange(code)
            onComplete?.(code)
          }
        }
      } catch {
        // User dismissed or browser doesn't support — manual entry still works
      }
    })()

    return () => ac.abort()
  }, [onChange, onComplete])

  const emitChange = (nextDigits: string[]) => {
    setDigits(nextDigits)
    const code = nextDigits.join('')
    onChange(code)
    if (code.length === OTP_LENGTH && /^\d{6}$/.test(code)) {
      onComplete?.(code)
    }
  }

  const handleChange = (index: number, raw: string) => {
    const digit = normalizeDigits(raw, 1).slice(-1)
    const next = [...digits]
    next[index] = digit
    emitChange(next)
    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = normalizeDigits(e.clipboardData.getData('text'), OTP_LENGTH)
    if (!pasted) return
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] || '')
    emitChange(next)
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
    inputsRef.current[focusIndex]?.focus()
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        value={value}
        onChange={(e) => {
          const code = normalizeDigits(e.target.value, OTP_LENGTH)
          emitChange(Array.from({ length: OTP_LENGTH }, (_, i) => code[i] || ''))
        }}
      />
      <div className="flex justify-center gap-2 direction-ltr" dir="ltr" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputsRef.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:opacity-50"
          />
        ))}
      </div>
      {remainingSeconds != null && (
        <p className={`text-xs text-center ${remainingSeconds > 0 ? 'text-gray-500' : 'text-red-500'}`}>
          {remainingSeconds > 0
            ? `مهلت ورود کد: ${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`
            : 'مهلت کد به پایان رسید؛ «ارسال مجدد کد» را بزنید'}
        </p>
      )}
    </div>
  )
}
