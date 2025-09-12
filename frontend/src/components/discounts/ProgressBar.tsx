import React from 'react'

export const ProgressBar: React.FC<{percent:number}> = ({percent}) => {
  const clamped = Math.max(0, Math.min(100, percent))
  let color = 'bg-green-500'
  if (clamped > 66) color = 'bg-red-500'
  else if (clamped > 33) color = 'bg-blue-500'
  return (
    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
      <div className={`${color} h-2 transition-all duration-500`} style={{width: clamped+'%'}} />
    </div>
  )
}
