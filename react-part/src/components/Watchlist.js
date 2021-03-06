import React, { Component, Fragment } from 'react'
import apiCall from '../util/apiCall';
import QuoteSheet from './Ticker/QuoteSheet'
import '../styles/style.css';


export default class Watchlist extends Component {
    constructor(props) {
      super(props);
      this.state = {
        activeQuotes: [],
        activeTickers : [],
        error: ""
      };
      this.checkList()
    }

    checkList() {
      const endpoint = `/api/${window.sessionStorage.getItem("apikey")}/active/list`
      const promise = apiCall(endpoint,'get')
      promise.then(blob => blob.json()).then(json => {
        this.setState({
          activeTickers: json.symbols
        })
        this.props.grabActiveTickers(json.symbols)  /*???*/
      })
    }

    getQuotes (symbols) {
      if(symbols) {
      const activeTickers = symbols.join()
      const endpoint = `/api/list/${activeTickers}/quote`
      const promise = apiCall(endpoint,'get')
      promise.then(blob => blob.json()).then (json=> {
        this.setState({
          activeQuotes: json.quotes
        })
      })
    }}

    addSymbol=(symbol) =>{
      if(symbol){
      const endpoint = `/api/${window.sessionStorage.getItem("apikey")}/active/add/${symbol}`
      const promise = apiCall(endpoint,'get')
      promise.then(blob => blob.json()).then(json => {
      if(json.error.length>0) {
        alert(json.error)
      } else {
        alert(`You have added '${symbol}' to watchlist`)
        this.setState({activeTickers: json.symbols})
        this.getQuotes(this.state.activeTickers)
        this.props.grabActiveTickers(json.symbols)   /*?????*/
      }

       })
    }}

    delSymbol=(symbols) =>{
      if(symbols){
      const endpoint = `/api/${window.sessionStorage.getItem("apikey")}/active/delete/${symbols}`
      const promise = apiCall(endpoint,'get')
      promise.then(blob => blob.json()).then(json => {
      this.setState({activeTickers: json.symbols})
      this.props.grabActiveTickers(json.symbols)
      if(json.symbols && json.symbols.length>0) {
      this.getQuotes(this.state.activeTickers)
      } else {
        this.setState({activeQuotes: []})
      }
       })
    }}
 
    componentDidUpdate(prevState) {
        if(this.state.activeTickers){
          if(!this.state.activeQuotes || this.state.activeQuotes.length===0) {
            this.getQuotes(this.state.activeTickers)
          }
        } 
      }
    
  render() {
    let output = (<Fragment></Fragment>)
    if(this.state.activeQuotes) {
      output=(
        <QuoteSheet
          addSymbol={this.addSymbol}
          delSymbol={this.delSymbol} 
          activeTickers={this.state.activeTickers}
          activeQuotes={this.state.activeQuotes}
          setChartsTicker={this.props.setChartsTicker}
        />
      )
    }
        return (
            <Fragment>
                <div className="watchlist-field">
                    {output}
                </div>
            </Fragment>
        )
    }
}
