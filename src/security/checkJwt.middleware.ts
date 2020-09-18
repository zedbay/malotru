import { NextFunction } from "express";
import * as config from '../../config.json';
import * as jwt from 'jsonwebtoken';

export const checkJwt = (req, res, next: NextFunction) => {
    if (config["security"]["unsecure"]) {
        next();
    }
    const token = <string>req.headers["authorization"];
    try {
        <any>jwt.verify(token, config["security"]["tokenKey"]);
    } catch (error) {
        res.status(401).send();
        return;
    }
    next();
}