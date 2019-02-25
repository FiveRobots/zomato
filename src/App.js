import React, { Component } from 'react';
import axios from 'axios'
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

import './App.css';
import CheckBoxGroup from './components/CheckBoxGroup';
import RestaurantMenu from './components/RestaurantMenu';

import spinner from './img/spinner.gif';

class App extends Component {
	
	constructor(props) {
		super(props);
		this.state = {
			filter: {
				//preset category list to match design requiremnets
				cat: [
					{value: 0, id: "2", label:  "Dining", isChecked: false},
					{value: 1, id: "5", label:  "Take Away", isChecked: false},
					{value: 2, id: "1", label:  "Delivery", isChecked: false},
					{value: 3, id: "11", label: "Pubs & Clubs", isChecked: false}
				],
				//preset cuisine list to match design requiremnets
				cuisine: [
					{value: 0, id: "1039", label: "Cafe Food", isChecked: false},
					{value: 1, id: "161", label:  "Coffee and Tea", isChecked: false},
					{value: 2, id: "82", label:   "Pizza", isChecked: false},
					{value: 3, id: "40", label:   "Fast Food", isChecked: false},
					{value: 4, id: "3", label:    "Asian", isChecked: false},
					{value: 5, id: "5", label:    "Bakery", isChecked: false},
					{value: 6, id: "55", label:   "Italian", isChecked: false},
					{value: 7, id: "304", label:  "Sandwich", isChecked: false},
					{value: 8, id: "25", label:   "Chinese", isChecked: false},
					{value: 9, id: "983", label:  "Pub Food", isChecked: false},
					{value: 10, id:"110", label:  "Other", isChecked: false}
				],
				selectedCat: "",
				selectedCuisines: "",
				selectedRatings: [0,5],
				selectedCost: [1,4],
			},
			selectedRestaurant: null,
			searchResults: [],
			displayResults: [],
			errorMessage: false,
			loading: false
			
		}
		
		this.API_URL="https://developers.zomato.com/api/v2.1/";
		this.API_KEY="ZOMATO_API_KEY_HERE";
		
		this.resultsRef = React.createRef();
	}
	
	componentDidMount = function() {
		// perform default search on load
		this.getRestaurants(this.state.selectedCat,this.state.selectedCuisines);
	}
	
	/* component bindings */
	
	// update category search filter based on checkbox selection
	selectCategory = function(event) {
		let v = event.target.value;
		let f = {...this.state.filter};

		// single select category (multiple category search unsupported by API)
		for(let i=0;i<f.cat.length;i++) {
			if(i.toString()===v) {
				f.cat[i].isChecked = !f.cat[i].isChecked;
				f.selectedCat = f.cat[i].isChecked ? f.cat[i].id : "";
			}
			else {
				f.cat[i].isChecked = false;
			}
		}
		
		this.setState({"filter":f});
		this.getRestaurants(f.selectedCat,f.selectedCuisines);
	}.bind(this);
	
	// update cuisine search filter based on checkbox selection
	selectCuisines = function(event) {
		let v = event.target.value;
		let f = {...this.state.filter};
		f.cuisine[v].isChecked = !f.cuisine[v].isChecked;
		
		// multiselect cuisine
		f.selectedCuisines = "";
		for(let i=0;i<f.cuisine.length;i++) {
			if(f.cuisine[i].isChecked) {
				if(i>0) { f.selectedCuisines += ","; }
				f.selectedCuisines += f.cuisine[i].id;
			}
		}
		
		this.setState({"filter":f});
		this.getRestaurants(f.selectedCat,f.selectedCuisines);
	}.bind(this);
	
	// update ratings range, then filter results
	selectRatings = function(event) {
		let f = {...this.state.filter};
		f.selectedRatings = event;
		this.setState({"filter":f});
		this.filterByRanges();
	}.bind(this);
	
	// update cost range, then filter results
	selectCost = function(event) {
		let f = {...this.state.filter};
		f.selectedCost = event;
		this.setState({"filter":f});
		this.filterByRanges();
	}.bind(this);
	
	// filter the current search results, limited by cost and rating
	filterByRanges = function() {
		let r = [...this.state.searchResults];
		let results = [];
		let validSelection = false;
		for(let i=0;i<r.length;i++) {
			// only include search results with values within range bounds
			if(r[i].restaurant.user_rating.aggregate_rating >= this.state.filter.selectedRatings[0] &&
				r[i].restaurant.user_rating.aggregate_rating <= this.state.filter.selectedRatings[1] &&
				r[i].restaurant.price_range >= this.state.filter.selectedCost[0] &&
				r[i].restaurant.price_range <= this.state.filter.selectedCost[1]) {
					if(this.state.selectedRestaurant === r[i].restaurant) {
						validSelection = true;
					}
					else {
						r[i].selected = false;
					}
					results.push(r[i]);	
			}
		}

		// after filtering, if current selectedRestaurant is not in the display list,
		// select the first restaurant in the list (or noneif no results)
		if(!validSelection) {
			let selectedId = null;
			if(results.length>0) {
				selectedId = results[0].restaurant.id;
			}
			setTimeout(function() {
				this.selectRestaurantById(selectedId);
			}.bind(this),0);
		}
		this.setState({"displayResults":results});
	}
	
	// select a single restaurant from the menu to display its details
	selectRestaurant = function(event) {
		this.selectRestaurantById(event.target.id);
	}.bind(this);
	
	selectRestaurantById = function(id) {
		let selected = null;
		let r = [...this.state.displayResults];
		
		if(id !== null) {
			for(let i=0;i<r.length;i++) {
				if(id === r[i].restaurant.id) {
					r[i].selected = true;
					selected = r[i].restaurant;
				}
				else {
					r[i].selected = false;
				}
			}
		}
		
		this.setState({"selectedRestaurant":selected,"displayResults":r});
		
	}.bind(this);
		
	
	/* Zomato API calls */
	
	getRestaurants = function(category, cuisines, page) {
		let api_url = this.API_URL+"search?entity_id=297&entity_type=city&count=20";
		if(page) { api_url += "&start="+(page*20); }
		if(category) { api_url += "&category="+category; }
		if(cuisines) { api_url += "&cuisines="+cuisines; }
		
		// reset search results
		let newResults = [];
		// if not first page of results, keep last results and append
		if(page && page > 0) {
			newResults = [...this.state.searchResults];
		}
		else {
			page = 0;
		}
		
		// display spinner while processing API results
		this.setState({"loading":true});
		
		let me = this;
		// get restaurant data from Zomato API
		axios.get(api_url, {
			responseType: 'json', 
			headers: {'user-key': this.API_KEY}
		}).then(function(response) {
			// store the full search results
			newResults = newResults.concat(response.data.restaurants);
			me.setState({"searchResults":newResults,"errorMessage":false});
			
			// if there are additional results (up to API's 100 limit),
			// recursively load additional data so that it can be filtered down
			if( (response.data.results_found>(page+1)*20) && page<4) {
				me.getRestaurants(category, cuisines, page+1);
			}
			else {
				// scroll results list to top after search
				me.resultsRef.current.scrollTop = 0;
				// filter search results for display
				me.filterByRanges();
				me.setState({"loading":false});
			}
		}).catch(function(error) {
			console.log("API Call error:",error);
			
			me.setState({"loading":false,
				"errorMessage":"Sorry, there was an error when searching for your results. Please try again later.",
				"searchResults":[],
				"displayResults":[]});
		});
		
	}.bind(this);
	
	render() {
		return (
			<div className="App">
				<header className="filters">
					<h1>Zomato Restaurant Search</h1>
					<section className="filter-category">
						<h2>Category</h2>
						<CheckBoxGroup name="cat" items={this.state.filter.cat} handleChange={this.selectCategory} />
					</section>
					<section className="filter-cuisine">
						<h2>Cuisine</h2>
						<CheckBoxGroup name="cuisine" items={this.state.filter.cuisine} handleChange={this.selectCuisines} />
					</section>
					<section className="filter-ranges">
						<h2>Rating</h2>
						<Range min={0} max={5} defaultValue={[0, 5]} marks={{ 0: 0, 5:5 }} onChange={this.selectRatings} onAfterChange={this.selectRatings} />
						<h2>Cost</h2>
						<Range min={1} max={4} defaultValue={[1, 4]} marks={{ 1: "$", 4:"$$$$" }} onChange={this.selectCost} onAfterChange={this.selectCost} />
					</section>
				</header>
				<main>
				{this.state.loading ?
					<div className="loading-overlay">
						<img className="loading-spinner" src={spinner} alt="Loading..." />
					</div>
				: null }
					
					<section className="results" ref={this.resultsRef}>
						<h2>Results</h2>
						{this.state.displayResults && this.state.displayResults.length > 0 ?
							<RestaurantMenu items={this.state.displayResults} handleClick={this.selectRestaurant} />
						: <div className="no-results">No matching results.</div> }
					</section>
					
					{this.state.selectedRestaurant ?
						<section className="restaurant">
							{this.state.selectedRestaurant.thumb ?
								<img className="restaurant-image" src={this.state.selectedRestaurant.thumb} alt="Restaurant photo" />
							:
								<div className="restaurant-noimage"><div className="spacer"></div></div>
							}
							<div className="restaurant-details">
								<h2 className="restaurant-name">{this.state.selectedRestaurant.name}</h2>
								<address className="restaurant-address">{this.state.selectedRestaurant.location.address}, SA</address>
								
								<ul className="restaurant-options">
									{this.state.selectedRestaurant.has_table_booking ? 
										<li className="restaurant-bookings available">Bookings available</li>
									:
										<li className="restaurant-bookings unavailable">No bookings</li>
									}
									{this.state.selectedRestaurant.has_online_delivery ? 
										<li className="restaurant-delivery available">Delivery available</li>
									:
										<li className="restaurant-delivery unavailable">No delivery</li>
									}
								</ul>
								<section>
									<h3>Cuisines</h3>
									<div className="restaurant-cuisines">{this.state.selectedRestaurant.cuisines}</div>
								</section>
								{/* Unavailable without a partner account
								<section>
									<h3>Phone Number</h3>
									<div className="restaurant-phone">XXXX XXXX</div>
								</section>
								*/}
								{/* Unavailable on the current public API
								<section>
									<h3>Opening Hours</h3>
									<div className="restaurant-hours">Today 9:00AM to 5PM</div>
								</section>
								*/}
							</div>
						</section>
					:
						<section className="no-restaurant">
							{this.state.errorMessage ?
								this.state.errorMessage
							:
								"Sorry, there are no restaurants that match your criteria."
							}
						</section>
					}
					<div className="clear-float"></div>
				</main>	
			</div>
		);
	}
}

export default App;