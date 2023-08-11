import conversation from './conversation';
import conversations from './conversations';
import endpoints from './endpoints';
import user from './user';
import text from './text';
import submission from './submission';
import search from './search';
import preset from './preset';
import token from './token';
import lang from './language';
import optionSettings from './optionSettings';
import reverseProxy from './reverse-proxy';

export default {
  ...conversation,
  ...conversations,
  ...endpoints,
  ...user,
  ...text,
  ...submission,
  ...search,
  ...preset,
  ...token,
  ...lang,
  ...optionSettings,
  ...reverseProxy,
};
