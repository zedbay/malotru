import { forkJoin, Observable, Subscriber } from "rxjs";
import { map } from "rxjs/operators";
import { getNeo4jInstance } from "../app";
import { Malotru } from "../orm/malotru";
import { OrientationLink } from "../orm/models/link";
import { MalotruRessource } from "../orm/models/ressource";
import { MalotruLabels } from "./constants/malotru.label";
import { CommentRelation } from "./constants/malotru.relation";

export interface CommentRessource extends MalotruRessource {
    content?: string;
    creationDate?: string;
}

class CommentObject extends Malotru.malotruObject<CommentRessource> {

    constructor(
        malotruInstance: Malotru
    ) {
        super(
            MalotruLabels.Comment,
            malotruInstance,
            [
                CommentRelation.In,
                CommentRelation.Publish
            ]
        );
    }

    public static initCommentOrm(): CommentObject {
        return new CommentObject(getNeo4jInstance());
    }

    public createComment(comment: CommentRessource, postId: number, userId: number): Observable<CommentRessource> {
        return new Observable((observer: Subscriber<CommentRessource>) => {
            comment.creationDate = (new Date()).toString();
            super.create(comment).subscribe((createdComment: CommentRessource) => {
                forkJoin({
                    linkBetweenCommentAndPost: this.links[CommentRelation.In].createLink(
                        createdComment.id,
                        { id: postId, label: MalotruLabels.Post },
                        OrientationLink.ToTarget
                    ),
                    linkBetweenUserAndComment: this.links[CommentRelation.Publish].createLink(
                        createdComment.id,
                        { id: userId, label: MalotruLabels.User },
                        OrientationLink.ToSource
                    )
                }).subscribe(() => {
                    observer.next(createdComment);
                    observer.complete();
                });
            });
        });
    }

    public userIsOwnerOfComment(userId: number, commentId: number): Observable<boolean> {
        return this.searchFactory
            .checkIfLinkExist(
                { id: userId, label: MalotruLabels.User },
                { id: commentId, label: this.label },
                CommentRelation.Publish
            )
            .pipe((map((res) => {
                return res !== undefined;
            })));
    }

}

export const CommentOrm = CommentObject.initCommentOrm;