import { Feed } from "../models/feed";
import { Group, GroupOrm } from "../models/group";
import { User } from "../models/user";
import { Link } from "../orm/models/link";
import { getIdentity, Identity } from "../security/security.util";
import { fieldsArePresent } from "../utils/test";

export class GroupHandler {

    public static listGroupHandler(req: any, res: any) {
        GroupOrm().list().subscribe((groups: Group[]) => {
            return res.status(200).json({ groups });
        });
    }

    public static joinGroupHandler(req: any, res: any) {
        const identity: Identity = getIdentity(req.headers["authorization"]);
        GroupOrm().setMember(req.params.groupId, identity.id).subscribe((link: Link) => {
            return res.status(200).json({ link });
        });
    }

    public static getFeedHandler(req: any, res: any) {
        GroupOrm().getFeed(req.params.groupId).subscribe((feed: Feed) => {
            return res.status(200).json(feed);
        });
    }

    public static getGroupHandler(req: any, res: any) {
        GroupOrm().read(req.params.groupId).subscribe((group: Group) => {
            return res.status(200).json(group);
        });
    }

    public static getGroupMembersHandler(req: any, res: any) {
        GroupOrm().getMembers(req.params.groupId).subscribe((users: User[]) => {
            return res.status(200).json({ users });
        });
    }

    public static createGroupHandler(req: any, res: any) {
        if (!fieldsArePresent(req.body, ['name'])) {
            return res.status(404).json({ error: 'some fields are missing' });
        }
        const identity: Identity = getIdentity(req.headers["authorization"]);
        GroupOrm().createGroup(req.body, identity.id).subscribe((group: Group) => {
            return res.status(200).json(group);
        });
    }
}