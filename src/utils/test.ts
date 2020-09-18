export function fieldsArePresent(object: any, keys: string[]): boolean {
    let fielsdArePresentBoolean = true;
    keys.forEach((key: string) => {
        if (object[key] === undefined) {
            return fielsdArePresentBoolean = false;
        }
    });
    return fielsdArePresentBoolean;
}