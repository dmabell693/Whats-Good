import React, { useState, useContext, useCallback } from 'react';
import { Jumbotron, Row, Container, Col, Form, Button } from 'react-bootstrap';

import * as API from '../../utils/API';
import UserInfoContext from '../../utils/UserInfoContext';
import AuthService from '../../utils/auth';
// import { saveMovie, searchOMDB, searchEachMovie, } from '../utils/API';
// import { saveUserRating, saveMovieReview } as API from '../utils/API';
import SearchCards from '../../components/SearchCards';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faBookOpen, faGamepad, faMusic, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import './style.css';

function SearchMovies() {
  // create state for holding returned omdb api data
  const [searchedMovies, setSearchedMovies] = useState([]);
  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState('');

  const userData = useContext(UserInfoContext);

  // create method to search for movies and set state on form submit
  const handleFormSubmit = (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    let movieDataArr = [];

    API.searchOMDB(searchInput)
      .then(({ data }) => {
        const movieID = data.Search.map(movie => (movie.imdbID));

        movieID.forEach(id => {
          API.searchEachMovie(id)
            .then((res) => {
              movieDataArr.push(res);
            })
            .then(() => {
              const movieData = movieDataArr.map(movie => ({
                mediaId: movie.data.imdbID,
                timeStamp: Date.now(),
                createdAt: Date(),
                actors: movie.data.Actors,
                director: movie.data.Director,
                genre: movie.data.Genre,
                plot: movie.data.Plot,
                rated: movie.data.Rated,
                released: movie.data.Released,
                runtime: movie.data.Runtime,
                title: movie.data.Title,
                image: movie.data.Poster || '',
              }));

              return setSearchedMovies(movieData);
            })
        });
      })
      .then(() => setSearchInput(''))
      .catch((err) => console.log(err));
  };

  // create function to handle saving a movie to the database

  const handleSaveMedia = useCallback((movie, userRating, userReview) => {
    // find the movie in `searchedMovies` state by the matching id
    const movieToSave = {
      mediaId: movie.mediaId,
      timeStamp: Date.now(),
      createdAt: Date(),
      actors: movie.actors,
      director: movie.director,
      genre: movie.genre,
      plot: movie.plot,
      rated: movie.rated,
      released: movie.released,
      runtime: movie.runtime,
      title: movie.title,
      image: movie.image || '',
      userRating: userRating,
      userReview: userReview
    }

    console.log('movieToSave: ', movieToSave);
    // get token
    const token = AuthService.loggedIn() ? AuthService.getToken() : null;

    if (!token) {
      return false;
    }

    // send the movie data to the api
    API.saveMovie(movieToSave, token)
      .then(() => userData.getUserData())
      .catch((err) => console.log(err));
  });
  

  return (
    <div id="container">
      <Row>
        <Container id='search-wrap'>
          <Row>
            <Col xs={0} s={0} md={1} lg={2}></Col>
            <Col xs={12} s={12} md={10} lg={8}>
              <h5 id="search-heading">SEARCH MOVIES</h5>
              <div id='form-hugger'>
                <Form onSubmit={handleFormSubmit}>
                  <Form.Control
                    id="api-search-input"
                    name='searchInput'
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    type='text'
                    size='lg'
                    placeholder='Search for a movie'
                  />
                  <p className='search-icon-group'>
                    <a href='/search_music'>
                      <FontAwesomeIcon
                        className='search-icon'
                        id='neon-hover'
                        icon={faMusic}
                      />
                    </a>
                    <a href='/search_movies'>
                      <FontAwesomeIcon
                        className='search-icon'
                        id='neon-hover'
                        icon={faVideo}
                      />
                    </a>
                    <a href='/search_games'>
                      <FontAwesomeIcon
                        className='search-icon'
                        id='neon-hover'
                        icon={faGamepad}
                      />
                    </a>
                    <a href='/search_books'>
                      <FontAwesomeIcon
                        className='search-icon'
                        id='neon-hover'
                        icon={faBookOpen}
                      />
                    </a>
                    <a href='/search_user'>
                      <FontAwesomeIcon
                        className='search-icon'
                        id='neon-hover'
                        icon={faUserFriends}
                      />
                    </a>
                  </p>
                  <Button id="form-search-btn" type='submit' size='lg'>
                    SEARCH
                </Button>
                </Form>
              </div>
            </Col>
            <Col xs={0} s={0} md={1} lg={2}></Col>
          </Row>
          <hr></hr>
        </Container>
      </Row>
      <Container>
        <SearchCards
        cardType='searchedMovies'
        resultArray={searchedMovies}
        savedArray={userData.savedMovies}
        username={userData.username}
        cb={handleSaveMedia}
        />
      </Container>
    </div>
  );
}

export default SearchMovies;
