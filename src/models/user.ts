import { forkJoin, Observable, Subscriber } from "rxjs";
import { map } from "rxjs/operators";
import { MalotruRessource } from "../orm/models/ressource";
import { Malotru } from "../orm/malotru";
import { getNeo4jInstance } from "../app";
import { Link, OrientationLink } from "../orm/models/link";
import { Feed, FeedOrm } from "./feed";
import { GroupRelation, UserRelation } from "./constants/malotru.relation";
import { MalotruLabels } from "./constants/malotru.label";
import { TargetRessource } from "../orm/models/search";
import { Group } from "./group";
import { request } from "express";

export interface User extends MalotruRessource {
    firstName?: string;
    lastName?: string;
    password?: string;
    email?: string;
    feed?: Feed;
    creationDate?: string;
    friends?: User[];
    memberOfGroups?: Group[];
    friendRequests?: User[];
}

class UserRessource extends Malotru.malotruObject<User> {


    constructor(public malotruInstance: Malotru) {
        super(
            MalotruLabels.User,
            malotruInstance,
            [
                UserRelation.FriendRequest,
                UserRelation.Friend,
                UserRelation.Like
            ]
        );
    }

    public static initUserOrm(): UserRessource {
        return new UserRessource(getNeo4jInstance());
    }

    public read(userId: number): Observable<User> {
        return this.searchFactory.searchTargetAndLinkedNodes(
            { label: this.label, id: userId },
            [
                { label: this.label, linkLabel: UserRelation.Friend, returnName: 'friends' },
                { label: MalotruLabels.Group, linkLabel: GroupRelation.Members, returnName: 'memberOfGroups' }
            ]
        );
    }

    public create(user: User): Observable<User> {
        return new Observable((observer: Subscriber<User>) => {
            user.creationDate = (new Date()).toString();
            super.create(user).subscribe((createdUser: User) => {
                FeedOrm().createFeed(
                    `${createdUser.email}_${createdUser.id}`,
                    { id: createdUser.id, label: this.label }
                ).subscribe((feed: Feed) => {
                    createdUser.feed = feed;
                    observer.next(createdUser);
                    observer.complete();
                });
            });
        });
    }

    public handleFriendRequest(userId: number, userTargetId: number, response: boolean) {
        const target: TargetRessource = {
            label: this.label,
            id: userTargetId
        };
        let requests: Observable<any>[] = [
            this.links[UserRelation.FriendRequest].deleteLink(
                userId,
                target
            )
        ]
        if (response) {
            request.push(
                this.links[UserRelation.FriendRequest].createLink(
                    userId,
                    target,
                    OrientationLink.ToTarget
                )
            )
        }
        return forkJoin(requests);
    }

    public getFriendRequest(userId: number) {
        return this.links[UserRelation.FriendRequest].listRatachedNodes(
            userId, OrientationLink.ToSource
        )
    }

    public getMyFriendRequest(userId: number) {
        return this.links[UserRelation.FriendRequest].listRatachedNodes(
            userId, OrientationLink.ToTarget
        )
    }

    public getUserFeed(userId: number): Observable<Feed> {
        return FeedOrm().readFeedByTarget({ id: userId, label: this.label });
    }

    public createFriendship(userId: number, userTargetId: number): Observable<Link> {
        return this.links[UserRelation.FriendRequest].createLink(
            userId,
            { label: this.label, id: userTargetId },
            OrientationLink.ToTarget
        );
    }

    public checkIfUserExist(email: string, password: string): Observable<User> {
        return this
            .searchFactory.search([
                { fieldName: 'email', value: email },
                { fieldName: 'password', value: password }
            ], this.label)
            .pipe(map((res) => res.length === 0 ? undefined : res[0]));
    }

    public checkIdEmailIsAlreadyRegister(email: string): Observable<boolean> {
        return this
            .searchFactory.search([
                { fieldName: 'email', value: email }
            ], this.label)
            .pipe(map((res) => res.length === 0 ? false : true));
    }


}

export const UserOrm = UserRessource.initUserOrm;