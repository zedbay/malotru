import { forkJoin, observable, Observable, Subscriber } from "rxjs";
import { map } from "rxjs/operators";
import { getNeo4jInstance } from "../app";
import { Malotru, MalotruObject } from "../orm/malotru";
import { OrientationLink } from "../orm/models/link";
import { MalotruRessource } from "../orm/models/ressource";
import { CommentRessource } from "./comment";
import { MalotruLabels } from "./constants/malotru.label";
import { PostRelation } from "./constants/malotru.relation";

export interface Post extends MalotruRessource {
    content?: string;
    creationDate?: string;
    usersLike?: number;
}

class PostObject extends MalotruObject<Post> {

    constructor(
        malotruInstance: Malotru
    ) {
        super(
            MalotruLabels.Post,
            malotruInstance
        );
    }

    public static initUserOrm(): PostObject {
        return new PostObject(getNeo4jInstance());
    }

    public createPost(post: Post, feedId: number, userId: number): Observable<Post> {
        return new Observable((observer: Subscriber<Post>) => {
            post.creationDate = (new Date()).toString();
            super.create(post).subscribe((createdPost: Post) => {
                forkJoin({
                    linkBetweenPostAndFeed: this.linkFactory.createLink(
                        createdPost.id,
                        PostRelation.In,
                        { id: feedId, label: MalotruLabels.Feed },
                        OrientationLink.ToTarget
                    ),
                    linkBetweenUserAndPost: this.linkFactory.createLink(
                        createdPost.id,
                        PostRelation.Publish,
                        { id: userId, label: MalotruLabels.User },
                        OrientationLink.ToSource
                    )
                }).subscribe(() => {
                    observer.next(createdPost);
                    observer.complete();
                });
            });
        });
    }

    public getCommentsInPost(postId: number): Observable<CommentRessource[]> {
        return this.searchFactory.searchRatachedNodesByLink(
            postId,
            PostRelation.In
        );
    }

    public userLike(userId: number, postId: number): Observable<boolean> {
        return new Observable((observer: Subscriber<boolean>) => {
            this.checkIfUserLikePost(userId, postId).subscribe((exist: boolean) => {
                if (exist) {
                    this.linkFactory.deleteLink(
                        postId,
                        PostRelation.Like,
                        { id: userId, label: MalotruLabels.User }
                    ).subscribe(() => {
                        observer.next(!exist);
                        observer.complete();
                    });
                } else {
                    this.linkFactory.createLink(
                        postId,
                        PostRelation.Like,
                        { id: userId, label: MalotruLabels.User },
                        OrientationLink.ToSource
                    ).subscribe(() => {
                        observer.next(!exist);
                        observer.complete();
                    });
                }
            });
        })
    }

    public delete(postId: number): Observable<boolean> {
        return new Observable((observer: Subscriber<boolean>) => {
            this.linkFactory.deleteNodeByLinkRelation(
                MalotruLabels.Comment,
                { id: postId, label: MalotruLabels.Post },
                PostRelation.In
            ).subscribe(() => {
                super.delete(postId).subscribe((isDeleted: boolean) => {
                    observer.next(isDeleted);
                    observer.complete();
                });
            })
        });
    }

    public userIsOwnerOfPost(userId: number, postId: number): Observable<boolean> {
        return this.linkFactory
            .checkIfLinkExist(
                { id: userId, label: MalotruLabels.User },
                { id: postId, label: this.label },
                PostRelation.Publish
            )
            .pipe((map((res) => {
                return res !== undefined;
            })));
    }

    private checkIfUserLikePost(userId: number, postId: number): Observable<boolean> {
        return this.linkFactory.checkIfLinkExist(
            { id: userId, label: MalotruLabels.User },
            { id: postId, label: MalotruLabels.Post },
            PostRelation.Like
        ).pipe(map((res) => {
            return res !== undefined;
        }))
    }


}

export const PostOrm = PostObject.initUserOrm;

