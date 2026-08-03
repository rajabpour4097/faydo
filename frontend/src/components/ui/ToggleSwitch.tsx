import React from 'react'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
  label?: string
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  id,
  label,
}) => {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          checked
            ? 'border-indigo-700 bg-indigo-500 focus:ring-indigo-400'
            : 'border-gray-400 bg-gray-200 focus:ring-gray-400'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full shadow-sm transition-all duration-200 ${
            checked
              ? 'left-[22px] bg-white'
              : 'left-0.5 bg-gray-500'
          }`}
        />
      </button>
      {label && (
        <span className={`text-sm ${checked ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
          {label}
        </span>
      )}
    </label>
  )
}
