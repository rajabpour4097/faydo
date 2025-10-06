import React from 'react'

interface CustomIconProps {
  type: 'emoji' | 'image' | 'base64' | 'url'
  value: string
  alt?: string
  className?: string
  active?: boolean
}

export const CustomIcon: React.FC<CustomIconProps> = ({ 
  type, 
  value, 
  alt = 'Icon', 
  className = 'w-5 h-5',
  active = false,
}) => {
  // For image-based icons we approximate tinting using CSS filters.
  // Active: make icon white so it contrasts on colored background.
  // Inactive: gray tone similar to the provided mock.
  const imageFilter = active
    ? 'invert(100%) brightness(110%)'
    : 'grayscale(100%) brightness(85%) saturate(60%)';

  switch (type) {
    case 'emoji':
      return <span className={`text-lg ${active ? 'text-white' : 'text-gray-500'}`}>{value}</span>
    
    case 'image':
      return (
        <img 
          src={value} 
          alt={alt} 
          className={className}
          style={{ objectFit: 'contain', filter: imageFilter }}
        />
      )
    
    case 'base64':
      return (
        <img 
          src={`data:image/png;base64,${value}`} 
          alt={alt} 
          className={className}
          style={{ objectFit: 'contain', filter: imageFilter }}
        />
      )
    
    case 'url':
      return (
        <img 
          src={value} 
          alt={alt} 
          className={className}
          style={{ objectFit: 'contain', filter: imageFilter }}
        />
      )
    
    default:
      return <span className={`text-lg ${active ? 'text-white' : 'text-gray-500'}`}>{value}</span>
  }
}
