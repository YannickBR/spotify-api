export class ApiCommunicator {

    clientId: string;
    clientSecret: string;
    redirectUri: string;
    clientRedirectUri: string
    deviceId: string

    query_params: object
    bearerToken: string

    constructor(clientId: string, clientSecret: string, redirectUri: string, clientRedirectUri: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        this.clientRedirectUri = clientRedirectUri;

        this.query_params = {
            client_id: this.clientId,
            response_type: "code",
            redirect_uri: this.redirectUri,
            scope: 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-playback-position user-top-read user-read-recently-played app-remote-control streaming'
        }
    }

    async request(requestInfo: any, info?: any): Promise<object> {
        const method = requestInfo.method
        let url = requestInfo.url
        if(info) {
            url += '/' + info
        }
        const headers = {
          Authorization: 'Bearer ' + localStorage.getItem('access_token'),
          'Content-Type': 'application/json',
          "Accept": "application/json"
        };
      
        const result: any = (await fetch(url, {
          headers: headers,
          method: method
        }))

        if (result.status == 401 || result.status == 401) {
            if ((await result.json()).error.message == 'The access token expired')
            {
                window.location.href = "/?login=true";
            }
        }

        if (result.status == 200) {
          return await result.json();
        } 

        // if(result.status == 400 || result.status == 401) {
        //     window.location.href = "/?login=true";
        // }
    }

    async requestObject(requestInfo: any, requestObject: object) : Promise<object> {
        return await this.request(requestInfo, "?" + this.encodeFormData(requestObject));
    }

    async login() {
        //@ts-ignore
        window.location.href = `https://accounts.spotify.com/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${this.redirectUri}&scope=${this.query_params.scope}`;
    }

    async authorize(code: string) {
        const body = {
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri,
            client_id: this.clientId,
            client_secret: this.clientSecret,
        }
        await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            },
            body: this.encodeFormData(body)
        })
            .then(response => response.json())
            .then(data => {
                if (data.error == 'invalid_grant') {
                    window.location.href = '/'
                } else {
                    this.deviceId
                    localStorage.setItem('access_token', data.access_token)
                    localStorage.setItem('refresh_token', data.refresh_token)
                    window.location.href= '/?loggedin=true' 
                }

            });
    }

    encodeFormData(data: any) {
        return Object.keys(data)
          .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
          .join('&');
      }
}