import Film from "./Film.mjs";
import db from "./db.mjs";
import dayjs from "dayjs";

const film1 = new Film(1, "Godfather", true, "2024-08-14", 5, 1)

const filters = {
    "filter-favorite": { label: 'Favorites', filterFunction: film => film.favorite },
    "filter-best": { label: 'Top rated', filterFunction: film => film.score == 5 },
    "filter-lastmonth": { label: 'Seen in last month', filterFunction: film => isSeenLastMonth(film) },
    "filter-unseen": { label: 'Unseen films', filterFunction: film => !film.watchDate },

};

function isSeenLastMonth(film) {
    if ('watchDate' in film && film.watchDate) {
        const diff = film.watchDate.diff(dayjs(), 'month')
        const seen = diff <= 0 && diff > -1;
        return seen
    }
}
// console.log('filter: ' + filters["filter-lastmonth"].filterFunction(film1))

function rowsToFilm(rows) {
    const films = rows.map((row) => {
        return new Film(
            row.id,
            row.title,
            row.isFavorite,
            row.watchDate,
            row.rating,
            row.userId
        );
    });
    return films;
}
export default function FilmDao() {


    this.getFilms = (filter) => {

        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM films';
            db.all(sql, (err, rows) => {
                if (err)
                    reject(err)
                else if (rows.length == 0) {
                    resolve({ error: "No films in the database, try again later!" })
                }
                else {
                    const films = rowsToFilm(rows)
                    if (filters.hasOwnProperty(filter))
                        resolve(films.filter(filters[filter].filterFunction))

                    else
                        resolve(films)

                }
            })
        })
    }


    this.getFilm = (id) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM films
        WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else if (row === undefined) {
                    resolve({ error: "No films found with this id, try again!" });
                } else {
                    resolve(
                        new Film(
                            row.id,
                            row.title,
                            row.isFavorite,
                            row.watchDate,
                            row.rating,
                            row.userId
                        )
                    );
                }
            });
        });
    }


    this.addNewFilm = (film) => {
        const favorite = film.favorite ? film.favorite : false
        const score = (film.score && film.score <= 5 && film.score >= 0) ? film.score : null
        const watchDate = film.watchDate ? film.watchDate.format("YYYY-MM-DD") : null;
        const userId = ("userId" in film && film.userId) ? film.userId : null;
        // console.log(userId)
        return new Promise((resolve, reject) => {
            const sql = `SELECT u.id FROM users u, films f
        WHERE u.id = f.userId AND f.userId = ?`;
            db.get(sql, [film.userId], (err, row) => {
                if (err) reject(err);
                else if (row === undefined) {
                    resolve({ error: "This User Id doesn't exist in the Database!" });
                } else {
                    const sql = `INSERT INTO films(title,isFavorite,rating,watchDate,userId)
            VALUES (?,?,?,?,?)`;
                    db.run(
                        sql,
                        [
                            film.title,
                            film.favorite,
                            score,
                            watchDate,
                            userId,
                        ],
                        function (err) {
                            if (err) reject(err);
                            else
                                resolve(
                                    new Film(
                                        this.lastID,
                                        film.title,
                                        film.favorite,
                                        film.watchDate,
                                        film.score,
                                        film.userId
                                    )
                                );
                        }
                    );
                }
            });
        });
    }

    this.updateFilm = (film) => {

        const favorite = film.favorite ? film.favorite : false
        const score = (film.score && film.score <= 5 && film.score >= 0) ? film.score : null
        const watchDate = film.watchDate ? film.watchDate.format("YYYY-MM-DD") : null;
        const userId = ("userId" in film && film.userId) ? film.userId : null;

        return new Promise((resolve, reject) => {
            const sql = `SELECT f.id from films f
        WHERE f.id = ? and ? IN(SELECT id FROM users)`;
            db.get(sql, [film.id, film.userId], (err, row) => {
                if (err) reject(err);
                else if (row === undefined)
                    resolve({ error: "Film ID and / or User ID not found, try again!" });
                else {
                    const sql = `UPDATE films SET 
                title = ?, isFavorite = ?,rating = ?, watchDate=?, userId=?
                WHERE id = ?`;
                    // console.log(film.id);
                    db.run(
                        sql,
                        [
                            film.title,
                            favorite,
                            score,
                            watchDate,
                            userId,
                            film.id,
                        ],
                        function (err) {
                            if (err) reject(err);
                            else
                                resolve(
                                    new Film(
                                        film.id,
                                        film.title,
                                        film.favorite,
                                        film.watchDate,
                                        film.score,
                                        film.userId
                                    )
                                );
                        }
                    );
                }
            });
        });
    }

    this.updateRating = (filmId, rating) => {

        return new Promise((resolve, reject) => {
            const sql = `SELECT id FROM films
        WHERE id = ?`;
            db.get(sql, [filmId], (err, row) => {
                if (err) reject(err);
                else if (row === undefined)
                    resolve({ error: "No films found with the given ID!" });
                else {
                    const sql = `UPDATE films SET
                rating = ? WHERE id = ?`;
                    db.run(sql, [rating, filmId], function (err) {
                        if (err) reject(err);
                        else resolve({ id: filmId, score: rating });
                    });
                }
            });
        });
    }

    this.updateIsFavorite = (filmId, isFavorite) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT id FROM films
        WHERE id = ?`;
            db.get(sql, [filmId], (err, row) => {
                if (err) reject(err);
                else if (row === undefined)
                    resolve({ error: "No films found with the given ID!" });
                else {
                    const sql = `UPDATE films SET
                isFavorite = ? WHERE id = ?`;
                    db.run(sql, [isFavorite, filmId], function (err) {
                        if (err) reject(err);
                        else resolve({ id: filmId, isFavorite: isFavorite });
                    });
                }
            });
        });
    }

    this.deleteFilm = (filmId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT id FROM films
        WHERE id = ?`;
            db.get(sql, [filmId], (err, row) => {
                if (err) reject(err);
                else if (row === undefined)
                    resolve({ error: "No films found with the given ID!" });
                else {
                    const sql = `DELETE FROM films WHERE id = ?`;
                    db.run(sql, [filmId], function (err) {
                        if (err) reject(err);
                        else resolve(this.changes);
                    });
                }
            });
        });
    }
}
export function closeDB() {
    db.close();
}
