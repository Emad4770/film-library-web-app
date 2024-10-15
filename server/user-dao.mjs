import db from "./db.mjs";
import crypto from "crypto";

export default class UserDao {

    getUser(username, password) {
        // console.log('user= ', username, 'pass= ', password);

        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE email = ?`;
            db.get(sql, [username], (err, row) => {
                if (err) reject(err);
                else if (row === undefined)
                    resolve({ error: "No user found with the given credentials!" });
                else {
                    // console.log('we are at getuser')
                    const user = { id: row.id, username: row.email, name: row.name };
                    crypto.scrypt(password, row.salt, 32, (err, hashedPassword) => {
                        if (err) reject(err);
                        else {

                            if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword)) {
                                // console.log('we are at getuser 23')

                                resolve(false);

                            }
                            else {
                                // console.log('we are at getuser 29')

                                resolve(user)
                            }
                        }
                    }
                    );
                }
            });
        });
    }
}




