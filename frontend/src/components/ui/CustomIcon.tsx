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
  // Active: make icon blue for selected state.
  // Inactive: gray tone similar to the provided mock.
  const imageFilter = active
    ? 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'
    : 'grayscale(100%) brightness(85%) saturate(60%)';

  switch (type) {
    case 'emoji':
      return <span className={`text-lg ${active ? 'text-blue-500' : 'text-gray-500'}`}>{value}</span>
    
    case 'image':
      return (
        <div 
          className={`${className} ${active ? 'bg-blue-500' : 'bg-gray-500'}`}
          style={{
            maskImage: `url(${value})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: `url(${value})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center'
          }}
        />
      )
    
    case 'base64':
      return (
        <div 
          className={`${className} ${active ? 'bg-blue-500' : 'bg-gray-500'}`}
          style={{
            maskImage: `url(data:image/png;base64,${value})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: `url(data:image/png;base64,${value})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center'
          }}
        />
      )
    
    case 'url':
      return (
        <div 
          className={`${className} ${active ? 'bg-blue-500' : 'bg-gray-500'}`}
          style={{
            maskImage: `url(${value})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: `url(${value})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center'
          }}
        />
      )
    
    default:
      return <span className={`text-lg ${active ? 'text-blue-500' : 'text-gray-500'}`}>{value}</span>
  }
}
