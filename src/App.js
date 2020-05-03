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


        this.onChangeArtist = this.onChangeArtist.bind(this);
        this.searchArtist = this.searchArtist.bind(this);
        this.state = {
            loggedIn: token ? true: false,
            artistName: '',
            artistSet: [],

        }
        if (token){
            spotifyWebApi.setAccessToken(token)
        }
    }

    onChangeArtist(e) {
        this.setState({
            artistName: e.target.value
        })
    }

    searchArtist() {
        const searchArtistURL = "https://cors-anywhere.herokuapp.com/https://api.setlist.fm/rest/1.0/search/artists";
        const searchArtistConfig = {
            headers: {
                "Accept": "application/json",
                "x-api-key": "FsKLJ5csXlSKHt5H_rSLcCxNt3gg1oegOmKB"
            }
        }

        const params = new URLSearchParams({
            artistName: this.state.artistName,
            p: "1",
            sort: "relevance"
        }).toString();

        return axios.get(`${searchArtistURL}?${params}`, searchArtistConfig)
            // .then(res => console.log(res.data))
            .then(res => {
                this.searchSetlists(res.data.artist[0].mbid)
            })


            // .then(data => this.getArtistMBID(data))
            .catch(err => console.log(err));
    }

    searchSetlists(artistMBID) {
        const searchSetlistsURL = "https://cors-anywhere.herokuapp.com/https://api.setlist.fm/rest/1.0/artist/" + artistMBID + "/setlists";
        const searchSetlistsConfig = {
            headers: {
                "Accept": "application/json",
                "x-api-key": "FsKLJ5csXlSKHt5H_rSLcCxNt3gg1oegOmKB"
            }
        }

        const params = new URLSearchParams({
            p: "1",
        }).toString();

        return axios.get(`${searchSetlistsURL}?${params}`, searchSetlistsConfig)
            // .then(res => console.log(res.data))
            .then(res => {
                var x;
                for (x in res.data.setlist[0].sets.set[0].song)
                    this.state.artistSet.push(res.data.setlist[0].sets.set[0].song[x].name);
                    let query = res.data.setlist[0].sets.set[0].song[x].name + this.state.artistName;
                    console.log(spotifyWebApi.searchTracks(query));

                console.log(this.state.artistSet)
            })


            // .then(data => this.getArtistMBID(data))
            .catch(err => console.log(err));
    }



    getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while ( e === r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    render() {
        let home;
        if (this.state.loggedIn) {
            home = ( <a href='http://localhost:8888' > Login to Spotify </a> )
        } else {
            home = (<div>
                    <a href='http://localhost:8888' > Login to Spotify </a>
                    <TextField
                        id="filled-number"
                        label="Enter Artist's Name"
                        variant="filled"
                        defaultValue={this.state.artistName}
                        onChange={this.onChangeArtist}
                    />
                </div>
                )
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