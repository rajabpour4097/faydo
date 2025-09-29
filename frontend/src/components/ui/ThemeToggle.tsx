import { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

interface ThemeToggleProps {
  forceClose?: boolean
}

export const ThemeToggle = ({ forceClose = false }: ThemeToggleProps) => {
  const { theme, setTheme, isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  // Close menu when forceClose is true
  useEffect(() => {
    if (forceClose) {
      setIsOpen(false)
    }
  }, [forceClose])

  const themes = [
    { value: 'light', label: 'روشن', icon: '☀️' },
    { value: 'dark', label: 'تیره', icon: '🌙' },
    { value: 'system', label: 'سیستم', icon: '💻' },
  ]

  const currentTheme = themes.find(t => t.value === theme)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${
          isDark 
            ? 'text-slate-400 hover:text-white hover:bg-slate-700 hover:bg-opacity-50' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        title="تغییر تم"
      >
        <span className="text-xl">{currentTheme?.icon}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg border z-20 ${
            isDark 
              ? 'bg-slate-800 border-slate-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="py-1">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value as any)
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-right flex items-center justify-between transition-colors ${
                    theme === themeOption.value
                      ? isDark
                        ? 'bg-teal-500 text-white'
                        : 'bg-teal-500 text-white'
                      : isDark
                        ? 'text-slate-300 hover:bg-slate-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-sm">{themeOption.label}</span>
                  <span>{themeOption.icon}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
