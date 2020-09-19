import { User, UserOrm } from "../models/user";
import { getIdentity, Identity } from "../security/security.util";
import { fieldsArePresent } from "../utils/test";
import { Link } from "../orm/models/link";

export class FriendshipHandler {

    public static createFriendshipRequest(req: any, res: any) {
        const identity: Identity = getIdentity(req.headers["authorization"]);
        UserOrm().createFriendship(identity.id, req.params.userTargetId).subscribe((link: Link) => {
            return res.status(200).json(link);
        });
    }

    public static handleFriendRequest(req: any, res: any) {
        if (!fieldsArePresent(req.body, ['response'])) {
            return res.status(404).json({ error: 'some fields are missing' });
        }
        const identity: Identity = getIdentity(req.headers["authorization"]);
        UserOrm().handleFriendRequest(identity.id, req.params.userTargetId, req.body.response).subscribe(() => {
            return res.status(200).json();
        })

    }

    public static getFriendRequest(req: any, res: any) {
        const identity: Identity = getIdentity(req.headers["authorization"]);
        UserOrm().getFriendRequest(identity.id).subscribe((users: User[]) => {
            return res.status(200).json({ users });
        });
    }

    public static getFriendListRequest(req: any, res: any) {
        const identity: Identity = getIdentity(req.headers["authorization"]);
        UserOrm().getFriendList(identity.id).subscribe((users: User[]) => {
            return res.status(200).json({ users });
        });
    }

}