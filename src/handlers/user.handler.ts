import { CommentOrm, CommentRessource } from "../models/comment";
import { Feed } from "../models/feed";
import { Post, PostOrm } from "../models/post";
import { User, UserOrm } from "../models/user";
import { getIdentity, Identity } from "../security/security.util";
import { fieldsArePresent } from "../utils/test";

export class UserHandler {

    public static createUserHandler(req: any, res: any) {
        if (!fieldsArePresent(req.body, ['email', 'password'])) {
            return res.status(404).json({ error: 'some fields are missing' });
        }
        UserOrm().checkIdEmailIsAlreadyRegister(req.body.email).subscribe((emailIsAlreadyRegister: boolean) => {
            if (emailIsAlreadyRegister) {
                return res.status(200).json({ error: 'email is already use' });
            }
            UserOrm().create(req.body).subscribe((user: User) => {
                return res.status(200).json(user);
            });
        });
    }

    public static deletePostHandler(req: any, res: any) {
        const identity: Identity = getIdentity(req.headers["authorization"]);
        PostOrm().userIsOwnerOfPost(identity.id, req.params.postId).subscribe((isOwner: boolean) => {
            if (isOwner) {
                PostOrm().delete(req.params.postId).subscribe((isDeleted: boolean) => {
                    if (isDeleted) {
                        return res.status(200).json();
                    } else {
                        return res.status(500).json();
                    }
                })
            } else {
                return res.status(401).json();
            }
        });
    }

    public static deleteCommentHandler(req: any, res: any) {
        const identity: Identity = getIdentity(req.headers["authorization"]);
        CommentOrm().userIsOwnerOfComment(identity.id, req.params.commentId).subscribe((isOwner: boolean) => {
            if (isOwner) {
                CommentOrm().delete(req.params.commentId).subscribe((isDeleted: boolean) => {
                    if (isDeleted) {
                        return res.status(200).json();
                    } else {
                        return res.status(500).json();
                    }
                })
            } else {
                return res.status(401).json();
            }
        });
    }

    public static getUserFeedHandler(req: any, res: any) {
        UserOrm().getUserFeed(req.params.userId).subscribe((feed: Feed) => {
            return res.status(200).json(feed);
        });
    }

    public static comment(req: any, res: any) {
        const identity: Identity = getIdentity(req.headers["authorization"]);
        if (!fieldsArePresent(req.body, ['content'])) {
            return res.status(404).json({ error: 'some fields are missing' });
        }
        CommentOrm().createComment(req.body, req.params.postId, identity.id).subscribe((comment: CommentRessource) => {
            return res.status(200).json(comment);
        });
    }

    public static likePost(req: any, res: any) {
        const identity: Identity = getIdentity(req.headers["authorization"]);
        PostOrm().userLike(identity.id, req.params.postId).subscribe((isLiked: boolean) => {
            return res.status(200).json({ isLiked });
        })
    }

    public static post(req: any, res: any) {
        const identity: Identity = getIdentity(req.headers["authorization"]);
        if (!fieldsArePresent(req.body, ['content'])) {
            return res.status(404).json({ error: 'some fields are missing' });
        }
        PostOrm().createPost(req.body, req.params.feedId, identity.id).subscribe((post: Post) => {
            return res.status(200).json(post);
        });
    }

    public static whoami(req: any, res: any) {
        const identity: Identity = getIdentity(req.headers["authorization"]);
        UserOrm().read(identity.id).subscribe((user: User) => {
            return res.status(200).json(user);
        });
    }

    public static updateUserHandler(req: any, res: any) {
        UserOrm().update(req.body).subscribe((user: User) => {
            return res.status(200).json(user);
        });
    }

    public static listUserHandler(req: any, res: any) {
        UserOrm().list().subscribe((users: User[]) => {
            return res.status(200).json({ users });
        });
    }

    public static readUserHandler(req: any, res: any) {
        UserOrm().read(req.params.userId).subscribe((user: User) => {
            return res.status(200).json(user);
        });
    }

    public static deleteUserHandler(req: any, res: any) {
        UserOrm().delete(req.params.userId).subscribe((isDeleted: boolean) => {
            if (isDeleted) {
                return res.status(200).json();
            } else {
                return res.status(500).json();
            }
        });
    }

}