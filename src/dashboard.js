'use strict'
const endpoints = require('./config/endpoints.json')

main();

function main() {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has('code')) {
    const bearerToken = urlParams.get('code');
    console.log(bearerToken)


    const CLIENT_ID = "ea72a2f9164444058eb992bf5135671b"
    const CLIENT_SECRET = "aed3610af7e54881bb6a5613a5dc700a"
    const REDIRECTURI = "http://localhost/dashboard.html"
    const CLIENT_REDIRECTURI = "http://localhost:3000/"

    const body = {
      grant_type: 'authorization_code',
      code: bearerToken,
      redirect_uri: REDIRECTURI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }

    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: encodeFormData(body)
    })
      .then(response => response.json())
      .then(data => {
        if (data.error == 'invalid_grant') {
          window.location.href = '/login.html'
        } else {
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
        }
      });
  } else {
    window.location.href = '/'
  }
}

function setP(token) {
  token = token;
}

function encodeFormData(data) {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

async function doStuff() {
  const data = await request(endpoints.player.current);
  $('#artist').text(data.item.artists[0].name)
}

async function skip() {
  await request(endpoints.player.skip);
}

async function previous() {
  await request(endpoints.player.previous);
}

async function pause() {
  await request(endpoints.player.pause);
}

async function play() {
  await request(endpoints.player.play);
}



async function request(info) {
  const method = info.method
  const url = info.url
  const headers = {
    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
    'Content-Type': 'application/json',
    "Accept": "application/json"
  };

  const result = (await fetch(url, {
    headers: headers,
    method: method
  }))
  if (result.status == 200) {
    return await result.json();
  }
}

setInterval(() => {
  refresh();
}, 1000)

function refresh() {
  doStuff();
}