import { useAtom, atom } from "jotai";

// states can be created using atom API
export const phoneNumberAtom = atom('')

// pass the above atom variable to the `useAtom` hook to read and 
// mutate its values
