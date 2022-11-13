import { AudioFeatures } from "./Models/AudioFeatures";

const audioFeatures: string[] = Object.keys(AudioFeatures).filter((v) => isNaN(Number(v)));
let cancel: boolean = false;
export {
    audioFeatures,
    cancel,
    setCancel
};


function setCancel(value: boolean) {
    cancel = value;
}
