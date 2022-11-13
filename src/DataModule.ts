import { audioFeatures, cancel } from './Constants';
import { forEachFeature } from './ForEachHelper';
import { Track } from './Models/Track';
import { SpotifyAPI } from './SpotifyAPI';
let isInitialized = false;
let spotify: SpotifyAPI;

function Initialize(SpotifyAPI: SpotifyAPI) {
    spotify= SpotifyAPI;
    isInitialized = true;
}

async function getPlaylistInfo(id: string): Promise<Track[]> {
    if (!isInitialized) console.log('%c WARNING: No initialization done yet.', 'color: red');
    console.log(id);

    let trackList: Track[] = []

    //@ts-ignore
    let playlist: any = (await spotify.getPlaylist(id)).tracks

    while(true) {
        //@ts-ignore
        if(cancel) break;
        console.log(playlist)
        const itemBatch = playlist.items;
        const offset = playlist.offset
        const total = playlist.total;
        console.log(`Peforming analysis. (offset: ${offset}, total: ${total}, batchCount: ${itemBatch.length})`)
        await processPlaylistFeatures(itemBatch, offset, total, trackList);

        if(!playlist.next) {
            break;
        } else {
            playlist = await spotify.next(playlist.next);
        }
        
    }
    return trackList;
}

async function processPlaylistFeatures(items: any, currentOffset: number, total: number, tracks: Array<Track>): Promise<void> {
    if (!isInitialized) console.log('%c WARNING: No initialization done yet.', 'color: red');
    for(let i = 0; i < items.length; i++) {
        $('#status').text(`Getting audio features (${currentOffset+i+1}/${total})`);
        const current = items[i].track;
        const features: any = await spotify.audioFeatures(current.id);
        let track: Track = new Track(items[i].track.name, items[i].track.artists[0].name);

        audioFeatures.forEach(feature => {
            //@ts-ignore
            track[feature] = features[feature];
        })
        track.id = current.id;

        tracks.push(track)

        if(cancel) break;
    }
}

export {
    Initialize,
    getPlaylistInfo
}