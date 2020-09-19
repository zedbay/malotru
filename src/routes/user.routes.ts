import { Router, Express } from "express";
import { FriendshipHandler } from "../handlers/friendship.handler";
import { UserHandler } from "../handlers/user.handler";
import { checkJwt } from "../security/checkJwt.middleware";

export class UserRoutes {

    public static init(express: Express) {
        const router: Router = Router();
        UserRoutes.mountPrivateRoute(router);
        UserRoutes.mountPublicRoutes(router);
        express.use('/', router);
    }

    private static mountPublicRoutes(router: Router) {
        router.post('/user', UserHandler.createUserHandler);
        router.get('/user/:userId', UserHandler.readUserHandler);
        router.put('/user', UserHandler.updateUserHandler);
        router.get('/user', UserHandler.listUserHandler);
    }

    private static mountPrivateRoute(router: Router) {
        router.get('/whoami', checkJwt, UserHandler.whoami);
        router.get('/user/friendList', checkJwt, FriendshipHandler.getFriendListRequest);
        router.delete('/user/:userId', checkJwt, UserHandler.deleteUserHandler);
    }


}