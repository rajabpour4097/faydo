import React from 'react'

export const ProgressBar: React.FC<{percent:number}> = ({percent}) => {
  const clamped = Math.max(0, Math.min(100, percent))
  let color = 'bg-green-500'
  if (clamped > 66) color = 'bg-red-500'
  else if (clamped > 33) color = 'bg-blue-500'
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div className={`${color} h-2 transition-all`} style={{width: clamped+'%'}} />
    </div>
  )
}
