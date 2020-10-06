import { Observable, Subscriber } from "rxjs";
import { getNeo4jInstance } from "../app";
import { Malotru, MalotruObject } from "../orm/malotru";
import { OrientationLink } from "../orm/models/link";
import { MalotruRessource } from "../orm/models/ressource";
import { TargetRessource } from "../orm/models/search";
import { MalotruLabels } from "./constants/malotru.label";
import { FeedRelation, PostRelation } from "./constants/malotru.relation";
import { Post } from "./post";

export interface Feed extends MalotruRessource {
    name?: string;
    posts?: Post[];
}

class FeedObject extends MalotruObject<Feed> {

    constructor(
        public malotruInstance: Malotru
    ) {
        super(
            MalotruLabels.Feed,
            malotruInstance
        )
    }

    public static initUserOrm(): FeedObject {
        return new FeedObject(getNeo4jInstance());
    }

    public readFeedByTarget(target: TargetRessource): Observable<Feed> {
        return new Observable((observer: Subscriber<Feed>) => {
            this.searchFactory.searchNodeByLink(
                target,
                { label: this.label, linkLabel: FeedRelation.Feed }
            ).subscribe((feed: Feed) => {
                this.getPostByFeedId(feed.id).subscribe((posts: Post[]) => {
                    observer.next({
                        ...feed,
                        posts
                    });
                    observer.complete();
                });
            });
        });
    }

    public createFeed(name: string, target: TargetRessource): Observable<Feed> {
        return new Observable((observer: Subscriber<Feed>) => {
            this.create({ name }).subscribe((createdFeed: Feed) => {
                this.linkFactory.createLink(
                    createdFeed.id,
                    FeedRelation.Feed,
                    target,
                    OrientationLink.ToTarget
                ).subscribe(() => {
                    observer.next(createdFeed);
                    observer.complete();
                });
            });
        });
    }

    private getPostByFeedId(feedId: number): Observable<Post[]> {
        return this.searchFactory.searchNodesAndLinkedNodesByTarget(
            { id: feedId, label: this.label },
            { label: MalotruLabels.Post, linkLabel: PostRelation.In, returnName: 'Posts' },
            [
                { linkLabel: PostRelation.Publish, label: MalotruLabels.User, returnName: 'owner' },
                { linkLabel: PostRelation.Like, label: MalotruLabels.User, returnName: 'usersLike' }
            ]
        );
    }

}

export const FeedOrm = FeedObject.initUserOrm;