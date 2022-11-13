
import { ApiCommunicator } from './ApiCommunicator';
import endpoints from './config/endpoints.json'

export class SpotifyAPI {
    api: ApiCommunicator

    constructor(api: ApiCommunicator) {
        this.api = api;
    }

    async current() {
        return await this.api.request(endpoints.player.current);
    }

    async audioFeatures(id: string) {
        return await this.api.request(endpoints.track.info, id);
    }

    async getPlaylist(id: string) {
        return await this.api.request(endpoints.playlists.info, id)
    }

    async queueSong(id: string) {
        return await this.api.requestObject(endpoints.player.queue, {
            uri: "spotify:track:"+ id,
            device_id: this.api.deviceId,
        })
    }

    async next(url: string) {
        return await this.api.request({
            url: url,
            method: "GET"
        })
    }

    async devices() {
        return await this.api.request(endpoints.player.devices)
    }
}