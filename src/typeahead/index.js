/**
 * TypeAhead
 *
 * Component to display Movie title in TypeAhead
 *
 *
 * Check README.md for props and configuration details
 */

/**
 * h, Component from Preact
 *
 * h is used as JSX function
 * Component is the class where its lifecyle is implemeted
 */
import {h, Component} from 'preact';

/**
 * request
 *
 * Request utility to make HTTP calls
 */
import request from '../util/request';

/**
 * typeahead.scss
 *
 * Style definitions for the component
 */
import './typeahead.scss';
import PopupMenu from "../../Menu";


/**
 * TypeAhead
 *
 * Component TypeAhead
 */
export default class TypeAhead extends Component {
  /**
   * state
   *
   * Initial state for the TypeAhead component
   */
  state = {
    width: '8px',
    selected: [],
    empty: true,
    showSuggestions: false,
    data: [],
    filtered: [],
    selectedIndex: 0
  }

  elementReferences = {}

  /**
   * input
   *
   * Holds the input element
   */
  input = null;

  /**
   * refDiv
   *
   * Holds the reference div
   * Used to calculate width for input element
   */
  refDiv = null;

  /**
   * suggestior
   *
   * Holds the suggestion container
   */
  suggestor = null;

  /**
   * _cache
   *
   * Local cache for already response
   */
  _cache = {};

  /**
   * constructor
   * @param  {...any} args
   *
   * Consturctor for the TypeAhead component
   */
  constructor(...args) {
    super(args);

    const {
      config = {},
      ...props
    } = this.props[0];

    /**
     * Merging props and state together
     * Preact returns array of props from current and extended classes
     * Using this.props[0] gives the props for the current component
     */
    this.state = {
      ...this.state,
      ...config,
      ...props
    }

    if(!this.state.multiple) {
      this.state.width = '100%';
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const { selectedIndex } = this.state
    const componentLostFocus = selectedIndex === null
    const focusedChanged = prevState.selectedIndex !== selectedIndex
    const focusDifferentElement = focusedChanged && !componentLostFocus

    if (focusDifferentElement) {
      this.elementReferences[selectedIndex].focus();
    }
  }

  /**
   * hide
   *
   * Hide the TypeAhead suggestions
   */
  hide() {
    const {
      onHide = () => {}
    } = this.state;

    this.setState({
      showSuggestions: false
    });

    onHide();
  }

  /**
   * focus
   *
   * Set the focus to input element
   */
  focus() {
    if(!this.input) {
      return;
    }

    this.input.focus();
  }

  /**
   * _width
   *
   * @param {*} value
   *
   * Set width of input element
   */
  _width(value) {
    this.refDiv.innerText = value;

    if(this.refDiv.clientWidth === 0) {
      return width =  '8px';
    }

    return this.refDiv.clientWidth + 'px';
  }

  /**
   * _get_title
   *
   * @param {*} text
   * @param {*} val
   *
   * Higlight the matching string into the title
   */
  _get_title(text, val) {
    const match = text.match(new RegExp(val, 'i'));
    return text.replace(match, `<span>${match}</span>`)
  }

  /**
   * deboucne
   *
   * @param {*} func
   * @param {*} delay
   *
   * Debounce the network call by 500ms
   */
  debounce(func, delay = 800) {
    request.debounce(func.bind(this), delay)();
  }

  /**
   * throttle
   *
   * @param {*} func
   * @param {*} limit
   *
   * Throttle the network call by 500ms
   */
  throttle(func, limit = 800) {
    request.throttle(func.bind(this), limit)();
  }

  /**
   * onInput
   *
   * @param {*} event
   *
   * OnInput handler for input element
   */
  onInput(event) {

    let {
      onInput = () => {},
      suggestAfter = 3,
      multiple = false
    } = this.state;

    suggestAfter = parseInt(suggestAfter);

    const _state = {
      empty: event.target.value.length === 0 ? true : false,
      showSuggestions: false
    }

    if(multiple) {
      _state.width = this._width(event.target.value);
    }

    this.setState(_state);

    onInput(event.target.value);

    if(event.target.value.length >= suggestAfter) {
      this._search(event.target.value);
    }
  }

  /**
   * _cache_key
   *
   * @param {*} term
   *
   * Generating cache key based on the input term
   */
  _cache_key(term) {
    return term.toLowerCase().replace(/ /g, '-');
  }

  /**
   * _build_url
   *
   * @param {*} term
   *
   * Builds url from params
   */
  _build_url(term) {
    const {
      url,
      params
    } = this.state;

    const _url = url.indexOf('?') === -1 ? `${url}?` : url;

    const _params = Object.keys(params);
    const _uriParts = [];

    if(!params || _params.length === 0) {
      throw new Error('Params is missing from config');
    }

    _params.forEach(_key => {
      if(params[_key] === '{{term}}') {
        _uriParts.push(`${_key}=${term.replace(/ /g, '+')}`);
      }else {
        _uriParts.push(`${_key}=${params[_key]}`);
      }
    });

    return _url + _uriParts.join('&');
  }

  /**
   * _fetch_data
   *
   * @param {*} term
   *
   * Fteches data from url
   */
  _fetch_data(term) {
    const {
      dataKey = null
    } = this.state;

    const _url = this._build_url(term);

    this.debounce(() => {
      const _key = this._cache_key(term);
      if(typeof this._cache[_key] !== 'undefined') {
        request.abort();
        return this._filter_data(this._cache[_key], term);
      }

      request.get(_url).then(_res => {
        if(dataKey && !Array.isArray(_res)) {
          _res = _res[dataKey];
        }

        if(!_res) {
          return this.setState({
            showSuggestions: false
          });
        }

        this._cache[_key] = _res;
        this._filter_data(_res, term);
      })
    });

  }

  /**
   * _filter_data
   *
   * @param {*} data
   * @param {*} term
   *
   * _filters fetched data
   */
  _filter_data(data, term) {
    const {
      displayKey,
      hilightTerm = null,
      duplicate = false,
      selected = []
    } = this.state;

    const filtered = [];

    if(this.input.value !== term) {
      return this.setState({
        showSuggestions: false
      });
    }

    data.forEach(item => {
      if(item[displayKey].toLowerCase().indexOf(term.toLowerCase()) !== -1) {

        const _item = item;

        if(hilightTerm) {
          _item[`_${displayKey}`] = this._get_title(item[displayKey], term);
        }

        if(!duplicate) {
          const index = selected.findIndex(_s => _s[displayKey] === _item[displayKey]);
          if(index !== -1) {
            return;
          }
        }

        filtered.push(_item);
      }
    });

    // this._key_handler = this._handle_arrow_key.bind(this);
    //
    // if(filtered.length > 0) {
    //   document.addEventListener('keyup', this._key_handler);
    // }else {
    //   document.removeEventListener('keyup', this._key_handler);
    // }

    this.setState({
      filtered,
      showSuggestions: filtered.length > 0 ? true : false
    });
  }

  /**
   * _search
   *
   * @param {*} term
   *
   * Initiate the search
   */
  _search(term) {
    const {
      url = null,
      data = []
    } = this.state;

    if(data.length === 0 && !url) {
      return;
    }

    if(data.length > 0) {
      return this._filter_data(data, term);
    }

    if(url) {
      this._fetch_data(term);
    }
  }

  _handle_arrow_key(event) {
    let {
      selectedIndex
    } = this.state;

    switch (event.code) {
      case 'Enter':
        event.preventDefault();
        this.select(this.state.filtered[selectedIndex]);
      break;

      case 'ArrowDown':
        event.preventDefault();
        if(selectedIndex < this.state.filtered.length) {
          selectedIndex++;
        }

        this.setState({
          selectedIndex
        })
      break;

      case 'ArrowUp':
        event.preventDefault();
        if(selectedIndex > 0) {
          selectedIndex--;
        }

        this.setState({
          selectedIndex
        })
      break;
      case 'Escape':
        event.preventDefault();
        this.hide();
      break;
    }
  }

  /**
   * select
   *
   * @param {*} item
   *
   * Select the movie from TypeAhead suggestions
   */
  select(item) {

    let {
      max = 5,
      onSelect = () => {},
      multiple = false,
      displayKey
    } = this.state;

    max = parseInt(max);

    let selected = this.state.selected;

    if(!multiple) {
      this.input.value = item[displayKey]
    }else {
      selected.push(item);
      this.input.value = "";
    }

    this.input.focus();

    this.setState({
      selected,
      showSuggestions: false
    });

    if(selected.length === max) {
      this.input.style.display = 'none';
    }

    onSelect(item);
  }

  /**
   * remove
   *
   * @param {*} index
   *
   * remove the selected items
   */
  remove(index) {
    let {
      max = 5
    } = this.state;

    const selected = this.state.selected;
    selected.splice(index, 1);

    this.setState({
      selected,
      empty: selected.length === 0 && this.input.value === '' ? true : false
    });

    max = parseInt(max);

    if(max > this.state.selected.length) {
      this.input.style.display = 'inline-block';
      this.input.focus();
    }

    this.setState({
      showSuggestions: false
    });
  }

  _item_builder(item) {
    return <div>
      <p className="__title" dangerouslySetInnerHTML={{__html: item._title}}></p>
      <p>{item.director}</p>
    </div>;
  }

  /**
   * render
   *
   * Component's render method
   */
  render(props) {
    const {
      itemBuilder = this._item_builder.bind(this),
      displayKey = 'title',
      multiple = false,
      selectedIndex
    } = this.state;

    this._key_handler = this._handle_arrow_key.bind(this);

    return (
      <div className={`__type_head ${this.state.showSuggestions ? '__show_suggestions': ''}`} onClick={this.focus.bind(this)} onKeyUp={this._key_handler}>
        <div className={`__input ${multiple ? '__multiple': '__single'}`}>
          <div className="__hidden" ref={node => this.refDiv = node}>{this.state.value}</div>
          <div className={`__tags ${this.state.empty && this.state.selected.length === 0 ? '__null': ''}`} placeholder={props.placeholder}>
            {this.state.selected.length === 0 && multiple && <span className="empty">&nbsp;</span>}
            {multiple && this.state.selected.map((data, index) => {
              return <span>{data[displayKey]} <span className="__remove" onClick={this.remove.bind(this, index)}>&#10005;</span></span>
            })}
            <input type="text" style={{width: this.state.width}} onInput={this.onInput.bind(this)} ref={input => this.input = input} />
          </div>
        </div>
        <div className="__overlay" onClick={this.hide.bind(this)}></div>
        <div className="__suggestions" ref={node => this.suggestor = node}>
          <ul className="__list p-0">
            {this.state.filtered.map((item, index) => {
              return <li className={`${selectedIndex === index ? '__active': ''}`} onClick={this.select.bind(this, item)} tabindex="-1"  ref={(optionEl) => { this.elementReferences[index] = optionEl }}>{itemBuilder(item)}</li>
            })}
          </ul>
        </div>
      </div>
    )
  }
}

TypeAhead.defaultProps = {
  placeholder : 'Type movie title to search',
};
