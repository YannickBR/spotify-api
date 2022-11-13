import { ApiCommunicator } from './ApiCommunicator'
import { SpotifyAPI } from './SpotifyAPI';
import { Initialize, getPlaylistInfo as g } from './DataModule';
import { Track } from './Models/Track';
import { audioFeatures, cancel, setCancel } from './Constants';
import { forEachFeature } from './ForEachHelper'

let a = new ApiCommunicator("ea72a2f9164444058eb992bf5135671b", "aed3610af7e54881bb6a5613a5dc700a", "http://localhost:8080/", "http://localhost:8080/")
let spotify = new SpotifyAPI(a);
let rendered = false;
let chart: object;
let stats: any;


main();

async function main() {
    const urlParams = new URLSearchParams(window.location.search);
    const login = urlParams.get('login')
    const loggedIn = urlParams.get('loggedin');
    const code = urlParams.get('code')
    const playlist = urlParams.get('playlist');

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

        setDeviceId();
        go();

        setInterval(() => {
            go();
        }, 1000);
    }
}

function setupEvents() {
    $('#scan').on('click', () => {
        getPlaylistInfo();
        setStatus('Getting info...')
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

async function getPlaylistInfo() {

    //@ts-ignore
    let id: string = $('#songId').val()
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
    console.log(stas);

    
    forEachFeature((feature: string) => {
        $(`#queue-${feature}`).on('click', () => {
            queue(stats[feature])
        })
    })
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
        appendTolIst(stats[feature], `list-${feature}`)
    }, stats)
}


function appendTolIst(array: Array<any>, element: string) {
    //@ts-ignore
    array.reverse().forEach(track => {
        $(`#${element}`).append(`<li>${track.title} - ${track.artist}</li>`);
    })
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
            chart.options.title.text = title;
            //@ts-ignore
            chart.update();
        }
    }
}
