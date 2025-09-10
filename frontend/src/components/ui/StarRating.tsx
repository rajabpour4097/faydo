import React from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  interactive = false,
  onRate 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleStarClick = (starIndex: number) => {
    if (interactive && onRate) {
      onRate(starIndex + 1);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[...Array(maxRating)].map((_, index) => (
        <button
          key={index}
          type="button"
          className={`${sizeClasses[size]} ${
            interactive 
              ? 'cursor-pointer hover:scale-110 transition-transform' 
              : 'cursor-default'
          }`}
          onClick={() => handleStarClick(index)}
          disabled={!interactive}
        >
          <svg
            className={`w-full h-full ${
              index < rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ))}
    </div>
  );
};
