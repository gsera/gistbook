//
// ProfileRoute
//

import * as Radio from 'radio';
import Route from '../../vendor/routing/route';
import ProfileView from './views/profile-view';
import Gists from './entities/gists';
import GithubUser from '../../shared/entities/github-user';
import ServerErrorView from '../../shared/views/server-error-view';

export default Route.extend({
  fetch: function(urlData) {
    var user = Radio.request('user', 'user');
    var isSelf = urlData.params.username === user.get('login');

    var dataOptions = {};
    if (!isSelf) {
      dataOptions.collectionUrl = '/users/' + urlData.params.username + '/gists';
    }

    var Gistbooks = Gists.extend(dataOptions);
    this.gistbooks = new Gistbooks();

    this.githubUser = this._getUser(isSelf, urlData);

    var fetch = [this.gistbooks.fetch()];

    if (!isSelf) {
      fetch.push(this.githubUser.fetch());
    }

    return Promise.all(fetch);
  },

  onFetchError: function() {
    Radio.command('rootView', 'showIn:container', new ServerErrorView());
  },

  show: function(data, urlData) {
    var user = Radio.request('user', 'user');
    var username = urlData.params.username;
    var profileView = new ProfileView({
      model: this.githubUser,
      collection: this.gistbooks,
      isSelf: user.get('login') === username
    });
    Radio.command('rootView', 'showIn:container', profileView);
  },

  _getUser: function(isSelf, urlData) {
    if (isSelf) {
      return Radio.request('user', 'user');
    } else {
      return new GithubUser({
        id: urlData.params.username
      });
    }
  }
});
