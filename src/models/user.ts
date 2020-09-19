import { from, Observable } from "rxjs";
import { concatMap, map } from "rxjs/operators";
import { MalotruRessource } from "../orm/models/ressource";
import { Malotru, MalotruObject } from "../orm/malotru";
import { getNeo4jInstance } from "../app";
import { Link, OrientationLink, TargetLink } from "../orm/models/link";

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

    public handleFriendRequest(userId: number, userTargetId: number, response: boolean) {
        const target: TargetLink = {
            label: this.label,
            id: userTargetId
        };
        const requests: Observable<any>[] = [
            UserOrm().linkFactory.deleteLink(
                userId,
                UserRelation.FriendRequest,
                target
            ),
            UserOrm().linkFactory.createLink(
                userId,
                UserRelation.Friend,
                target,
                OrientationLink.ToTarget
            )
        ]
        return from(requests).pipe(
            concatMap(request => request)
        );
    }

    public getFriendList(userId: number) {
        return this.linkFactory.listLinkTarget(
            userId,
            UserRelation.Friend
        );
    }

    public getFriendRequest(userId: number) {
        return this.linkFactory.listLinkTarget(
            userId,
            UserRelation.FriendRequest,
            OrientationLink.ToSource
        );
    }

    public createFriendship(userId: number, userTargetId: number): Observable<Link> {
        return this.linkFactory.createLink(
            userId,
            UserRelation.FriendRequest,
            { label: this.label, id: userTargetId },
            OrientationLink.ToTarget
        )
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