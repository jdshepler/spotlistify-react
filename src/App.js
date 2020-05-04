import React, {Component} from 'react';
import './App.css';
import axios from 'axios';
import Spotify from "spotify-web-api-js";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import styled from 'styled-components';


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
            artistSetDate: '',
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
                this.setState({
                    userID: res.id
                })
                console.log(this.state.userID)
                this.createSetlistPlaylist()
            })
            .catch(err => console.log(err));
    }

    createSetlistPlaylist() {
        spotifyWebApi.createPlaylist(this.state.userID, {name: this.state.artistName + " Setlist " + this.state.artistSetDate})
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
            .then(res => {
                this.setState({
                    artistSetURIs: []
                })
            })
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
            .then(res => {
                let x;
                let y = 0;
                while (res.data.setlist[y].sets.set.length < 1){
                    y++;
                }
                for (x in res.data.setlist[y].sets.set[0].song)
                    this.searchSpotifyTracks(res.data.setlist[y].sets.set[0].song[x].name, this.state.artistName)
                this.setState({
                    artistSetDate: res.data.setlist[0].eventDate
                })
                this.getUserID()
            })
            .catch(err => console.log(err));
    }

    render() {
        const PaperDiv = styled.div`
            background: linear-gradient(rgba(255,255,255, .4), rgba(255,255,255,.2));
            border-radius: 15px;
            margin: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 25px;
            box-shadow: 13px 15px 29px 5px rgba(0,0,0,0.25);
        `;

        let home;
        if (this.state.loggedIn) {
            home = (
                <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                    spacing={2}
                >
                    <Grid item>
                        <Typography
                            variant="h2"
                            style={{
                            color: 'white',
                            fontFamily: 'Quicksand'
                        }}>
                            SPOTLISTIFY
                        </Typography>
                    </Grid>
                    <Grid item>
                        <TextField
                        id="outlined-number"
                        label="Enter Artist's Name"
                        variant="outlined"
                        autoFocus
                        defaultValue={this.state.artistName}
                        onChange={this.onChangeArtist}
                        style={{
                            fontFamily: 'Quicksand'
                        }}
                        />
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={this.searchArtist}
                            style={{
                                color: 'black',
                                background: 'linear-gradient(rgba(255,255,255, .9), rgba(255,255,255, .8)',
                                borderRadius: 10,
                                fontFamily: 'Quicksand'
                            }}
                        >
                            Generate Playlist
                        </Button>
                    </Grid>
                </Grid>
            )

        } else {
            home = (
                <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                    spacing={2}
                >
                    <Grid item>
                        <Typography
                            variant="h2"
                            style={{
                                color: 'white',
                                fontFamily: 'Quicksand'
                            }}>
                            SPOTLISTIFY
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={this.searchArtist}
                            href='http://localhost:8888'
                            style={{
                                color: 'black',
                                background: 'linear-gradient(rgba(255,255,255, .8), rgba(255,255,255, .6)',
                                borderRadius: 5,
                                fontFamily: 'Quicksand'
                            }}
                        >
                            <h4>Login to Spotify</h4>
                        </Button>
                    </Grid>
                </Grid>

            )
        }



        return (
            <div className="App">
                <Container maxWidth="sm">
                    <PaperDiv>
                        { home }
                    </PaperDiv>
                </Container>
            </div>
        );
    }
}