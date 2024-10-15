
const URL = 'http://localhost:3000/api/';

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");


export default class API {



    async loadFilms(filter) {

        try {
            const query = filter ? `?filter=${filter}` : '';
            const response = await fetch(`${URL}films${query}`);
            if (!response.ok) {
                throw Error(response.statusText);
            }
            let type = response.headers.get('content-type').split(';')[0].trim();
            if (type !== 'application/json') {
                throw new TypeError(`Expected JSON, got ${type}`);
            }
            const films = await response.json();
            return films;

        } catch (error) {
            console.error(error);
        }
    };

    async saveFilm(film) {
        try {
            const response = await fetch(`${URL}films`, {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify({
                    title: film.title,
                    favorite: film.favorite,
                    watchDate: film.watchDate ? film.watchDate : null,
                    rating: film.score,
                    userId: 1
                })
            })

            if (!response.ok) {
                throw Error(response.statusText)
            }
            let type = response.headers.get('content-type').split(';')[0].trim();
            if (type !== 'application/json') {
                throw new TypeError(`Expected JSON, got ${type}`);
            }
            const newFilm = await response.json();
            console.log(newFilm);

            return newFilm;
        } catch (err) {
            console.error(err)
        }
    }

    async updateFilm(film) {
        try {
            const response = await fetch(`${URL}films/${film.id}`, {
                method: "PUT",
                headers: myHeaders,
                body: JSON.stringify({
                    title: film.title,
                    favorite: film.favorite,
                    watchDate: film.watchDate ? film.watchDate : null,
                    rating: film.score,
                    userId: 1
                })
            })

            if (!response.ok) {
                throw Error(response.statusText)
            }
            let type = response.headers.get('content-type').split(';')[0].trim();
            if (type !== 'application/json') {
                throw new TypeError(`Expected JSON, got ${type}`);
            }
            const updatedFilm = await response.json();

            return updatedFilm;
        } catch (err) {
            console.error(err)
        }
    }

    async deleteFilm(id) {
        try {
            const response = await fetch(`${URL}films/${id}`, {
                method: "DELETE",
            })
            if (!response.ok) {
                throw new Error("in deleteFilm: invalid response code: " + response.statusText)
            }
        } catch (err) {
            throw new Error("In deleteFilm: " + err);
        }
    }

}

