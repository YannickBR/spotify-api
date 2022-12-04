import { AudioFeatures } from "../models/AudioFeatures";
import { Database } from '../models/database/Database';

const audioFeatures: string[] = Object.keys(AudioFeatures).filter((v) => isNaN(Number(v)));
let cancel: boolean = false;
let databaseEntity: Database = new Database();

export {
    audioFeatures,
    cancel,
    setCancel,
    db
};

function db() { return databaseEntity; }


function setCancel(value: boolean) {
    cancel = value;
}
