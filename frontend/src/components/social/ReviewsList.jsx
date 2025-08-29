import React, { useState } from 'react';
import ReviewForm from './ReviewForm.jsx';
import ReviewItem from './ReviewItem.jsx';

const initial = [
  { id:1, user:'علی', rating:4, text:'خیلی خوب بود', likes:2, replies:[] }
];

export default function ReviewsList() {
  const [reviews, setReviews] = useState(initial);
  function addReview(r){ setReviews(rs=>[r,...rs]); }
  function updateReview(id, updater){ setReviews(rs=>rs.map(r=>r.id===id? updater(r): r)); }
  return (
    <div className="rounded-xl border border-surface-300 bg-surface-100 p-5 space-y-6">
      <ReviewForm onAdd={addReview} />
      <div className="space-y-4">
        {reviews.map(r => <ReviewItem key={r.id} review={r} onUpdate={updateReview} />)}
      </div>
    </div>
  );
}
