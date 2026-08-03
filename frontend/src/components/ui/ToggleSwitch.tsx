import React from 'react'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
  label?: string
  size?: 'sm' | 'md'
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  id,
  label,
  size = 'md',
}) => {
  const isSmall = size === 'sm'

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center ${isSmall ? 'gap-1.5' : 'gap-2'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex shrink-0 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          isSmall
            ? 'h-5 w-[34px] border'
            : 'h-7 w-12 border-2'
        } ${
          checked
            ? 'border-indigo-700 bg-indigo-500 focus:ring-indigo-400'
            : 'border-gray-400 bg-gray-200 focus:ring-gray-400'
        }`}
      >
        <span
          className={`absolute rounded-full shadow-sm transition-all duration-200 ${
            isSmall
              ? `top-0.5 h-3.5 w-3.5 ${checked ? 'left-[17px] bg-white' : 'left-0.5 bg-gray-500'}`
              : `top-0.5 h-5 w-5 ${checked ? 'left-[22px] bg-white' : 'left-0.5 bg-gray-500'}`
          }`}
        />
      </button>
      {label && (
        <span className={`${isSmall ? 'text-xs' : 'text-sm'} ${checked ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
          {label}
        </span>
      )}
    </label>
  )
}
