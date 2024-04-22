const map = new Map<string, React.Dispatch<React.SetStateAction<boolean>>>([]);
export default {
    set: (state: React.Dispatch<React.SetStateAction<boolean>>, id: string) => {
        map.set(id, state);
    },
    update: (id: string, force?: boolean) => {
        const item = map.get(id);
        console.log(id, item);
        item && item(prevState => force ?? !prevState);
    }
}