import express from 'express'
import morgan from 'morgan';
// import { updateFilm, addNewFilm, getAllFilms, getFavoriteFilms, getFilm, getLatestFilms, getTopRated, getUnseenFilms, updateRating, updateIsFavorite, deleteFilm } from './dao.mjs'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js'
import Film from './Film.mjs'
import { check, param, validationResult } from 'express-validator';
import FilmDao from './dao.mjs';
import cors from 'cors';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import UserDao from './user-dao.mjs';

const app = express();
const filmDao = new FilmDao();
const userDao = new UserDao();

const port = 3000

app.use(morgan('common'))
app.use(express.json())

// set up and enable CORS -- UPDATED
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions))

// Passport configuration
passport.use(new LocalStrategy(function verify(username, password, callback) {

    userDao.getUser(username, password).then((user) => {
        if (!user) {
            return callback(null, false, 'Incorrect username and/or password.')
        }
        else {
            return callback(null, user)

        }
    })
}))

// enable session in express
app.use(session({
    secret: 'thissssss is my secret!',
    resave: false,
    saveUninitialized: false,
}))


// init passport to use sessions
app.use(passport.authenticate('session'))

passport.serializeUser((user, cb) => {
    cb(null, user)
})

passport.deserializeUser((user, cb) => {
    return cb(null, user)
})




// This function is used to handle validation errors
const onValidationErrors = (validationResult, res) => {
    const errors = validationResult.formatWith(errorFormatter);
    return res.status(422).json({ validationErrors: errors.mapped() });
};

// Only keep the error message in the response
const errorFormatter = ({ msg }) => {
    return msg;
};

const filmValidation = [
    check('title').isString().notEmpty(),
    check('favorite').isBoolean().optional(),
    check('watchDate').optional({ nullable: true }).isISO8601({ strict: true }).toDate(),
    check('score').optional({ nullable: true }).isInt({ min: 0, max: 5 })
    // check('userId').isInt()
]


// login API

app.post('/api/sessions', passport.authenticate('local'), (req, res) => {
    res.json(req.user)
})

/*** Films APIs ***/
// 1. Retrieve the list of all the available films.
// GET /api/films
// This route returns the FilmLibrary. It handles also "filter=?" query parameter
app.get('/api/films', async (req, res) => {
    try {
        const films = await filmDao.getFilms(req.query.filter)
        res.json(films)
    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }

})


// 2. Retrieve a film, given its "id".
// GET /api/films/<id>
// Given a film id, this route returns the associated film from the library.

app.get('/api/films/:id', param('id').isInt(), (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return onValidationErrors(errors, res);
    }
    else {
        const filmId = req.params.id
        filmDao.getFilm(filmId).then((f) => {
            res.json(f)
        }).catch((err) => {
            res.status(500).json({ error: err.message })
        })
    }
})

// Create a new film
app.post('/api/films', filmValidation, (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return onValidationErrors(errors, res);
    }
    else {
        const newFilm = new Film(undefined, req.body.title, req.body.favorite, req.body.watchDate, req.body.rating, req.body.userId)
        filmDao.addNewFilm(newFilm).then((f) => {
            res.json(f)
        }).catch((err) => {
            res.status(500).json({ error: err.message })
        })
    }
})

// Update an existing film
app.put('/api/films/:id', filmValidation, (req, res) => {
    const errors = validationResult(req)
    const filmId = Number(req.params.id)

    if (!errors.isEmpty()) {
        return onValidationErrors(errors, res);
    }
    else {
        const updatedFilm = new Film(filmId, req.body.title, req.body.favorite, req.body.watchDate, req.body.rating, req.body.userId)
        filmDao.updateFilm(updatedFilm).then((f) => {
            res.json(f)
        }).catch((err) => {
            res.status(500).json({ error: err })
        })
    }

})

// Update rating of a film
app.put('/api/films/:id/rating', [param('id').isInt(),
check('rating').isInt({ min: 0, max: 5 })], (req, res) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        filmDao.updateRating(req.params.id, req.body.rating).then((f) => {
            res.json(f)
        }).catch((err) => {
            res.status(500).json({ error: err })
        })
    }
    else {
        res.json({ errors: errors.array() })
    }
})

// Mark a film as favorite/unfavorite
app.put('/api/films/:id/favorite', [param('id').isInt(), check('favorite').isBoolean()], (req, res) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        filmDao.updateIsFavorite(req.params.id, req.body.favorite).then((f) => {
            res.json(f)
        }).catch((err) => {
            res.status(500).json({ error: err })
        })
    }
    else {
        res.status(422).json({ errors: errors.array() })
    }
})

// Delete a film
app.delete('/api/films/:id', param('id').isInt(), (req, res) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        filmDao.deleteFilm(req.params.id).then((f) => {
            res.json(f)
        }).catch((err) => {
            res.status(500).json({ error: err })
        })
    }
    else {
        res.status(422).json({ errors: errors.array() })
    }
})



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
})