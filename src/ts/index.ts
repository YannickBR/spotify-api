import { ApiCommunicator } from '../data/ApiCommunicator'
import { SpotifyAPI } from '../data/SpotifyAPI';
import { Initialize, getPlaylistInfo as g } from '../data/DataModule';
import { Track } from '../models/Track';
import { audioFeatures, cancel, setCancel } from '../helpers/Constants';
import { forEachFeature } from '../helpers/ForEachHelper'
import Params from '../helpers/ParamHelper';

let a = new ApiCommunicator("ea72a2f9164444058eb992bf5135671b", "aed3610af7e54881bb6a5613a5dc700a", "http://localhost:80/", "http://localhost:80/")
let spotify = new SpotifyAPI();
let rendered = false;
let chart: object;
let stats: any;
let delay: number = 200;


main();

async function main() {
    const login = Params.get('login')
    const loggedIn = Params.get('loggedin')
    const code = Params.get('code')
    const playlist = Params.get('playlist')

    if (login) {
        await a.login();
    }
    if (code) {
        console.log('auth')
        await a.authorize(code);
    }

    if (loggedIn) {
        $('.login-container').hide();
        $('#controls').show();

        setupEvents();
        Initialize(spotify);
        await setDeviceId();
        await go();
        loop();
        if (playlist) {
            getPlaylistInfo(playlist)
        }
    }
}

function loop() {
    setTimeout(() => {
        go();
        loop();
        delay = delay*9
        console.log(delay)
    }, delay*2)
}

function setupEvents() {
    $('#scan').on('click', () => {
        setStatus('Getting info...')
        playListInfo();
    })

    $('#cancel').on('click', () => {
        setCancel(true);
    })
}

function setStatus(status: string) {
    $('#status').text(status);
}
async function setDeviceId() {
    //@ts-ignore
    const devices: any = (await spotify.devices()).devices;
    //@ts
    for (let i = 0; i < devices.length; i++) {
        console.log(devices[i])
        if (devices[i].is_active) {
            a.deviceId = devices[i].id;
        }
    }

    console.log(a.deviceId);
}

function clearUI() {
    $('#lists').empty();
}
function playListInfo() {
    //@ts-ignore
    let id: string = $('#songId').val()
    if(id.includes('track')) {
        setStatus('You probably copied a track link, please enter a playlist link.')
    } else {
        getPlaylistInfo(id);
    }
}

async function getPlaylistInfo(id: string) {

    //@ts-ignore
    if (id[6] == '/') {
        //is a link
        id = id.replace('https://open.spotify.com/playlist/', '')
        id = id.split('?')[0];
    }
    const tracks: Track[] = await g(id);

    //TODO: WRITE TO FILE.

    //@ts-ignore
    setStatus('Sorting list...')
    const stas = {}

    audioFeatures.forEach(feature => {
        //@ts-ignore
        stas[feature] = [...tracks].sort((a: Track, b: Track) => a[feature] - b[feature]);
    })


    //manage UI
    clearUI();
    createUI();
    toUI(stas);

    stats = stas;
    if (cancel) {
        setStatus('Done. (Canceled)')
    } else {
        setStatus('Done.')
    }

    
    forEachFeature((feature: string) => {
        $(`#queue-${feature}`).on('click', () => {
            queue(stats[feature])
        })
    })

    $('#copy').text(`${window.location.origin}?loggedin=true&playlist=${id}`)
}

async function queue(songs: Array<Track>) {
    for (let i = 0; i < songs.length; i++) {
        setStatus(`Queueing songs to account (${i + 1}/${songs.length})`);
        await spotify.queueSong(songs[i].id);
    }
    setStatus('Done.')

}

function createUI() {
    forEachFeature((feature: string) => {
        $('#lists').append(`<div id="${feature}List"> <h1>${feature.charAt(0).toUpperCase() + feature.slice(1)}</h1> <button id="queue-${feature}">Queue</button> <ol id="list-${feature}"></ol> </div>`)
    })
}

function toUI(stats: any) {
    forEachFeature((feature: string, stats: any) => {
        //@ts-ignore
        console.log(stats);
        appendTolIst(stats[feature], `list-${feature}`)
    }, stats)
}


function appendTolIst(array: Array<any>, element: string) {
    //@ts-ignore
    array.reverse().forEach(track => {
        $(`#${element}`).append(`<li><a id="${element}-${track.id}" class="hover" title="Click to play!">${track.title} - ${track.artist} </a></li>`);
        $(`#${element}-${track.id}`).on('click', async () => {
            await spotify.queueSong(track.id);
            await spotify.skip();
        })
    })
}

function play(id: string) {
    console.log(id);
}

async function go() {
    const current: any = await spotify.current();
    const id: string = current.item.id
    const audioFeatures: any = await spotify.audioFeatures(id)
    const name: string = current.item.name;
    const artist: string = current.item.artists[0].name

    let yValues = {};
    forEachFeature((feature: string) => {
        //@ts-ignore
        yValues[feature] = audioFeatures[feature]
    })

    delay = 60/audioFeatures.tempo*1000;
    document.title = `${name} - ${artist} | Spotify Playlist Analyzer`


    displayChart(yValues, name + " - " + artist);
}


function displayChart(yValues: object, title: string) {
    const yValuesData: number[] = Object.values(yValues).filter(x => x != 'length');
    const yValuesLabels: string[] = Object.getOwnPropertyNames(yValues);

    var colors: string[] = [];
    for (let i = 0; i <= yValuesLabels.length; i++) {
        colors.push('#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6));
    }

    if (yValues) {
        if (!rendered) {
            //@ts-ignore
            chart = new Chart("myChart", {
                type: "bar",
                data: {
                    labels: yValuesLabels,
                    datasets: [
                        {
                            backgroundColor: colors,
                            data: yValuesData
                        }
                    ]
                },
                options: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: title
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                max: 1,
                                min: 0
                            }
                        }]
                    }
                }
            });
            rendered = true;
        } else {
            //@ts-ignore
            chart.data.datasets[0].data = yValuesData;
                        //@ts-ignore
            chart.data.datasets[0].backgroundColor = colors;
            //@ts-ignore
            chart.options.title.text = title;
            //@ts-ignore
            chart.update();
        }
    }
}
