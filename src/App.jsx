import React, { useState, useEffect } from 'react';
import Search from './components/Search.jsx';
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx';
import { useDebounce } from 'react-use';
import { updateSearchCount } from './appwrite.js'

// API constants defined at the top level of the module
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce the search term from making too many API requests by waiting for user to stop typing for 600ms
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 600, [searchTerm]);

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        // This handles HTTP errors (like 401 Unauthorized or 404 Not Found)
        const errorData = await response.json();
        throw new Error(errorData.status_message || 'Failed to fetch movies');
      }

      const data = await response.json();

      // Correctly set the movie list using the 'results' property from TMDB
      setMovieList(data.results || []);
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without The Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
                <ul>
                  {/* Using implicit return () and adding the required `key` prop */}
                  {movieList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie}/>
                  ))}
                </ul>
              )}
        </section>
      </div>
    </main>
  );
};

export default App;
