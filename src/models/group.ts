import { forkJoin, Observable, Subscriber } from "rxjs";
import { getNeo4jInstance } from "../app";
import { Malotru } from "../orm/malotru";
import { Link, OrientationLink } from "../orm/models/link";
import { MalotruRessource } from "../orm/models/ressource";
import { Feed, FeedOrm } from "./feed";
import { GroupRelation } from "./constants/malotru.relation";
import { User } from "./user";
import { MalotruLabels } from "./constants/malotru.label";

export interface Group extends MalotruRessource {
    name: string;
    member: number;
    owner?: User;
    membres?: User[];
}

class GroupRessource extends Malotru.malotruObject<Group> {

    constructor(public malotruInstance: Malotru) {
        super(
            MalotruLabels.Group,
            malotruInstance,
            [
                GroupRelation.Members,
                GroupRelation.Owner
            ]
        );
    }

    public static initUserOrm(): GroupRessource {
        return new GroupRessource(getNeo4jInstance());
    }

    public read(groupId: number): Observable<Group> {
        return this.searchFactory.searchTargetAndLinkedNodes<Group>(
            { label: this.label, id: groupId },
            [
                { label: MalotruLabels.User, linkLabel: GroupRelation.Owner, returnName: 'owner' },
                { label: MalotruLabels.User, linkLabel: GroupRelation.Members, returnName: 'members' }
            ]
        );
    }

    public getFeed(groupId: number): Observable<Feed> {
        return FeedOrm().readFeedByTarget({ id: groupId, label: this.label });
    }

    public setMember(groupId: number, userId: number): Observable<Link> {
        return this.links[GroupRelation.Members].createLink(
            groupId,
            { label: MalotruLabels.User, id: userId },
            OrientationLink.ToSource
        )
    }

    public setOwner(groupId: number, userId: number): Observable<Link> {
        return this.links[GroupRelation.Owner].createLink(
            groupId,
            { label: MalotruLabels.User, id: userId },
            OrientationLink.ToTarget
        )
    }

    public createGroup(group: Group, userId: number): Observable<Group> {
        return new Observable((observer: Subscriber<Group>) => {
            super.create(group).subscribe((createdGroup: Group) => {
                const requests: Observable<any>[] = [
                    this.setOwner(createdGroup.id, userId),
                    this.setMember(createdGroup.id, userId),
                    FeedOrm().createFeed(
                        `${createdGroup.name}_${createdGroup.id}`,
                        { id: createdGroup.id, label: this.label }
                    )
                ];
                forkJoin(requests).subscribe(() => {
                    observer.next(createdGroup);
                    observer.complete();
                });
            });
        });
    }

}

export const GroupOrm = GroupRessource.initUserOrm;