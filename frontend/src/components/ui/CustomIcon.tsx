import React from 'react'

interface CustomIconProps {
  type: 'emoji' | 'image' | 'base64' | 'url'
  value: string
  alt?: string
  className?: string
}

export const CustomIcon: React.FC<CustomIconProps> = ({ 
  type, 
  value, 
  alt = 'Icon', 
  className = 'w-5 h-5' 
}) => {
  switch (type) {
    case 'emoji':
      return <span className="text-lg">{value}</span>
    
    case 'image':
      return (
        <img 
          src={value} 
          alt={alt} 
          className={className}
          style={{ objectFit: 'contain' }}
        />
      )
    
    case 'base64':
      return (
        <img 
          src={`data:image/png;base64,${value}`} 
          alt={alt} 
          className={className}
          style={{ objectFit: 'contain' }}
        />
      )
    
    case 'url':
      return (
        <img 
          src={value} 
          alt={alt} 
          className={className}
          style={{ objectFit: 'contain' }}
        />
      )
    
    default:
      return <span className="text-lg">{value}</span>
  }
}
