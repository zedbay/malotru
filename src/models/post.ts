import { request } from "express";
import { forkJoin, observable, Observable, Subscriber } from "rxjs";
import { map } from "rxjs/operators";
import { getNeo4jInstance } from "../app";
import { Malotru } from "../orm/malotru";
import { OrientationLink } from "../orm/models/link";
import { MalotruRessource } from "../orm/models/ressource";
import { CommentRessource } from "./comment";
import { MalotruLabels } from "./constants/malotru.label";
import { PostRelation } from "./constants/malotru.relation";
import { User } from "./user";

export interface Post extends MalotruRessource {
    content?: string;
    creationDate?: string;
    usersLike?: User[];
    owner?: User;
}

class PostObject extends Malotru.malotruObject<Post> {

    constructor(
        malotruInstance: Malotru
    ) {
        super(
            MalotruLabels.Post,
            malotruInstance,
            [
                PostRelation.Publish,
                PostRelation.Like,
                PostRelation.In
            ]
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
                    linkBetweenPostAndFeed: this.links[PostRelation.In].createLink(
                        createdPost.id,
                        { id: feedId, label: MalotruLabels.Feed },
                        OrientationLink.ToTarget
                    ),
                    linkBetweenUserAndPost: this.links[PostRelation.Publish].createLink(
                        createdPost.id,
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
        return this.links[PostRelation.In].listRatachedNodes(
            postId
        );
    }

    public userLike(userId: number, postId: number): Observable<boolean> {
        return this.links[PostRelation.Like].switchLink(
            postId,
            { id: userId, label: MalotruLabels.User },
            OrientationLink.ToSource
        );
    }

    public delete(postId: number): Observable<boolean> {
        return new Observable((observer: Subscriber<boolean>) => {
            this.links[PostRelation.In].deleteRatachedNodes(
                postId,
                MalotruLabels.Comment
            ).subscribe(() => {
                super.delete(postId).subscribe((isDeleted: boolean) => {
                    observer.next(isDeleted);
                    observer.complete();
                });
            })
        });
    }

    public userIsOwnerOfPost(userId: number, postId: number): Observable<boolean> {
        return this.links[PostRelation.Publish].checkIfLinkExist(
            userId,
            { id: postId, label: this.label }
        );
    }


}

export const PostOrm = PostObject.initUserOrm;

