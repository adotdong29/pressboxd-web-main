"use client";

import React, { useState, useEffect } from "react";
import { browserClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import styles from "./search.module.css"; // Import the CSS module

type Game = {
  id: string;
  game_name: string;
  date: string;
  start_time: string;
}[];

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [games, setGames] = useState<Game>([]);
  const [loading, setLoading] = useState(false);

  const supabase = browserClient();

  const fetchGames = async () => {
    setLoading(true);

    if (searchTerm.trim() === "") {
      setGames([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("games")
      .select("*")
      .ilike("game_name", `%${searchTerm}%`);

    if (error) {
      console.error("Error fetching games:", error);
    } else {
      setGames(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchGames();
  }, [searchTerm]);

  return (
    <div className={styles["search-container"]}>
      <h1 className="text-2xl font-bold mb-4">Search for Games</h1>
      <Input
        type="text"
        placeholder="Search games..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles["search-input"]}
      />

      {loading && <p>Loading...</p>}

      {!loading && games.length > 0 ? (
        <ul className={styles["search-results"]}>
          {games.map((game) => (
            <li key={game.id} className={styles["search-result-item"]}>
              <Link href={`/app/games/${game.id}`}>
                {game.game_name} - {game.date} - {game.start_time}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>No games found</p>
      )}
    </div>
  );
};

export default SearchPage;
