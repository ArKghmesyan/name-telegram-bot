import axios from 'axios';
import psl from 'psl';

// Utils
import { getJwtTokenById } from './utils/token';

export async function getBalance(id, currency = 'USD') {
  try {
    const token = await getJwtTokenById(id);
    // set the url
    const url = 'https://api.name.am/client/user';

    // request data object
    const data = {
      currency,
    };
    // set the headers
    const config = {
      headers: {
        Authorization: token,
      },
    };
    const res = await axios.put(url, data, config);
    return res;
  } catch (err) {
    console.error(err);
  }
}
export async function getNotifications(id) {
  try {
    const token = await getJwtTokenById(id);
    // set the url
    const url = 'https://api.name.am/client/user';

    // request data object
    // const data = '';
    // set the headers

    const config = {
      headers: {
        Authorization: token,
      },
    };
    const res = await axios.get(url, config);
    return res;
  } catch (err) {
    console.error(err);
  }
}
export async function putNotifications(id, data = '') {
  try {
    const token = await getJwtTokenById(id);
    // set the url
    const url = 'https://api.name.am/client/user/notifications';

    // request data object
    // const data = '';

    // set the headers
    const config = {
      headers: {
        Authorization: token,
      },
    };
    const res = await axios.put(url, data, config);
    return res;
  } catch (err) {
    console.error(err);
  }
}
export async function getDomains(id) {
  try {
    const token = await getJwtTokenById(id);
    // set the url
    const url = 'https://api.name.am/client/domains';

    // set the headers
    const config = {
      headers: {
        Authorization: token,
      },
    };
    const res = await axios.get(url, config);
    return res;
  } catch (err) {
    console.error(err);
  }
}
export async function getUser(id) {
  try {
    const token = await getJwtTokenById(id);
    // set the url
    const url = 'https://api.name.am/client/user';

    // set the headers
    const config = {
      headers: {
        Authorization: token,
      },
    };
    const res = await axios.get(url, config);
    return res;
  } catch (err) {
    console.error(err);
  }
}
export async function getHostings(id) {
  try {
    const token = await getJwtTokenById(id);
    // set the url
    const url = 'https://api.name.am/client/hostings';

    // set the headers
    const config = {
      headers: {
        Authorization: token,
      },
    };
    const res = await axios.get(url, config);
    return res;
  } catch (err) {
    console.error(err);
  }
}
export async function checkDomains(domain, tld) {
  try {
    // set the url
    const url = 'https://api.name.am/client/domains/check';

    // request data object
    const data = [
      {
        tld: tld,
        domain: domain,
      },
    ];

    const res = await axios.post(url, data);
    return res;
  } catch (err) {
    console.error(err);
  }
}
export async function registerDomains(id, domain) {
  try {
    const parsed = psl.parse(domain);

    const token = await getJwtTokenById(id);

    // set the url
    const url = 'https://api.name.am/client/carts/purchase';

    // request data object
    const data = [
      {
        name: parsed.tld,
        type: 'domain_registration',
        domain: parsed.domain,
        plan: {
          _id: '1_year_register',
        },
      },
    ];
    // set the headers
    const config = {
      headers: {
        Authorization: token,
      },
    };
    const res = await axios.post(url, data, config);
    return res.data;
  } catch (err) {
    console.error(err);
  }
}
