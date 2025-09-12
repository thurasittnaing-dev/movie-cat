import React, {useEffect, useState} from 'react'
import Search from "./components/Search.jsx";
import Loading from "./components/Loading.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {useDebounce} from "react-use";
import {getTrendingMovies, updateSearchCount} from "./lib/appwrite.js";

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept : 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {

    const [searchTerm,setSearchTerm] = useState('');
    const [debounceSearchTerm,setDebounceSearchTerm] = useState('');
    const [errorMessage,setErrorMessage] = useState(null);
    const [movieList,setMovieList] = useState([]);
    const [isLoading,setIsLoading] = useState(false);
    const [trendingMovies,setTrendingMovies] = useState([]);

    useDebounce(()=> setDebounceSearchTerm(searchTerm),500,[searchTerm]);

    const fetchMovies = async (query = '')=> {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const endPoint = query ?
                `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
            :
                `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endPoint,API_OPTIONS);

            if(!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json();

            if(data.Response === 'False') {
                setErrorMessage(data.Error || 'failed to fetch movie');
                setMovieList([]);
                return;
            }


            setMovieList(data.results || []);
            
            if(query && data.results.length > 0) {
                await updateSearchCount(query,data.results[0]);
            }
        }catch (error) {
            setMovieList([]);
            setIsLoading(false);
            console.log('Movie fetch error!', error);
            setErrorMessage('Error fetching movies. Please check your network or try with VPN.');
        }finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();

            setTrendingMovies(movies);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchMovies(debounceSearchTerm);
      
    }, [debounceSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <main>
            <div className="pattern"/>
 
            <div className="wrapper">
                <header>
                    <img src="./logo.png" alt="Logo" className='mb-5 border-indigo-300 border-[5px]' />
                    <h1>Movie Cat <span className="text-gradient">Streamline</span> your movie journey 🚀</h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {
                    trendingMovies.length > 0 && (
                        <section className="trending">
                            <h2>Top Search Movies</h2>
                            <ul>
                                {
                                    trendingMovies.map((movie,index) =>(
                                        <li key={movie.$id}>
                                            <p>{index + 1}</p>
                                            <img src={movie.poster_url} alt={movie.title} />
                                        </li>
                                    ))
                                }
                            </ul>
                        </section>
                    )
                }

                <section className="all-movies">
                    <h2>All Movies</h2>
                    {
                        isLoading ? (
                            <Loading />
                        ) : errorMessage ? (
                            <p className="text-red-500">{errorMessage}</p>
                        ) : (
                            <ul>
                                {movieList.map((movie) => (
                                   <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </ul>
                        )
                    }
                </section>
            </div>
        </main>
    )
}
export default App
