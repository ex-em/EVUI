/* eslint-disable */

const apiData = {
  "_links": {
    "curies": [
      {
        "href": "https://developers.teleport.org/api/resources/Location/#!/relations/{rel}/",
        "name": "location",
        "templated": true
      },
      {
        "href": "https://developers.teleport.org/api/resources/City/#!/relations/{rel}/",
        "name": "city",
        "templated": true
      },
      {
        "href": "https://developers.teleport.org/api/resources/UrbanArea/#!/relations/{rel}/",
        "name": "ua",
        "templated": true
      },
      {
        "href": "https://developers.teleport.org/api/resources/Country/#!/relations/{rel}/",
        "name": "country",
        "templated": true
      },
      {
        "href": "https://developers.teleport.org/api/resources/Admin1Division/#!/relations/{rel}/",
        "name": "a1",
        "templated": true
      },
      {
        "href": "https://developers.teleport.org/api/resources/Timezone/#!/relations/{rel}/",
        "name": "tz",
        "templated": true
      }
    ],
    "self": {
      "href": "https://api.teleport.org/api/urban_areas/slug:chicago/scores/"
    }
  },
  "categories": [
    {
      "color": "#f3c32c",
      "name": "Housing",
      "score_out_of_10": 3.5745000000000005
    },
    {
      "color": "#f3d630",
      "name": "Cost of Living",
      "score_out_of_10": 3.8060000000000005
    },
    {
      "color": "#f4eb33",
      "name": "Startups",
      "score_out_of_10": 9.5575
    },
    {
      "color": "#d2ed31",
      "name": "Venture Capital",
      "score_out_of_10": 8.225
    },
    {
      "color": "#7adc29",
      "name": "Travel Connectivity",
      "score_out_of_10": 5.7815
    },
    {
      "color": "#36cc24",
      "name": "Commute",
      "score_out_of_10": 4.2015
    },
    {
      "color": "#19ad51",
      "name": "Business Freedom",
      "score_out_of_10": 8.671
    },
    {
      "color": "#0d6999",
      "name": "Safety",
      "score_out_of_10": 3.909500000000001
    },
    {
      "color": "#051fa5",
      "name": "Healthcare",
      "score_out_of_10": 6.151999999999998
    },
    {
      "color": "#150e78",
      "name": "Education",
      "score_out_of_10": 7.977
    },
    {
      "color": "#3d14a4",
      "name": "Environmental Quality",
      "score_out_of_10": 7.15375
    },
    {
      "color": "#5c14a1",
      "name": "Economy",
      "score_out_of_10": 6.506499999999999
    },
    {
      "color": "#88149f",
      "name": "Taxation",
      "score_out_of_10": 4.061
    },
    {
      "color": "#b9117d",
      "name": "Internet Access",
      "score_out_of_10": 7.388
    },
    {
      "color": "#d10d54",
      "name": "Leisure & Culture",
      "score_out_of_10": 8.2335
    },
    {
      "color": "#e70c26",
      "name": "Tolerance",
      "score_out_of_10": 6.158
    },
    {
      "color": "#f1351b",
      "name": "Outdoors",
      "score_out_of_10": 5.431
    }
  ],
  "summary": "<p>Chicago, Illinois, is among the best cities with a <b>vibrant startup scene</b>.\n\n    \n        According to our city rankings, this is a good place to live with high ratings in <b>venture capital</b>, <b>business freedom</b> and <b>education</b>.\n    \n\n    \n</p>\n\n\n    <p>Chicago is one of the top ten city matches for 5.5% of Teleport users.</p>\n",
  "teleport_city_score": 60.864999999999995
};

const apiCity = 'chicago';
const apiLowest = 'Housing';
const apiHighest = 'Startups';

export {
  apiData,
  apiLowest,
  apiHighest,
  apiCity
};
