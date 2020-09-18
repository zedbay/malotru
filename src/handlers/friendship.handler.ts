import { request } from "express";
import { Observable } from "rxjs";
import { User, UserLabel, UserOrm, UserRelation } from "../models/user";
import { Orientation } from "../orm/models/orientation";
import { Target } from "../orm/models/target";
import { getIdentity, Identity } from "../security/security.util";
import { fieldsArePresent } from "../utils/test";
import { concatMap } from 'rxjs/operators';
import { from } from 'rxjs';

export class FriendshipHandler {

    public static createFriendshipRequest(req: any, res: any) {
        const identity: Identity = getIdentity(req.headers["authorization"]);
        UserOrm().linkFactory.createLink(
            identity.id,
            UserRelation.FriendRequest,
            { label: UserLabel, id: req.params.userTargetId }
        ).subscribe((response) => {
            return res.status(200).json(response);
        });
    }

    public static handleFriendRequest(req: any, res: any) {
        if (!fieldsArePresent(req.body, ['response'])) {
            return res.status(404).json({ error: 'some fields are missing' });
        }
        const identity: Identity = getIdentity(req.headers["authorization"]);
        const target: Target = {
            label: UserLabel,
            id: req.params.userTargetId
        };
        const requests: Observable<any>[] = [
            UserOrm().linkFactory.deleteLink(
                identity.id,
                UserRelation.FriendRequest,
                target
            ),
            UserOrm().linkFactory.createLink(
                identity.id,
                UserRelation.Friend,
                target
            )
        ]
        from(requests).pipe(
            concatMap(request => request)
        ).subscribe(() => {
            return res.status(200).json();
        })

    }

    public static getFriendRequest(req: any, res: any) {
        const identity: Identity = getIdentity(req.headers["authorization"]);
        UserOrm().linkFactory.listLinkTarget(
            identity.id,
            UserRelation.FriendRequest,
            Orientation.ToSource
        ).subscribe((users: User[]) => {
            return res.status(200).json({ users });
        });
    }

    public static getFriendList(req: any, res: any) {
        const identity: Identity = getIdentity(req.headers["authorization"]);
        UserOrm().linkFactory.listLinkTarget(
            identity.id,
            UserRelation.Friend
        ).subscribe((users: User[]) => {
            return res.status(200).json({ users });
        });
    }

}