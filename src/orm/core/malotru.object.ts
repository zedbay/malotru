import { Malotru } from "../malotru";
import { MalotruRessource } from "../models/ressource";
import { MalotruLink } from "./malotru.link";
import { RessourceCrud } from "./temp/ressource.crud";
import { SearchFactory } from "./temp/search.factory";

export abstract class MalotruObject<T extends MalotruRessource> extends RessourceCrud<T> {

    public searchFactory: SearchFactory;

    public links: { [linkLabel: string]: MalotruLink } = {};

    constructor(
        protected label: string,
        protected malotruInstance: Malotru,
        protected linkLabels: string[] = []
    ) {
        super(
            label,
            malotruInstance
        );

        this.searchFactory = new SearchFactory(malotruInstance);

        this.linkLabels.forEach((linkLabel: string) => {
            this.links[linkLabel] = new MalotruLink(
                malotruInstance,
                linkLabel,
                label
            );
        });
    }

}