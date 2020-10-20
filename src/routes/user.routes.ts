import { Router, Express } from "express";
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
        router.get('/user/feed/:userId', UserHandler.getUserFeedHandler);
        router.get('/user/:userId', UserHandler.readUserHandler);
        router.put('/user', UserHandler.updateUserHandler);
        router.get('/user', UserHandler.listUserHandler);

    }

    private static mountPrivateRoute(router: Router) {
        router.get('/whoami', checkJwt, UserHandler.whoami);
        router.delete('/user/:userId', checkJwt, UserHandler.deleteUserHandler);
        router.post('/user/comment/:postId', checkJwt, UserHandler.comment);
        router.delete('/user/comment/:commentId', checkJwt, UserHandler.deleteCommentHandler);

        // POST
        router.delete('/user/post/:postId', checkJwt, UserHandler.deletePostHandler);
        router.put('/user/like/:postId', checkJwt, UserHandler.likePost);
        router.post('/user/post/:feedId', checkJwt, UserHandler.post);
    }


}