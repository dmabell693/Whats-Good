import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Jumbotron, Container, Form, Button, Col, Row, Image } from 'react-bootstrap';

import UserInfoContext from '../../utils/UserInfoContext';
import AuthService from '../../utils/auth';
import * as API from '../../utils/API';
import FeedCard from '../../components/FeedCard';
import ProfileFeedCard from '../../components/ProfileFeedCard';
import SideBar from '../../components/SideBar';
import SubNavbar from '../../components/SubNavbar';

import './style.css';

function ProfilePage() {

  const userData = useContext(UserInfoContext);
  console.log('userData: ', userData);

  const [bioUpdate, setBioUpdate] = useState(false);
  const [bioText, setBioText] = useState('');


  const updateBio = (bioText) => {
    console.log('bioText: ', bioText);

    const token = AuthService.loggedIn() ? AuthService.getToken() : null;

    if (!token) {
      return false;
    }

    API.saveUserBio({ bioText }, token)
      .then(() => setBioText(''))
      .then(() => setBioUpdate(false))
      .then(() => userData.getUserData())
      .catch((err) => console.log(err));
  }

  const [reviewInput, setReviewInput] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hover, setHover] = useState(null);

  // set state to activate review form
  const [selectedMediaReview, setSelectedMediaReview] = useState('');
  const [selectedMediaRating, setSelectedMediaRating] = useState(0);

  const [myMediaState, setMyMediaState] = useState([]);
  const [myFavoriteState, setMyFavoriteState] = useState([]);

  function compareTimeStamp(a, b) {
    return b.timeStamp - a.timeStamp;
  }

  // to pass into notifications so user knows who liked something
  // const likerId = userData._id;
  const likerUsername = userData.username;

  useEffect(() => {
    setMyMediaState([]);
    setMyFavoriteState([]);
    renderAllMedia();
  }, [userData.username, userData.savedBooks, userData.savedMovies, userData.savedGames, userData.savedMusic]);

  const makeFavorite = (media) => {
    console.log('from SavedMovies: ', media);

    const token = AuthService.loggedIn() ? AuthService.getToken() : null;

    if (!token) {
      return false;
    }

    let isFavorite;

    if (media.userFavorite === true) {
      isFavorite = false;
    } else {
      isFavorite = true;
    }

    let updateCriteria = {
      type: media.mediaType,
      id: media._id,
      favorite: isFavorite
    }

    console.log('updateCriteria: ', updateCriteria);

    API.makeFavorite(updateCriteria, token)
      .then(() => userData.getUserData())
      .catch((err) => console.log(err));
  }

  const startReview = (media) => {
    console.log('media: ', media);

    setSelectedMediaReview(media);
  }

  const handleReviewFormSubmit = (event) => {
    event.preventDefault();

    saveUserReview();
  }

  const saveUserReview = () => {

    const token = AuthService.loggedIn() ? AuthService.getToken() : null;

    if (!token) {
      return false;
    }

    let updateCriteria = {
      type: selectedMediaReview.mediaType,
      id: selectedMediaReview._id,
      review: reviewInput
    }
    console.log(updateCriteria);

    API.saveUserReview(updateCriteria, token)
      .then(() => setReviewInput(''))
      .then(() => setSelectedMediaReview(''))
      .then(() => userData.getUserData())
      .catch((err) => console.log(err));
  }

  const startRating = (media) => {
    console.log('movie: ', media);

    setSelectedMediaRating(media);
  }

  const handleRatingFormSubmit = (event) => {
    event.preventDefault();

    saveUserRating();
  }

  const saveUserRating = () => {

    const token = AuthService.loggedIn() ? AuthService.getToken() : null;

    if (!token) {
      return false;
    }

    let updateCriteria = {
      type: selectedMediaRating.mediaType,
      id: selectedMediaRating._id,
      userRating: userRating
    }
    console.log('updatedCriteria: ', updateCriteria);

    API.saveUserRating(updateCriteria, token)
      .then(() => setUserRating(0))
      .then(() => setSelectedMediaRating(0))
      .then(() => userData.getUserData())
      .catch((err) => console.log(err));
  }

  const handleDeleteMovie = (movie_id) => {
    // get token
    const token = AuthService.loggedIn() ? AuthService.getToken() : null;

    if (!token) {
      return false;
    }
    API.deleteMovie(movie_id, token)
      // upon succes, update user data to reflect book change
      .then(() => userData.getUserData())
      .catch((err) => console.log(err));
  };

  const handleDeleteGame = (gameId) => {
    // get token
    const token = AuthService.loggedIn() ? AuthService.getToken() : null;

    if (!token) {
      return false;
    }
    API.deleteGame(gameId, token)
      // upon succes, update user data to reflect book change
      .then(() => userData.getUserData())
      .catch((err) => console.log(err));
  };

  const handleDeleteBook = (bookId) => {
    // get token
    const token = AuthService.loggedIn() ? AuthService.getToken() : null;

    if (!token) {
      return false;
    }
    API.deleteBook(bookId, token)
      // upon succes, update user data to reflect book change
      .then(() => userData.getUserData())
      .catch((err) => console.log(err));
  };

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteMusic = (musicId) => {
    // get token
    const token = AuthService.loggedIn() ? AuthService.getToken() : null;

    if (!token) {
      return false;
    }
    API.deleteMusic(musicId, token)
      // upon succes, update user data to reflect book change
      .then(() => userData.getUserData())
      .catch((err) => console.log(err));
  };

  function renderAllMedia() {

    if (userData.savedBooks.length > 0) {

      userData.savedBooks.map(savedBook => {

        let savedBookData = {
          mediaType: savedBook.mediaType,
          timeStamp: savedBook.timeStamp,
          createdAt: savedBook.createdAt,
          _id: savedBook._id,
          mediaId: savedBook.mediaId,
          username: userData.username,
          picture: userData.picture,
          userId: userData.id,
          image: savedBook.image,
          title: savedBook.title,
          authors: savedBook.authors,
          description: savedBook.description,
          userRating: savedBook.userRating,
          userReview: savedBook.userReview,
          likes: savedBook.likes,
          comments: savedBook.comments,
          userFavorite: savedBook.userFavorite
        }

        setMyMediaState(myMediaState => [...myMediaState, savedBookData].sort(compareTimeStamp))

      })
    }

    if (userData.savedMusic.length > 0) {

      userData.savedMusic.map(savedMusic => {

        let savedMusicData = {
          mediaType: savedMusic.mediaType,
          timeStamp: savedMusic.timeStamp,
          createdAt: savedMusic.createdAt,
          _id: savedMusic._id,
          username: userData.username,
          picture: userData.picture,
          userId: userData.id,
          image: savedMusic.image,
          title: savedMusic.title,
          link: savedMusic.link,
          artist: savedMusic.artist,
          preview: savedMusic.preview,
          userRating: savedMusic.userRating,
          userReview: savedMusic.userReview,
          likes: savedMusic.likes,
          comments: savedMusic.comments,
          userFavorite: savedMusic.userFavorite
        }

        setMyMediaState(myMediaState => [...myMediaState, savedMusicData].sort(compareTimeStamp))

      })
    }

    if (userData.savedMovies.length > 0) {

      userData.savedMovies.map(savedMovie => {

        let savedMovieData = {
          mediaType: savedMovie.mediaType,
          timeStamp: savedMovie.timeStamp,
          createdAt: savedMovie.createdAt,
          _id: savedMovie._id,
          mediaId: savedMovie.mediaId,
          username: userData.username,
          picture: userData.picture,
          userId: userData.id,
          image: savedMovie.image,
          title: savedMovie.title,
          runtime: savedMovie.runtime,
          released: savedMovie.released,
          rated: savedMovie.rated,
          plot: savedMovie.plot,
          genre: savedMovie.genre,
          director: savedMovie.director,
          actors: savedMovie.actors,
          userRating: savedMovie.userRating,
          userReview: savedMovie.userReview,
          likes: savedMovie.likes,
          comments: savedMovie.comments,
          userFavorite: savedMovie.userFavorite
        }

        setMyMediaState(myMediaState => [...myMediaState, savedMovieData].sort(compareTimeStamp))

      })

    }

    if (userData.savedGames.length > 0) {

      userData.savedGames.map(savedGame => {

        let savedGameData = {
          mediaType: savedGame.mediaType,
          timeStamp: savedGame.timeStamp,
          createdAt: savedGame.createdAt,
          _id: savedGame._id,
          username: userData.username,
          picture: userData.picture,
          userId: userData.id,
          image: savedGame.image,
          title: savedGame.title,
          developer: savedGame.developer,
          description: savedGame.description,
          userRating: savedGame.userRating,
          userReview: savedGame.userReview,
          likes: savedGame.likes,
          comments: savedGame.comments,
          userFavorite: savedGame.userFavorite
        }
        setMyMediaState(myMediaState => [...myMediaState, savedGameData].sort(compareTimeStamp))
      })
    }
  }

  const handleRenderMediaPage = useCallback((mediaType) => {

    setMyMediaState([]);
    setMyFavoriteState([]);

    let favoritesArr = [];

    if (mediaType === "all") {
      renderAllMedia();
    }

    if (mediaType === "favorites") {
      userData.savedBooks.filter(savedBook => {
        if (savedBook.userFavorite) {
          favoritesArr.push(savedBook);
        }
      });

      userData.savedMovies.filter(savedMovie => {
        if (savedMovie.userFavorite) {
          favoritesArr.push(savedMovie);
        }
      });

      userData.savedGames.filter(savedGame => {
        if (savedGame.userFavorite) {
          favoritesArr.push(savedGame);
        }
      });

      userData.savedMusic.filter(savedMusic => {
        if (savedMusic.userFavorite) {
          favoritesArr.push(savedMusic);
        }
      })

      setMyFavoriteState(favoritesArr.sort(compareTimeStamp));
    }

    if (mediaType === "music") {

      userData.savedMusic.map(savedMusic => {

        let savedMusicData = {
          mediaType: savedMusic.mediaType,
          timeStamp: savedMusic.timeStamp,
          createdAt: savedMusic.createdAt,
          _id: savedMusic._id,
          username: userData.username,
          picture: userData.picture,
          userId: userData.id,
          image: savedMusic.image,
          title: savedMusic.title,
          link: savedMusic.link,
          artist: savedMusic.artist,
          preview: savedMusic.preview,
          userRating: savedMusic.userRating,
          userReview: savedMusic.userReview,
          likes: savedMusic.likes,
          comments: savedMusic.comments,
          userFavorite: savedMusic.userFavorite
        }
        setMyMediaState(myMediaState => [...myMediaState, savedMusicData].sort(compareTimeStamp))
      })
    }

    if (mediaType === "game") {

      userData.savedGames.map(savedGame => {

        let savedGameData = {
          mediaType: savedGame.mediaType,
          timeStamp: savedGame.timeStamp,
          createdAt: savedGame.createdAt,
          _id: savedGame._id,
          username: userData.username,
          picture: userData.picture,
          userId: userData.id,
          image: savedGame.image,
          title: savedGame.title,
          developer: savedGame.developer,
          description: savedGame.description,
          userRating: savedGame.userRating,
          userReview: savedGame.userReview,
          likes: savedGame.likes,
          comments: savedGame.comments,
          userFavorite: savedGame.userFavorite
        }
        setMyMediaState(myMediaState => [...myMediaState, savedGameData].sort(compareTimeStamp))
      })
    }

    if (mediaType === "movie") {

      userData.savedMovies.map(savedMovie => {

        let savedMovieData = {
          mediaType: savedMovie.mediaType,
          timeStamp: savedMovie.timeStamp,
          createdAt: savedMovie.createdAt,
          _id: savedMovie._id,
          mediaId: savedMovie.mediaId,
          username: userData.username,
          picture: userData.picture,
          userId: userData.id,
          image: savedMovie.image,
          title: savedMovie.title,
          runtime: savedMovie.runtime,
          released: savedMovie.released,
          rated: savedMovie.rated,
          plot: savedMovie.plot,
          genre: savedMovie.genre,
          director: savedMovie.director,
          actors: savedMovie.actors,
          userRating: savedMovie.userRating,
          userReview: savedMovie.userReview,
          likes: savedMovie.likes,
          comments: savedMovie.comments,
          userFavorite: savedMovie.userFavorite
        }

        setMyMediaState(myMediaState => [...myMediaState, savedMovieData].sort(compareTimeStamp))
      })
    }

    if (mediaType === "book") {

      userData.savedBooks.map(savedBook => {

        let savedBookData = {
          mediaType: savedBook.mediaType,
          timeStamp: savedBook.timeStamp,
          createdAt: savedBook.createdAt,
          _id: savedBook._id,
          mediaId: savedBook.mediaId,
          username: userData.username,
          picture: userData.picture,
          userId: userData.id,
          image: savedBook.image,
          title: savedBook.title,
          authors: savedBook.authors,
          description: savedBook.description,
          userRating: savedBook.userRating,
          userReview: savedBook.userReview,
          likes: savedBook.likes,
          comments: savedBook.comments,
          userFavorite: savedBook.userFavorite
        }
        setMyMediaState(myMediaState => [...myMediaState, savedBookData].sort(compareTimeStamp))
      })
    }
  })

  const handleSaveLike = useCallback((likeMediaType, like_id, mediaLikes, ownerId, title) => {
    // find the friend in `searchedUser` state by the matching id
    // const userToSave = searchedUser.find((user) => user._id === userId);

    // get token
    const token = AuthService.loggedIn() ? AuthService.getToken() : null;
    if (!token) {
      return false;
    }

    let likeData = {
      mediaType: likeMediaType,
      mediaId: like_id,
    }

    let addLikeData = {
      mediaType: likeMediaType,
      _id: like_id,
      likes: mediaLikes
    }

    // info for notification
    const notificationData = {
      likerUsername: likerUsername,
      title: title,
      ownerId: ownerId,
      type: "like"
    }

    console.log("data for like, ", likeData)

    API.saveLike(likeData, token)
      .then(() => {
        console.log("Token: ", token, "likeData: ", likeData);
        userData.getUserData();

      })
      .catch((err) => console.log(err));

    API.addLike(addLikeData, token)
      .then(() => {

        userData.getUserData();

      })
      .catch((err) => console.log(err));
    //call to send notification to user  

    API.addNotification(notificationData, token)
      .then(() => {
        console.log("NOTIFICATION ADDED");
        userData.getUserData();
      })
      .catch(err => console.log(err));
  });

  return (
    <>
      {/* <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>
            {userData.username.toUpperCase()}'S PROFILE
          </h1>
        </Container>
      </Jumbotron> */}
      <Row>
        <Col>
          <SubNavbar xs={12} s={12} md={12} lg={0} cb={handleRenderMediaPage} page={'profile'} />
        </Col>
      </Row>
      <Row id='center-wrap'>
        <Col>
          <div id='my-profile-pic'>
            <Image
              src={userData.picture}
              alt={`${userData.username}'s face, probably`}
              roundedCircle
              className='img-fluid'
            />
            {userData.username && (
              <>
                {(userData.bio !== '' || null)
                  ?
                  <div>
                    {console.log("userData.bio", userData.bio)}
                    <h6>
                      A little about me:
                      </h6>
                    <p>
                      {userData.bio}
                    </p>
                    <Button
                      className='btn btn-success'
                      onClick={() => setBioUpdate(true)}
                    >
                      Update Your Bio
                      </Button>
                  </div>
                  :
                  <>
                    <Button
                      className='btn btn-success'
                      onClick={() => setBioUpdate(true)}
                    >
                      Add a Mini-Bio
                    </Button>
                  </>
                }
              </>
            )}
            {bioUpdate &&
              <>
                <Form>
                  <Col>
                    <Form.Control
                      name='bio-text'
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      type='text'
                      size='md'
                      as='textarea'
                      rows='6'
                      placeholder='enter your bio here'
                    />
                  </Col>
                </Form>
                <Button
                  className='btn btn-succes'
                  onClick={() => updateBio(bioText)}
                >
                  Save Bio
                </Button>
              </>
            }
          </div>
        </Col>
      </Row>
      {/* <Row>
        <Col> */}
      <Container width="100%">
        <Row id="main-body-row">
          <Col id="side-bar-column" className="text-right" xs={0} s={0} md={1} lg={3}>
            <SideBar
              cb={handleRenderMediaPage}
              page='profile'
            />
          </Col>
          <Col id="media-feed-column" xs={12} s={12} md={10} lg={6} >
            {myMediaState.map(media => {
              if (media.mediaType === 'Book') {
                return (
                  <ProfileFeedCard
                    media={media}
                    cb={handleSaveLike}
                    mediaType={'book'}
                    userData={userData}
                    startRating={startRating}
                    selectedMediaRating={selectedMediaRating}
                    handleRatingFormSubmit={handleRatingFormSubmit}
                    setUserRating={setUserRating}
                    setHover={setHover}
                    hover={hover}
                    userRating={userRating}
                    startReview={startReview}
                    selectedMediaReview={selectedMediaReview}
                    handleReviewFormSubmit={handleReviewFormSubmit}
                    reviewInput={reviewInput}
                    setReviewInput={setReviewInput}
                    handleDeleteBook={handleDeleteBook}
                    makeFavorite={makeFavorite}
                  />
                );
              } else if (media.mediaType === "Music") {
                return (
                  <ProfileFeedCard
                    media={media}
                    cb={handleSaveLike}
                    mediaType={'music'}
                    userData={userData}
                    startRating={startRating}
                    selectedMediaRating={selectedMediaRating}
                    handleRatingFormSubmit={handleRatingFormSubmit}
                    setUserRating={setUserRating}
                    setHover={setHover}
                    hover={hover}
                    userRating={userRating}
                    startReview={startReview}
                    selectedMediaReview={selectedMediaReview}
                    handleReviewFormSubmit={handleReviewFormSubmit}
                    reviewInput={reviewInput}
                    setReviewInput={setReviewInput}
                    handleDeleteMusic={handleDeleteMusic}
                    makeFavorite={makeFavorite}
                  />
                );
              } else if (media.mediaType === "Movie") {
                return (
                  <ProfileFeedCard
                    media={media}
                    cb={handleSaveLike}
                    mediaType={'movie'}
                    userData={userData}
                    startRating={startRating}
                    selectedMediaRating={selectedMediaRating}
                    handleRatingFormSubmit={handleRatingFormSubmit}
                    setUserRating={setUserRating}
                    setHover={setHover}
                    hover={hover}
                    userRating={userRating}
                    startReview={startReview}
                    selectedMediaReview={selectedMediaReview}
                    handleReviewFormSubmit={handleReviewFormSubmit}
                    reviewInput={reviewInput}
                    setReviewInput={setReviewInput}
                    handleDeleteMovie={handleDeleteMovie}
                    makeFavorite={makeFavorite}
                  />
                );
              } else if (media.mediaType === "Game") {
                return (
                  <ProfileFeedCard
                    media={media}
                    cb={handleSaveLike}
                    mediaType={'game'}
                    userData={userData}
                    startRating={startRating}
                    selectedMediaRating={selectedMediaRating}
                    handleRatingFormSubmit={handleRatingFormSubmit}
                    setUserRating={setUserRating}
                    setHover={setHover}
                    hover={hover}
                    userRating={userRating}
                    startReview={startReview}
                    selectedMediaReview={selectedMediaReview}
                    handleReviewFormSubmit={handleReviewFormSubmit}
                    reviewInput={reviewInput}
                    setReviewInput={setReviewInput}
                    handleDeleteGame={handleDeleteGame}
                    makeFavorite={makeFavorite}
                  />
                );
              };
              return;
            })}
            {myFavoriteState.map(media => {
              return (
                <FeedCard
                  media={media}
                  userData={userData}
                />
              )
            })
            }

          </Col>
          <Col xs={0} s={0} md={1} lg={3}>

          </Col>
        </Row>
      </Container>
      {/* </Col>
      </Row> */}
    </>
  )
}

export default ProfilePage;