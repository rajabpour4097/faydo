import React from 'react'

type Props = {
  value: number
  onChange?: (v:number)=>void
  size?: number
  readOnly?: boolean
}

export const StarRating: React.FC<Props> = ({ value, onChange, size=22, readOnly }) => {
  const stars = [1,2,3,4,5]
  return (
    <div className="flex gap-1" dir="ltr">
      {stars.map(s => (
        <button
          key={s}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange && onChange(s)}
          className={`transition ${s <= value ? 'text-yellow-400' : 'text-gray-300'} ${readOnly? 'cursor-default':'hover:scale-110'}`}
          aria-label={`Rate ${s}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill={s <= value ? 'currentColor':'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:size,height:size}}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.98 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      ))}
    </div>
  )
}
