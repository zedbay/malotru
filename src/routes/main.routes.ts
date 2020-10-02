import { Router, Express } from "express";
import { loginHandler } from "../security/login.handler";
import { FriendshipRouter } from "./friendship.routes";
import { GroupRouter } from "./group.routes";
import { PostRouter } from "./post.routes";
import { UserRoutes } from "./user.routes";

export class MainRouter {

    constructor(express: Express) {
        const router: Router = Router();
        router.get('/isAlive', (lreq, res) => {
            res.status(200).json({ isAlive: true });
        });
        router.post('/login', loginHandler);
        express.use("/", router);
        UserRoutes.init(express);
        FriendshipRouter.init(express);
        GroupRouter.init(express);
        PostRouter.init(express);
    }

}