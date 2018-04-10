const cheerio = require('cheerio');
const dateFormat = require('dateformat');
const osmosis = require('osmosis');

async function getPriceForFlight ({ from, to, date, number }) {
  const flights = (await getFlights({
    from,
    to,
    departDate: dateFormat(date, 'mm/dd/yyyy', true)
  })).outbound;

  const options = flights.filter(f => f.number === number);
  const prices = options.map(f => f.price);
  console.log(Math.min(...prices));
  return Math.min(...prices);
}

async function getFlights ({ from, to, departDate, returnDate }) {
  const twoWay = Boolean(departDate && returnDate);
  const params = {
    twoWayTrip: twoWay,
    airTranRedirect: '',
    returnAirport: twoWay ? 'RoundTrip' : '',
    outboundTimeOfDay: 'ANYTIME',
    returnTimeOfDay: 'ANYTIME',
    seniorPassengerCount: 0,
    fareType: 'DOLLARS',
    originAirport: from,
    destinationAirport: to,
    outboundDateString: departDate,
    returnDateString: returnDate || '',
    adultPassengerCount: 1
  };

  const fares = { outbound: [] };

  if (twoWay) fares.return = [];

  const html = await getPage(params);
  const $ = cheerio.load(html);

  const domestic = $(`[name='outboundTrip']`);
  if (domestic.length) {
    domestic.toArray().forEach(e => parseTrip(e, fares.outbound));
    twoWay && $(`[name='inboundTrip']`).toArray().forEach(e => parseTrip(e, fares.return));
  } else {
    $(`[name='WDS_FLIGHT_OPTION_0']`).toArray().forEach(e => parseTrip(e, fares.outbound, true));
    twoWay && $(`[name='WDS_FLIGHT_OPTION_1']`).toArray().forEach(e => parseTrip(e, fares.return, true));
  }

  return fares;

  function parseTrip (e, dest, international = false) {
    const str = $(e).attr(international ? 'aria-label' : 'title')
      .replace(/\u200B/g, '')
      .replace(/\u00A0/g, ' ');
    console.log('------------------ New trip price ---------------');
    console.log('String: ', str);

    const flights_ = str.match(/flight ([^\s]+)/);
    const flights = flights_[1].split('/').join(',');
    console.log('flights: ', flights);

    const stops_ = str.match(/arrive (\w+)/);
    const stops = stops_[1] === 'Nonstop' ? 0 : parseInt(stops_[1], 10);
    console.log('stops: ', stops);

    const priceStr = $(e).siblings(international ? '.var.h5' : '.product_price').text().trim();

    const price_ = priceStr.match(/\$(\d+)/);
    let price = Infinity;
    if (price_ != null) {
      price = parseInt(price_[1], 10);
    }

    dest.push({
      number: flights,
      stops,
      price
    });
  }
}

async function getPage (params) {
  return new Promise(resolve => {
    osmosis
      .get('https://www.southwest.com')
      .submit('.booking-form--form', params)
      .then(doc => resolve(doc.toString()));
  });
}

module.exports = {
  getPriceForFlight,
  getFlights
};
