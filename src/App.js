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
            userID: '',
            artistName: '',
            artistSetURIs: [],
            playlistID: '',

        }
        if (token){
            spotifyWebApi.setAccessToken(token)
        }
    }

    getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        e = r.exec(q)
        while (e) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
            e = r.exec(q);
        }
        return hashParams;
    }

    onChangeArtist(e) {
        this.setState({
            artistName: e.target.value
        })
    }

    searchSpotifyTracks(songName, artistName) {
        let query = songName + " " + artistName;
        spotifyWebApi.searchTracks(query)
            .then(res => {
                this.state.artistSetURIs.push(res.tracks.items[0].uri)
            })
            .catch(err => console.log(err));
    }

    getUserID() {
        spotifyWebApi.getMe()
            .then(res => {
                console.log(res)
                this.setState({
                    userID: res.id
                })
                console.log(this.state.userID)
                this.createSetlistPlaylist()
            })
            .catch(err => console.log(err));
    }

    createSetlistPlaylist() {
        spotifyWebApi.createPlaylist(this.state.userID, {name: "Test playlist"})
            .then(res => {
                this.setState({
                    playlistID: res.id
                })
                this.addTracks()
            })
            .catch(err => console.log(err));
    }

    addTracks() {
        spotifyWebApi.addTracksToPlaylist(this.state.playlistID, this.state.artistSetURIs)
            .then(res => console.log(res))
            .catch(err => console.log(err));
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
                    // this.state.artistSet.push(res.data.setlist[0].sets.set[0].song[x].name);
                    this.searchSpotifyTracks(res.data.setlist[0].sets.set[0].song[x].name, this.state.artistName)

                console.log(this.state.artistSet)
                this.getUserID()
            })


            // .then(data => this.getArtistMBID(data))
            .catch(err => console.log(err));
    }

    render() {
        let home;
        if (this.state.loggedIn) {
            home = (
                <div>
                    <TextField
                        id="filled-number"
                        label="Enter Artist's Name"
                        variant="filled"
                        defaultValue={this.state.artistName}
                        onChange={this.onChangeArtist}
                    />
                </div>
            )

        } else {
            home = ( <a href='http://localhost:8888' > Login to Spotify </a> )
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