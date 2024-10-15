import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js'

dayjs.extend(utc)

export default function Film(id, title, favorite = false, watchDate = null, score = 0, userId) {

    this.id = id;
    this.title = title;
    this.favorite = favorite;
    // saved as dayjs object only if watchDate is truthy
    this.watchDate = watchDate && dayjs.utc(watchDate);
    this.score = score;
    this.userId = userId;
    this.toString = () => {

        return (`Id: ${this.id}, ` +
            `Title: ${this.title}, ` + `Favorite: ${this.favorite}, ` +
            `Date Watched: ${this.watchDate}, ` + `Rating: ${this.score}, ` +
            `User Id: ${this.userId}`)
    }
}
