import { User, UserOrm } from "../models/user";
import * as jwt from 'jsonwebtoken';
import * as config from '../../config.json';

export const loginHandler = (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(404).json({ error: 'some fields are missing' });
    }
    UserOrm().checkIfUserExist(req.body.email, req.body.password).subscribe((user: User) => {
        if (user === undefined) {
            return res.status(401).json({ error: 'Unknow user' });
        }
        const token = jwt.sign(
            {
                email: user.email,
                id: user.id
            },
            config["security"]["tokenKey"],
            { expiresIn: "1h" }
        );
        return res.status(200).json({ token });
    });

}