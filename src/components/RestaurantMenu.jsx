import React from 'react';

export const RestaurantMenu = props => {
	return (
		<ul>
			{
				props.items.map((item) => {
					return (<li className={item.selected ? "selected" : ""} key={item.restaurant.id} id={item.restaurant.id} onClick={props.handleClick}>{item.restaurant.name}</li>)
				})
			}
		</ul>
    )
}

export default RestaurantMenu