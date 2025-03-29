'use client';

import React, { useState, useEffect } from 'react';
import { browserClient } from '@/utils/supabase/client';
import StarRating from '@/components/StarRating';

type Game = {
  id: string;
  game_name: string;
  date: string;
  start_time: string;
  home_team: string;
  away_team: string;
};

type User = {
  id: string;
  username?: string;
  full_name?: string;
};

const GameDetailPage = ({ params }: { params: { id: string } }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = browserClient();
  const [user, setUser] = useState<User | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState(false);
  const [rootingFor, setRootingFor] = useState<string>('Neither');

  useEffect(() => {
    const fetchGameDetails = async () => {
      if (params.id) {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          console.error('Error fetching game:', error);
        } else {
          setGame(data);
        }
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    };

    fetchGameDetails();
    fetchUser();
  }, [params.id]);

  const handleHeartToggle = () => {
    setLiked((prevLiked) => !prevLiked);
  };

  const handleReviewSubmit = async (e: any) => {
    e.preventDefault();

    if (!user) {
      alert('You must be logged in to add a review!');
      return;
    }

    console.log('Submitting review with values:', {
      game_id: params.id,
      user_id: user.id,
      review_text: reviewText,
      rating,
      liked,
      rootingFor,
    });
 
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          game: params.id,
          user_id: user.id,
          review: reviewText,
          rating: rating,
          liked: liked,
          rooting_for: rootingFor, // Submit the selected team or 'Neither'
          date: new Date(),
        },
      ]);

    if (error) {
      console.error('Error submitting review:', error);
    } else {
      setReviewText('');
      setRating(0);
      setIsAddingReview(false);
      alert('Review added successfully!');
      location.reload();
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!game) {
    return <p>No game found</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{game.game_name}</h1>
      <p>
        <strong>Date:</strong> {game.date}
      </p>
      <p>
        <strong>Start Time:</strong> {game.start_time}
      </p>
      <p>
        <strong>Home Team:</strong> {game.home_team}
      </p>
      <p>
        <strong>Away Team:</strong> {game.away_team}
      </p>

      {user && (
        <button
          onClick={() => setIsAddingReview(!isAddingReview)}
          className="bg-yellow-500 text-white p-2 rounded mt-4"
        >
          {isAddingReview ? 'Cancel' : 'Add Review'}
        </button>
      )}

      {!user && <p>Please log in to add a review.</p>}

      {isAddingReview && (
        <form onSubmit={handleReviewSubmit} className="mt-4">
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review..."
            className="w-full p-2 text-black border rounded"
            rows={5}
          />

          <StarRating rating={rating} onRatingChange={setRating} />

          <div className="mt-4">
            <label htmlFor="rootingFor" className="block mb-2">
              Who were you rooting for?
            </label>
            <select
              id="rootingFor"
              value={rootingFor}
              onChange={(e) => setRootingFor(e.target.value)} // Update the team name value
              className="w-full p-2 border rounded text-black"
            >
              <option value={game.home_team}>Home Team ({game.home_team})</option>
              <option value={game.away_team}>Away Team ({game.away_team})</option>
              <option value="Neither">Neither</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleHeartToggle}
            className="text-3xl"
            style={{ color: liked ? 'red' : 'gray' }}
          >
            {liked ? '♥' : '♡'}
          </button>

          <button
            type="submit" className="bg-orange-500 text-white p-2 rounded mt-2">
            Submit Review
          </button>
        </form>
      )}
    </div>
  );
};

export default GameDetailPage;
