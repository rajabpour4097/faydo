import faydoLogo from '../../assets/brand/faydo-logo.png'

interface FaydoLogoProps {
  className?: string
  size?: 'sm' | 'md'
}

export const FaydoLogo = ({ className = '', size = 'md' }: FaydoLogoProps) => {
  const height = size === 'sm' ? 'h-9' : 'h-11'

  return (
    <img
      src={faydoLogo}
      alt="فایدو"
      className={`${height} w-auto object-contain ${className}`}
      draggable={false}
    />
  )
}
