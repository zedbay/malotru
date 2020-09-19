import { User, UserOrm } from "../models/user";
import { getIdentity, Identity } from "../security/security.util";
import { fieldsArePresent } from "../utils/test";

export class UserHandler {

    public static createUserHandler(req: any, res: any) {
        if (!fieldsArePresent(req.body, ['email', 'password'])) {
            return res.status(404).json({ error: 'some fields are missing' });
        }
        UserOrm().checkIdEmailIsAlreadyRegister(req.body.email).subscribe((emailIsAlreadyRegister: boolean) => {
            if (emailIsAlreadyRegister) {
                return res.status(200).json({ error: 'email is already use' });
            }
            UserOrm().create(req.body).subscribe((user: User) => {
                return res.status(200).json(user);
            });
        });
    }

    public static whoami(req: any, res: any) {
        const identity: Identity = getIdentity(req.headers["authorization"]);
        UserOrm().read(identity.id).subscribe((user: User) => {
            return res.status(200).json(user);
        });
    }

    public static updateUserHandler(req: any, res: any) {
        UserOrm().update(req.body).subscribe((user: User) => {
            return res.status(200).json(user);
        });
    }

    public static listUserHandler(req: any, res: any) {
        UserOrm().list().subscribe((users: User[]) => {
            return res.status(200).json({ users });
        });
    }

    public static readUserHandler(req: any, res: any) {
        UserOrm().read(req.params.userId).subscribe((user: User) => {
            return res.status(200).json(user);
        });
    }

    public static deleteUserHandler(req: any, res: any) {
        UserOrm().delete(req.params.userId).subscribe(() => {
            return res.status(200).json();
        });
    }

}