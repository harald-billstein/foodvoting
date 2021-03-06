import React from 'react';
import moment from 'moment';
import GreenIcon from './icons/arrow-green.svg';
import RedIcon from './icons/arrow-red.svg';
import SVG from 'react-inlinesvg';

export default class StatsPercent extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            month: moment().month(),
            day: moment().date(),
            thisMonthFrom: moment().startOf('month').format('YYYY-MM-DD'),
            thisMonthTo: moment().format('YYYY-MM-DD'),
            lastMonthFrom: moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
            lastMonthTo: moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
            difference: 0,
            icon: GreenIcon
        }
        this.timer = null;
        this.statsUrl = "/v1/emission/statistics";
    }

    calculateDiff() {
        let diff;
        if (this.state.thisMonth.totalCo2e !== 0 && this.state.lastMonth.totalCo2e !== 0) {
           diff = (this.state.thisMonth.totalCo2e/this.state.thisMonth.totalPortions)/(this.state.lastMonth.totalCo2e/this.state.lastMonth.totalPortions);
        } else {
           diff = 1;
        }

        if (diff > 1) {
            this.setState({
                    icon: RedIcon,
                    difference: (diff - 1)*100})
        } if (diff < 1) {
            this.setState({
                    icon: GreenIcon,
                    difference: (1 - diff)*100})
        } if (diff === 1) {
            this.setState({
                    icon: GreenIcon,
                    difference: 0})
        }
    }

    fetchStats() {
        let thisMonth = fetch(this.statsUrl+ '/?from=' + this.state.thisMonthFrom +'&to=' + this.state.thisMonthTo)
            .then(response => response.json());

        let lastMonth = fetch(this.statsUrl+ '/?from=' + this.state.lastMonthFrom +'&to=' + this.state.lastMonthTo)
            .then(response => response.json());

        Promise.all([thisMonth, lastMonth])
            .then(response =>
                this.setState({
                    thisMonth: response[0],
                    lastMonth: response[1]}))
            .then(() => this.calculateDiff());
    }

    componentDidMount() {
        this.timer = setInterval(() => this.fetchStats(), 10000);
    }

    render() {
        return(
            <div className="tablePercent" id ="tablePercent">
                <div id ="tableCaretLogo" style={{marginTop: this.state.icon === GreenIcon ? "11%" : "9%"}}>
                    <SVG src={this.state.icon} />
                </div>
                <div id="tablePercentText">
                    <p> {Math.round(this.state.difference * 10)/10} % from last month. </p>
                </div>
            </div>
        )
    }

}