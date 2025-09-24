interface IsometricShapeProps {
  type: 'cube' | 'cylinder' | 'pyramid' | 'sphere'
  size: 'sm' | 'md' | 'lg'
  color: string
  className?: string
}

export const IsometricShape = ({ type, size, color, className = '' }: IsometricShapeProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const baseClasses = `${sizeClasses[size]} ${className} transition-all duration-300 hover:scale-110`

  switch (type) {
    case 'cube':
      return (
        <div className={`${baseClasses} relative`}>
          <div 
            className={`absolute inset-0 ${color} rounded-lg shadow-lg transform rotate-12 skew-x-12`}
            style={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
            }}
          />
          <div 
            className={`absolute inset-0 ${color} rounded-lg shadow-lg transform -rotate-12 -skew-x-12 opacity-80`}
            style={{
              background: `linear-gradient(225deg, ${color} 0%, ${color}bb 100%)`
            }}
          />
        </div>
      )

    case 'cylinder':
      return (
        <div className={`${baseClasses} relative`}>
          <div 
            className={`absolute inset-0 ${color} rounded-full shadow-lg`}
            style={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
            }}
          />
          <div 
            className={`absolute inset-x-0 bottom-0 h-2 ${color} rounded-full opacity-60 transform translate-y-1`}
            style={{
              background: `linear-gradient(180deg, ${color}bb 0%, ${color}88 100%)`
            }}
          />
        </div>
      )

    case 'pyramid':
      return (
        <div className={`${baseClasses} relative`}>
          <div 
            className={`absolute inset-0 ${color} transform rotate-45 shadow-lg`}
            style={{
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
            }}
          />
        </div>
      )

    case 'sphere':
      return (
        <div 
          className={`${baseClasses} ${color} rounded-full shadow-lg`}
          style={{
            background: `radial-gradient(circle at 30% 30%, ${color}ff 0%, ${color}dd 50%, ${color}bb 100%)`
          }}
        />
      )

    default:
      return null
  }
}
