import Request from "superagent-bluebird-promise";
import Promise from "bluebird";
import qs from 'qs';

import Listing from "./Listing"
import Listings from "./Listings"
import Metrics from "./Metrics"
import SavedSearch from "./SavedSearch";
import Sessions from "./Sessions";
import User from "./User";
import Users from "./Users"

export default class Flippa {
  constructor(opts={}) {
    this.base_endpoint_url = opts.base_endpoint_url || "https://flippa.com/v3";
    this.access_token = opts.access_token || null;
  }

  get(endpoint, params) {
    var request = Request
      .get(this.base_endpoint_url + endpoint)
      .query(qs.stringify(params))
      .set("Accept", "application/json")

    this._setAuthorizationHeader(request);

    return request.promise();
  }

  post(endpoint, params, cookies={}) {
    var request = Request
      .post(this.base_endpoint_url + endpoint)
      .set("Accept", "application/json")
      .send(params)

    if (Object.keys(cookies).length !== 0) {
      const cookieString = Object.keys(cookies).reduce((acc, key) => {
        return `${acc}${key}=${cookies[key]};`;
      }, "");

      request.set("Cookie", cookieString);
    }

    this._setAuthorizationHeader(request);

    return request.promise();
  }

  del(endpoint) {
    var request = Request
      .del(this.base_endpoint_url + endpoint)
      .set("Accept", "application/json");

    this._setAuthorizationHeader(request);

    return request.promise();
  }

  authenticate(params, cookies={}) {
    return new Promise((resolve, reject) => {
      this
        .post("/oauth2/token", params, cookies)
        .then(res => {
          this.access_token = res.body.access_token;
          resolve(this);
        })
        .catch((err) => {
          reject(err)
        });
    });
  }

  listings() {
    return new Listings(this);
  }

  listing(listing_id) {
    return new Listing(this, listing_id);
  }

  metrics() {
    return new Metrics(this);
  }

  users() {
    return new Users(this);
  }

  user(user_id) {
    return new User(this, user_id);
  }

  saved_search(saved_search_id) {
    return new SavedSearch(this, saved_search_id);
  }

  sessions() {
    return new Sessions(this);
  }

  _setAuthorizationHeader(request) {
    if (this.access_token) {
      request.set("Authorization", `Bearer ${this.access_token}`);
    }
  }
};
