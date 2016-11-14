import * as catbox from './lib';

const policy = new catbox.Policy();

policy.get('test', function (err, value) {
  console.log(value);
});
