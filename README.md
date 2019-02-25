# Zomato API demonstration

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

## Implementation notes

### Setup

You will need to add a Zomato API key to App.js before running:

    this.API_KEY="ZOMATO_API_KEY_HERE";
	
### API considerations

A number of variations from the supplied design were necessary.

* The design called for checkboxes for Category selection, but the search API only allows for single category search.\
Single-select checkboxes were implemented for demonstration purposes.\
In a production project, I would recommend either revising designs to make single select more obvious (eg radio buttons),
or implement API middleware to cache and aggregate the data (see below) and allow multiple category searches.

* Categories and Cuisines in the design are a small subset of the available options.\
To keep with the provided design, these options have been hardcoded with the appropriate API values.\
A design revision would be necessary to accomodate arbitrary filtering options.

* API calls are limited to 20 results per query, and only return up to the first 100 results on repeat queries.\
To allow for effective filtering on rating and cost, queries re-call the API to get the full 100 results available.\
This results in a slower response, but provides more accurate data for filtering.
Caching middleware would allow for faster response.

* Phone numbers were featured in the design, but are unavailable without a Zomato partner account, so have not been included in the display.

* Opening hours were featured in the design, but seem to be unavailable in the public API at any level, so have not been included in the display.

### Further work

* This demonstration implementation exposes details of an external API to the end user,
and should ideally be proxied through a middleware service. This would also allow for caching of calls
and aggregation of multiple feeds into a common data set, which could make more data avilable to the user.\
Licencing terms and call limits for the external API service would need to be confirmed before implementation.\
This was deemed out of scope for this exercise.

* Some basic responsive adjustments were implemented to the provided design,
but a full mobile responsive layout was deemed out of scope for the exercise.