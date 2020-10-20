import { expect } from 'chai';
import 'mocha';
import { app } from '../app';
import { User, UserOrm } from '../models/user';

describe('Authentification tests', () => {

    before(function (done) {
        app.express.on('dbConnected', () => {
            done();
        });
    });

    it('Search user should return user', () => {
        let userToFind: User;
        UserOrm().checkIfUserExist('antoineheurtault75@protonmail.com', 'a').subscribe(
            (user: User) => userToFind = user,
            (error) => console.error(error),
            () => expect(userToFind).not.equal(undefined)
        );
    });

    it('Search user should return undefind', () => {
        let userToFind: User;
        UserOrm().checkIfUserExist('a', 'a').subscribe(
            (user: User) => userToFind = user,
            (error) => console.error(error),
            () => expect(userToFind).equal(undefined)
        )
    });

    it('Search user by email should return true', () => {
        let userIsFound: boolean;
        UserOrm().checkIdEmailIsAlreadyRegister('antoineheurtault75@protonmail.com').subscribe(
            (found: boolean) => userIsFound = found,
            (error) => console.error(error),
            () => expect(userIsFound).equal(true)
        )
    });

    it('Search user by email should return false', () => {
        let userIsFound: boolean;
        UserOrm().checkIdEmailIsAlreadyRegister('a').subscribe(
            (found: boolean) => userIsFound = found,
            (error) => console.error(error),
            () => expect(userIsFound).equal(false)
        )
    });

});