class Params {
    get(key: string): string | null {
        return (new URLSearchParams(window.location.search)).get(key);
    }
}

export default new Params();