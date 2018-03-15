//expected props:
// markers : a list of events to display on the map
// getMarkerClick : a callback function that returns which marker was clicked to the parent
// createServices : a callback function that is called when map is ready. Will create the places and geocoder services
// getMarkerClick : a callback function that supplies the index of which marker was clicked


import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import InfoDisplay from './InfoDisplay'
import MapStyles from '../style/MapStyles'
//Firebase
import {eventRef, uid} from '../utils/Firebase'
//API
// import { getWeatherData } from '../api/DarkSkyApi';

export class MapContainer extends Component {
    constructor(props){
        super(props)
        this.onMapClick = this.onMapClick.bind(this);
        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.state = {
            activeMarker: null,
            eventLikes: 0,
            canLike: true,
            collapse: true,
            weather: null
        }
        // this.getWeather = this.getWeather.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleLike = this.handleLike.bind(this);
    }
    
// getWeather(data){
//     this.setState({weather: data})
// }
createServices = (mapProps, map) =>{
    this.props.createServices(mapProps,map);
}
handleLike(props){
    var eventID;
    var currentRef;
    var canLike = true;
    if(this.props.activeMarker){
        eventID = this.props.markers[this.props.activeMarker].id;
        currentRef = eventRef.child(eventID);
        currentRef.off();
      }
    eventID = this.props.markers[props.activeMarker].id;
    currentRef = eventRef.child(eventID);
    currentRef.on('value', snapshot=>{
        if(snapshot.val()){
            if(snapshot.val()[uid]){
                canLike = false;
            }
            this.setState({
                eventLikes: snapshot.val().likes,
                canLike: canLike,
            })
        }
        else{
            this.setState({
                eventLikes: 0,
                canLike: canLike,           
            })
        }
    })
}

onMarkerClick(props, marker, e){
    // //get weather data for the event clicked 
    // getWeatherData(this.props.markers[props.num], this.getWeather);

    this.props.getMarkerClick({
      activeMarker: props.num,
    });
    this.setState({
        collapse: true,
        activeMarker: marker
        // weather: meetWithWeather
    })
}
onMapClick(mapProps, map, clickEvent){
    if(this.props.showingInfoWindow){
        this.props.getMapClick();
        this.setState({
            activeMarker: null
        })
    }
}
shouldComponentUpdate(nextProps, nextState){
    if(this.state === nextState && 
        this.props.showingInfoWindow === nextProps.showingInfoWindow &&
        this.props.activeMarker === nextProps.activeMarker &&
        this.props.eventLikes === nextProps.eventLikes &&
        this.props.canLike === nextProps.canLike &&
        this.props.markers === nextProps.markers && 
        this.props.Marker === nextProps.Marker &&
        this.props.loaded === nextProps.loaded){
            return false;
    }
    return true;
}
componentWillReceiveProps(nextProps){
    if (this.props.activeMarker !== nextProps.activeMarker && this.props.showingInfoWindow){
        this.handleLike(nextProps);
    }
}
handleClick(event){
    if(event.target.id === 'like'){
      var eventID = this.props.markers[this.props.activeMarker].id;
      var currentRef = eventRef.child(eventID);
      currentRef.set({
        likes: this.state.eventLikes + 1
      })
      currentRef.child(uid).set(true);
    }
    else if(event.target.id === 'collapse'){
        this.setState({
            collapse: !this.state.collapse
        })
    }
}
componentDidMount(){
    // console.log('map mounted');
    if(this.props.visible){
        // console.log('map mounted visible');
        document.addEventListener("click", this.handleClick);
    }
  }
  componentWillUnmount(){
      if(this.props.visible){
          document.removeEventListener("click", this.handleClick);
      }
  }
render() {
    const style = {
        width: '100%',
        height: '100%',
        position: 'initial'
      };
      const initialCenter = {
        lat: this.props.center.lat,
        lng: this.props.center.lng
      };
    var newLatLng = null
     if(this.props.loaded && this.props.activeMarker !== null){
         var google = this.props.google;
         newLatLng = new google.maps.LatLng(this.props.markers[this.props.activeMarker].lat, this.props.markers[this.props.activeMarker].lng);
     }
    return (
      <Map
        google={this.props.google}
        zoom={6}
        containerStyle={style}
        // centerAroundCurrentLocation={true}
        onClick={this.onMapClick}
        initialCenter={initialCenter}
        visible={this.props.visible}
        onReady={this.createServices}
        styles = {MapStyles}
        >

        {this.props.markers.map( (marker, index) => 
        
            <Marker 
                onClick={this.onMarkerClick}
                num={index}
                name={marker.name}
                title={marker.title}
                position={{lat: marker.lat, lng: marker.lng}} 
                key={marker.key} 
                description={marker.description}
                icon = {require('../img/Map/marker.png')}
            />
        )}
        <InfoWindow
            position={newLatLng}
            visible={this.props.showingInfoWindow}>    
            <div>
                {this.props.showingInfoWindow && 
                <InfoDisplay 
                    collapse={this.state.collapse}
                    canLike={this.state.canLike} 
                    eventLikes={this.state.eventLikes} 
                    event={this.props.markers[this.props.activeMarker]} 
                    weather={this.state.weather}
                />}
            </div>
        </ InfoWindow>
      </Map>
    );
  }
}

//expected props:
// markers : a list of events to display on the map
// getMarkerClick : a callback function that returns which marker was clicked to the parent
// createServices : a callback function that is called when map is ready. Will create the places and geocoder services
// getMarkerClick : a callback function that supplies the index of which marker was clicked


// center={this.state.center}
// markers={this.state.events}
// createServices={this.createServices}
// getMarkerClick={this.getMarkerClick}
// getMapClick={this.getMapClick}
// showingInfoWindow={this.state.showingInfoWindow}
// activeMarker={this.state.activeEvent}
// visible={false}

MapContainer.propTypes = {
    markers: PropTypes.array,
    getMarkerClick: PropTypes.func,
    createServices: PropTypes.func,
}

MapContainer.defaultProps = {
    markers: [],
    getMarkerClick: function(){return},
    getMapClick: function(){return},
    center: {
        lat: 32,
        lng: -121
    },
    showingInfoWindow: false,
    activeMarker: null
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyDLG4_hYBIcKhGyWq1bvypGZYUbzNi0yZM"
})(MapContainer)


/* <div>
            {this.state.showingInfoWindow &&
            <div>
                <h3>{this.props.markers[this.state.num].name}</h3>
                <div
                    dangerouslySetInnerHTML={{__html: this.props.markers[this.state.num].description}}>
                </div>
                <a href={this.props.markers[this.state.num].link}>Learn More</a>
            </div>
            }
            </div>  */
