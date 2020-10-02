import { forkJoin, Observable, Subscriber } from "rxjs";
import { map } from "rxjs/operators";
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

    public read(feedId: number): Observable<Feed> {
        return forkJoin({
            feed: super.read(feedId),
            posts: this.getPostByFeedId(feedId)
        }).pipe(map((res) => {
            return {
                ...res.feed,
                posts: res.posts
            }
        }));
    }

    public readFeedByTarget(target: TargetRessource): Observable<Feed> {
        return new Observable((observer: Subscriber<Feed>) => {
            this.searchFactory.searchNodeByLink(
                { id: target.id, label: target.label },
                this.label,
                FeedRelation.Feed
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
        return this.searchFactory.searchRatachedNodesByLink(
            feedId,
            PostRelation.In
        );
    }

}

export const FeedOrm = FeedObject.initUserOrm;