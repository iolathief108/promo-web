export function makeId(length: number, symbols: boolean = false): string {
    let result = '';
    // noinspection SpellCheckingInspection
    let characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    characters = symbols ? characters + '.~*@,-_' : characters;

    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }
    return result;
}

export function makePin(length: number): number {
    let result = '';
    // noinspection SpellCheckingInspection
    let characters = '0123456789';
    for (let i = 0; i < length; i++) {
        const chars = i === 0 ? '123456789' : characters;
        result += chars.charAt(
            Math.floor(Math.random() * chars.length),
        );
    }
    return Number(result);
}
