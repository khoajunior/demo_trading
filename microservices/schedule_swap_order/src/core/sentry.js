const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const {SENTRY_DNS} = require('../../constants/constants')

const st = {}

const init = () => {
  Sentry.init({
    dsn: SENTRY_DNS,
    tracesSampleRate: 1.0,
  });
  
  st.transaction = Sentry.startTransaction({
    op: "FX TOURNAMENT",
    name: "GKFX TOURNAMENT PROJECT",
  });

}

module.exports = {
  init,
  Sentry,
  SentryTrasaction: st.transaction
}