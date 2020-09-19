import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { MalotruRessource } from "../orm/models/ressource";
import { Malotru, MalotruObject } from "../orm/malotru";
import { getNeo4jInstance } from "../app";

export class User extends MalotruRessource {
    firstName?: string;
    lastName?: string;
    password?: string;
    email?: string;
}

export enum UserRelation {
    Friend = 'FRIEND',
    FriendRequest = 'FRIENDREQUEST'
}

export const UserLabel = 'User';

class UserRessource extends MalotruObject<User> {

    constructor(public malotruInstance: Malotru) {
        super(UserLabel, malotruInstance);
    }

    public static initUserOrm(): UserRessource {
        return new UserRessource(getNeo4jInstance());
    }

    public checkIfUserExist(email: string, password: string): Observable<User> {
        return this
            .search([
                { fieldName: 'email', value: email },
                { fieldName: 'password', value: password }
            ])
            .pipe(map((res) => {
                if (res.length === 0) {
                    return undefined;
                }
                return res[0];
            }));
    }

    public checkIdEmailIsAlreadyRegister(email: string): Observable<boolean> {
        return this
            .search([
                { fieldName: 'email', value: email }
            ])
            .pipe(map((res) => {
                if (res.length === 0) {
                    return false;
                }
                return true;
            }));
    }


}

export const UserOrm = UserRessource.initUserOrm;