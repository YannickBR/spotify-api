export class Track {
    danceability?: number
    energy?: number
    acousticness?: number
    liveness?: number
    speechiness?: number
    loudness?: number
    tempo?: number
    tempoConfidence?: number
    valance?: number
    instrumentalness?: number
    title: string
    artist: string
    id: string

    constructor(title: string, artist: string) {
        this.title = title;
        this.artist = artist;
    }
}