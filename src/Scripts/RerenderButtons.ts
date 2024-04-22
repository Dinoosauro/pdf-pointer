const map = new Map<string, React.Dispatch<React.SetStateAction<boolean>>>([]);
export default {
    /**
     * Store the current state of the toolbar button, so that it can be called later
     * @param state the callback that'll permit to update the state of this button
     * @param id the identifier of what that button does
     */
    set: (state: React.Dispatch<React.SetStateAction<boolean>>, id: string) => {
        map.set(id, state);
    },
    /**
     * Change the state of a circular button (setting it enabled or disabled)
     * @param id the identifier of the button to change
     * @param force the new value of the state. If undefined, the opposite of the current value will be used.
     */
    update: (id: string, force?: boolean) => {
        const item = map.get(id);
        console.log(id, item);
        item && item(prevState => force ?? !prevState);
    }
}