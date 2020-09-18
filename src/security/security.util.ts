import * as jwt from 'jsonwebtoken';

export interface Identity {
    id: number;
    email: string;
}

export const getIdentity = (token): Identity => {
    const tokenDecode = jwt.decode(token);
    return {
        id: tokenDecode['id'],
        email: tokenDecode['email']
    };
}