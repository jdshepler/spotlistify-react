import React, {Component} from 'react';
import './App.css';
import Spotify from "spotify-web-api-js";
import TextField from '@material-ui/core/TextField';
import axios from 'axios';

const spotifyWebApi = new Spotify();


export default class App extends Component {
    constructor(props) {
        super(props);
        const params = this.getHashParams();
        const token = params.access_token;

        this.searchArtist = this.searchArtist.bind(this);
        this.state = {
            loggedIn: token ? true: false,

        }
        if (token){
            spotifyWebApi.setAccessToken(token)
        }
    }

    searchArtist() {
        const searchArtistURL = "https://api.setlist.fm/rest/1.0/search/artists";
        const searchArtistConfig = {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Accept": "application/json",
                "x-api-key": "FsKLJ5csXlSKHt5H_rSLcCxNt3gg1oegOmKB"
            }
        }

        const params = new URLSearchParams({
            artistName: "Tame Impala",
            p: "1",
            sort: "sortName"
        }).toString();

        return axios.get(`${searchArtistURL}?${params}`, searchArtistConfig)
            .then(res => console.log(res.data))
            .catch(err => console.log(err));
    }


    getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while ( e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    render() {
        let home;
        if (this.state.loggedIn) {
            home = ( <a href='http://localhost:8888' > Login to Spotify </a> )
        } else {
            home = (<TextField
                        id="filled-number"
                        label="Enter Artist's Name"
                        variant="filled"
                    />)
        }
        return (
            <div className="App">
                <div>
                    { home }
                </div>
                <button onClick={this.searchArtist}>
                    SearchLord
                </button>
            </div>
        );
    }
}