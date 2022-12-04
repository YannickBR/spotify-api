import fs from 'fs';
import { ApiCommunicator } from '../data/ApiCommunicator'
import { SpotifyAPI } from '../data/SpotifyAPI';

let a = new ApiCommunicator("ea72a2f9164444058eb992bf5135671b", "aed3610af7e54881bb6a5613a5dc700a", "http://localhost:80/", "http://localhost:80/")
let spotify = new SpotifyAPI();
let currentId: string;

let voteMap: any = {};

async function main() {
    const current: any = await spotify.current();
    currentId = current.item.id;
    $('#currentlyPlaying').text(`${current.item.name} - ${current.item.artists[0].name}`)
    setInterval(async () => {
        const current: any = await spotify.current();
        currentId = current.item.id;
        $('#currentlyPlaying').text(`${current.item.name} - ${current.item.artists[0].name}`)
    }, 2000)


    $('#downvote').on('click', () => {
        vote(-1);
    });


    $('#upvote').on('click', () => {
        vote(1);
    });
}



function vote(status: number) {
    if (!localStorage.getItem(`voted_${currentId}`)) {
        localStorage.setItem(`voted_${currentId}`, 'true');
        console.log('voted.')


        if (voteMap[currentId]) {
            voteMap[currentId] = {
                votes: voteMap[currentId].votes + status,
                totalVotes: voteMap[currentId].votes++
            }
        } else {
            //first vote
            voteMap[currentId] = {
                votes: status,
                totalVotes: 1
            }
        }

        fs.writeFileSync('votes.json', JSON.stringify(voteMap));

        console.log(voteMap);

    } else {
        alert('Je hebt al gestemd!')
    }
}

main();