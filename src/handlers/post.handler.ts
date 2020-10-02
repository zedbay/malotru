import { CommentRessource } from "../models/comment";
import { Post, PostOrm } from "../models/post";

export class PostHandler {

    public static getCommentsInPostHandler(req: any, res: any) {
        PostOrm().getCommentsInPost(req.params.postId).subscribe((comments: CommentRessource[]) => {
            return res.status(200).json({ comments });
        });
    }

}