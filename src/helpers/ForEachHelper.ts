import { audioFeatures } from "./Constants";

function forEachFeature(fn: Function, option1?: any, option2?: any) {
    audioFeatures.forEach(feature => fn(feature, option1, option2));
}

export {
    forEachFeature
}