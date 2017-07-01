'use strict';

const BASE_RESPONSE = {
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
};

module.exports.hello = (event: any, context: any, callback: any) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };
  callback(null, response);
};

import { updateReview } from "./review-client";
module.exports.createReview = (event: any, context: any, callback: any) => {
  const p = JSON.parse(event.body);
  console.log(p);
  updateReview(p).then(data => {
    const response = {
      ...BASE_RESPONSE,
      body: JSON.stringify(data),
    };
    callback(null, response);
  })
  .catch(reason => {
    const response = {
      ...BASE_RESPONSE,
      statusCode: 400,
      body: JSON.stringify(reason),
    };
    callback(null, response);
  })
  ;
};
