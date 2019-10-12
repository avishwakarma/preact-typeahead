/**
 * Request
 * 
 * Request utility to make HTTP calls
 */

class Request {

  /**
   * _config
   * 
   * Default config for request
   */
  _config = {
    method: 'GET',
    body: null,
    headers: {}
  }

  /**
   * __xhr
   * 
   * XMLHttpRequest object in case of abort and etc
   */
  __xhr = null;

  /**
   * _xhr
   * 
   * @param {*} url 
   * @param {*} params 
   * 
   * Main xhr method to make requests
   */
  _xhr(url, params) {

    if(!url) {
      throw new Error('URL is required for request.');
    }

    return new Promise((resolve, reject) => {
      const _params = {
        ...this._config,
        ...params,
        headers: {
          ...this._config.headers,
          ...params.headers
        }
      };

      const _xhr = this.__xhr = new XMLHttpRequest();

      _xhr.open(_params.method, url);

      if(_params.headers) {
        Object.keys(_params.headers).forEach(_key => {
          _xhr.setRequestHeader(_key, _params.headers[_key]);
        });
      }

      _xhr.onerror = error => reject(error);

      _xhr.onload = () => {
        try {
          resolve(JSON.parse(_xhr.responseText));
        } catch (error) {
          reject(error)
        }
      }

      _xhr.send(_params.body);

    });
  }

  /**
   * get
   * 
   * @param {*} url 
   * @param {*} params 
   * 
   * Makes GET request
   */
  get(url, params) {
    return this._xhr(url, {
      ...params,
      method: 'GET'
    });
  }

  /**
   * post
   * 
   * @param {*} url 
   * @param {*} params 
   * 
   * Makes post request
   */
  post(url, params) {
    return this._xhr(url, {
      ...params,
      method: 'POST'
    });
  }

  /**
   * abort
   * 
   * Abort the current request
   */
  abort() {
    if(this.__xhr) {
      this.__xhr.abort();
    }
  }

  /**
   * throttle
   * 
   * @param {*} func 
   * @param {*} limit 
   * 
   * throttle the requests
   */
  throttle(func, limit) {
    let inThrottle = false;
    return (...args) => {
      if (!inThrottle) {
        func.apply(null, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  /**
   * debounce
   * 
   * @param {*} func 
   * @param {*} wait 
   * @param {*} immediate 
   * 
   * debounce the requests
   */
  debounce(func, wait, immediate = false) {
    let timeout;
    return (...args) => {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(null, args);
      };
      
      const callNow = immediate && !timeout;
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) {
        func.apply(null, args);
      }
    };
  };
}

export default new Request();