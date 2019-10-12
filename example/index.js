/**
 * h, Component, render
 * 
 * h is used to parse the JSX
 * Component is used implement the Preact component
 * render is used to render the Preact component to the DOM
 */
import {h, Component, render} from 'preact';

/**
 * example style
 * 
 * Style definitions for the Example
 */
import './style/example.scss';

/**
 * TypeAhead
 * 
 * TypeAhead component from the source
 */
import { TypeAhead } from '../src';

import request from '../src/util/request';

/**
 * App
 * 
 * Root component for the example app
 */
class App extends Component {

  /**
   * state
   * 
   * default state for the app
   */
  state = {}

  /**
   * constructor
   * 
   * @param  {...any} args 
   * 
   * Constructor for the App component
   */
  constructor(...args) {
    super(args);
  }

  config = {
    url: "http://www.omdbapi.com",
    params: {
      s: '{{term}}',
      apiKey: 'f0fb0248'
    },
    dataKey: 'Search',
    displayKey: 'Title'
  }

  onSelect(data) {
    console.log(data);
  }

  itemBuilder(data) {
    return <div>
      <p className="__title" dangerouslySetInnerHTML={{__html: data._Title}}></p>
      <p>{data.Type} &bull; {data.imdbID} &bull; {data.Year}</p>
    </div>
  }

  /**
   * render
   * 
   * Render method for the App component
   */
  render() {
    return (
      <div className="wrapper">
        <h3>TypeAhead Example</h3>
        <div className="typeahead">
          <TypeAhead
            config={this.config}
            onSelect={this.onSelect.bind(this)}
            suggestAfter="3"
            max="2"
            hilightTerm
            multiple
            itemBuilder={this.itemBuilder.bind(this)}
          />
        </div>
      </div>
    )
  }
}
/**
 * Attches App component to document body
 */
render(<App />, document.body);