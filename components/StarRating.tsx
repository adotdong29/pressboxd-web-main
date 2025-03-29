import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  // Inline styles for the star component
  const styles = {
    star: {
      fontSize: '2rem',
      cursor: 'pointer',
      color: '#ccc', // Default empty star color
    },
    filledStar: {
      color: '#fbd705', // Filled star color (Accent color)
    },
  };

  return (
    <div className="star-rating" style={{ display: 'inline-block' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            ...styles.star,
            ...(star <= (hoverRating || rating) ? styles.filledStar : {}),
          }}
          onClick={() => onRatingChange(star)} // Change rating on click
          onMouseEnter={() => setHoverRating(star)} // Handle hover
          onMouseLeave={() => setHoverRating(0)} // Reset hover effect
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
