/* eslint-disable react/prop-types */
import { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/API";

const api = new API();

function FilmForm({ films, loadFilms, mode }) {
  const navigate = useNavigate();
  const params = useParams();
  const filmId = params.filmId;

  const editableFilm =
    films && films.find((film) => film.id === parseInt(filmId));
  // console.log("at FilmForm.jsx editableFilm:", editableFilm);
  const [title, setTitle] = useState(editableFilm ? editableFilm.title : "");
  const [favorite, setFavorite] = useState(
    editableFilm ? editableFilm.favorite : false
  );
  const [watchDate, setWatchDate] = useState(
    editableFilm && editableFilm.watchDate
      ? editableFilm.watchDate.format("YYYY-MM-DD")
      : ""
  );
  const [score, setScore] = useState(
    editableFilm && editableFilm.score ? editableFilm.score : 0
  );
  const [userId, setUserId] = useState(editableFilm ? editableFilm.userId : 1);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const scoreInt = parseInt(score);
    const userIdInt = parseInt(userId);
    // const film = new Film(1, title, favorite, watchDate, scoreInt, userIdInt);
    const film = {
      title,
      favorite,
      watchDate,
      score: scoreInt,
      userId: userIdInt,
    };
    if (editableFilm) {
      try {
        await api.updateFilm({ id: editableFilm.id, ...film });
        await loadFilms();
        navigate("..");
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        // console.log("at handleSubmit in FilmForm.jsx film:", film);
        await api.saveFilm(film);
        await loadFilms();
        navigate("..");
      } catch (err) {
        console.error(err);
      }
    }
    navigate("..");
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            required={true}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Check
            type="checkbox"
            id="Favorite"
            label="Favorite"
            checked={favorite}
            onChange={(event) => setFavorite(event.target.checked)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            value={watchDate}
            onChange={(event) => setWatchDate(event.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Score</Form.Label>
          <Form.Control
            type="number"
            min="0"
            max="5"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>User Id</Form.Label>
          <Form.Control
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required={true}
          />
        </Form.Group>
        <br />
        {mode === "add" && <Button type="submit">Add</Button>}
        {mode === "edit" && <Button type="submit">Save</Button>}{" "}
        <Button onClick={() => navigate("..")}>Cancel</Button>
      </Form>
    </Container>
  );
}

console.log();

export default FilmForm;
