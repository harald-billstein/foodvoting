import React from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStar, faStarHalf} from "@fortawesome/free-solid-svg-icons";
import SVG from 'react-inlinesvg';

export default class StatsHeader extends React.Component {

  constructor() {
    super();
    this.state = {
      restSuggestion: []
    };
    this.restUrl = "/v1/restaurants/suggestion";
  }

  static getStars(grade) {

    let test = [];
    let gradeFloored = Math.floor(grade);
    let gradeDif = grade - gradeFloored;

    for (let i = 0; i < gradeFloored; i++) {
      if (gradeFloored >= i) {
        test.push(<FontAwesomeIcon key={i} icon={faStar}/>);
      }
    }

    if (gradeDif > 0) {
      test.push(<FontAwesomeIcon key={gradeDif} icon={faStarHalf}/>)
    }
    return test;
  }

  componentDidMount() {
    fetch(this.restUrl)
    .then(response => response.json())
    .then(data => {
      this.setState({restSuggestion: data})
    })
    .catch(err => console.log(err))
  };

  render() {
    return (
        <div className="header" id="header">
          <div id="headerFlexRows">
            <div id="headerTogether">
                <h1 id="headerTitle"> foodprint. </h1>
                <h2 id="headerUnderTitleWFlex"> by jayway. </h2>
            </div>
            <hr id="break" />
            <div id="headerRestSuggestion">
              <ul id="restList">
                <li id="liRestHeader"> featured restaurant. </li>
                <li id="liRest"> {this.state.restSuggestion.name}. </li>
                <li id="liRest"> {this.state.restSuggestion.address}. </li>
                <li> {StatsHeader.getStars(this.state.restSuggestion.grade)}</li>
              </ul>
            </div>
            <hr id="break" />
          </div>
        </div>
    )
  }
}